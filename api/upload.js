// api/upload.js
// Vercel serverless function to accept an image and commit it to a GitHub repo
// IMPORTANT: Put secrets (GITHUB_TOKEN, REPO, API_KEY, ALLOWED_ORIGIN) in Vercel Environment Variables

export const config = {
  api: {
    bodyParser: false // we use multer to parse multipart/form-data
  }
};

import multer from "multer";
import Cors from "cors";
import path from "path";

// CORS middleware helper
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Configure CORS. Allowed origin is taken from env var ALLOWED_ORIGIN for security.
const cors = Cors({
  methods: ["POST"],
  origin: process.env.ALLOWED_ORIGIN || "*" // set ALLOWED_ORIGIN in Vercel env (recommended)
});

// Multer memory storage (no files written to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 } // 6 MB limit (adjust if needed)
});

const allowedCategories = new Set(["cardboard", "glass", "metal", "paper", "plastic", "trash"]);

export default async function handler(req, res) {
  try {
    // Run CORS middleware first
    await runMiddleware(req, res, cors);

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Simple API key check
    const clientKey = req.headers["x-api-key"];
    if (!clientKey || clientKey !== process.env.API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse multipart/form-data with multer
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Validate category
    const category = (req.body.category || "").toLowerCase();
    if (!allowedCategories.has(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate file
    if (!req.file || !req.file.buffer || !req.file.mimetype) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Uploaded file is not an image" });
    }

    // Build filename and path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const extFromMime = (req.file.mimetype.split("/")[1] || "jpg").split("+")[0];
    const filename = `${category}_${timestamp}.${extFromMime}`;
    const repoFolder = `Dataset/${category}`;
    const filePath = path.posix.join(repoFolder, filename); // e.g. Dataset/plastic/plastic_2025-11-23T...

    // Convert buffer to base64
    const base64Content = req.file.buffer.toString("base64");

    // GitHub API: get default branch
    const repo = process.env.REPO;
    if (!repo) {
      return res.status(500).json({ error: "Server misconfiguration: REPO not set" });
    }
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: "Server misconfiguration: GITHUB_TOKEN not set" });
    }

    const repoResp = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });

    if (!repoResp.ok) {
      const txt = await repoResp.text();
      return res.status(500).json({ error: `Failed to get repo info: ${repoResp.status} ${txt}` });
    }
    const repoJson = await repoResp.json();
    const branch = repoJson.default_branch || "main";

    // Put file into repo
    const putUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(filePath)}`;
    const commitMessage = `Add ${category} image ${filename}`;
    const putResp = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "recycle-dataset-uploader"
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch
      })
    });

    const putJson = await putResp.json();
    if (!putResp.ok) {
      // putJson often contains {message, documentation_url, errors}
      return res.status(500).json({ error: putJson.message || "GitHub upload failed", details: putJson.errors || null });
    }

    // Success
    return res.status(200).json({
      ok: true,
      content: putJson.content,
      commit: putJson.commit
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
