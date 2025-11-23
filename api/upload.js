// api/upload.js - Vercel Serverless upload handler (Busboy + optional S3)
// Requirements: npm install busboy aws-sdk uuid
// Env vars to set in Vercel: API_KEY, (optional) AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME

const Busboy = require('busboy');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');

const API_KEY = process.env.API_KEY || ''; // set this in Vercel dashboard
const S3_BUCKET = process.env.S3_BUCKET_NAME || null;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && S3_BUCKET) {
  AWS.config.update({ region: AWS_REGION });
  s3 = new AWS.S3();
}

/**
 * Helper: stream -> buffer
 * but we intentionally collect buffers for small images (typical upload ~ < 10MB).
 */
function collectFile(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (d) => chunks.push(d));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function sendCorsOptions(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // tighten for production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.status(204).end();
}

module.exports = async (req, res) => {
  // Simple CORS preflight handling
  if (req.method === 'OPTIONS') return sendCorsOptions(res);

  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API key validation
  const key = (req.headers['x-api-key'] || '').toString();
  if (!API_KEY || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - missing or invalid x-api-key' });
  }

  // Quick sanity: ensure content-type is multipart
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Expected multipart/form-data' });
  }

  try {
    const bb = Busboy({ headers: req.headers });
    let fields = {};
    let fileSaved = null;

    // we'll only accept the first file field named "image" (same name as your frontend)
    bb.on('field', (fieldname, val) => {
      // collect category and any other small metadata
      fields[fieldname] = val;
    });

    // file handler
    bb.on('file', async (fieldname, fileStream, info) => {
      const { filename: originalFilename, mimeType } = info;
      // collect the file into memory (ok for typical images; if you expect huge files, stream to S3 directly)
      const buffer = await collectFile(fileStream);
      // Create a unique filename
      const ext = path.extname(originalFilename) || '.jpg';
      const safeCategory = (fields.category || 'unknown').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
      const filename = `${safeCategory}_${Date.now()}_${uuidv4()}${ext}`;

      if (s3) {
        // Upload to S3
        const params = {
          Bucket: S3_BUCKET,
          Key: filename,
          Body: buffer,
          ContentType: mimeType || 'application/octet-stream',
          ACL: 'private' // change to 'public-read' if you want public URLs (consider security)
        };
        const s3res = await s3.upload(params).promise();
        fileSaved = {
          storage: 's3',
          filename,
          size: buffer.length,
          mimeType,
          s3Location: s3res.Location,
          s3Key: s3res.Key
        };
      } else {
        // Save to ephemeral /tmp (Vercel supports /tmp for functions)
        const tmpPath = path.join(os.tmpdir(), filename);
        await fs.promises.writeFile(tmpPath, buffer);
        fileSaved = {
          storage: 'tmp',
          filename,
          size: buffer.length,
          mimeType,
          tmpPath
        };
      }
    });

    // Wait until finished
    await new Promise((resolve, reject) => {
      bb.on('finish', resolve);
      bb.on('error', reject);
      req.pipe(bb);
    });

    if (!fileSaved) return res.status(400).json({ error: 'No file uploaded' });

    // Response
    // Add headers for CORS (for quick testing). In production, restrict origin.
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({
      ok: true,
      category: fields.category || null,
      meta: fileSaved
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Internal server error' });
  }
};
