// api/upload.js — Minimal Vercel serverless upload endpoint
// Requires ONLY: API_KEY stored in Vercel environment variables
// Install dependency:  npm install busboy

const Busboy = require("busboy");
const fs = require("fs");
const path = require("path");
const os = require("os");

const API_KEY = process.env.API_KEY || "";

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");   // optional: restrict later
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
}

module.exports = async (req, res) => {
  allowCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate API key
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized: invalid API key" });
  }

  const busboy = Busboy({ headers: req.headers });

  let category = "unknown";
  let fileInfo = null;

  const result = await new Promise((resolve, reject) => {
    busboy.on("field", (name, val) => {
      if (name === "category") category = val;
    });

    busboy.on("file", (name, file, info) => {
      const { filename, mimeType } = info;

      const safeName =
        category.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() +
        "_" +
        Date.now() +
        path.extname(filename);

      const savePath = path.join(os.tmpdir(), safeName);
      const writeStream = fs.createWriteStream(savePath);

      file.pipe(writeStream);

      file.on("end", () => {
        fileInfo = {
          filename: safeName,
          mimeType,
          path: savePath,
        };
      });

      writeStream.on("finish", () => resolve());
      writeStream.on("error", reject);
    });

    busboy.on("error", reject);
    req.pipe(busboy);
  });

  if (!fileInfo) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  return res.json({
    ok: true,
    category,
    file: fileInfo,
  });
};
