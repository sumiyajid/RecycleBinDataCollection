export default function handler(req, res) {
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
}
