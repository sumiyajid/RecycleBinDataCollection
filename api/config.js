// Vercel Serverless Function
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return configuration from environment variables
  res.status(200).json({
    githubToken: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO || 'sumiyajid/RecycleBinDataCollection',
    folderPath: process.env.FOLDER_PATH || 'Dataset'
  });
};

