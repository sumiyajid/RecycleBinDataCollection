# ♻️ Recycle Waste Dataset Collection App

A web application for collecting and categorizing waste images to build a recycling dataset. This app allows users to capture photos through their device camera and upload them to a GitHub repository, organized by waste category.

## 🚀 Features

- **6 Waste Categories**: Cardboard, Glass, Metal, Paper, Plastic, and Trash
- **Camera Integration**: Capture images directly from device camera
- **Auto-Upload Mode**: Automatic upload after capturing photos
- **Upload History**: Track your recent uploads with timestamps
- **Responsive Design**: Works on mobile and desktop devices
- **GitHub Integration**: Automatically uploads images to your GitHub repository

## 🔐 Security Solution

This version uses **environment variables** to store the GitHub token securely, preventing token exposure in public repositories.

## 📋 Prerequisites

1. A GitHub account
2. A GitHub Personal Access Token with `repo` permissions
3. A GitHub repository for storing the dataset
4. A Vercel account (free tier works fine)

## 🛠️ Setup Instructions

### Step 1: Generate GitHub Personal Access Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Recycle Dataset App")
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again!)

### Step 2: Prepare Your GitHub Repository

1. Create or use an existing repository (e.g., `sumiyajid/RecycleBinDataCollection`)
2. Ensure the repository has the following folder structure:
   ```
   Dataset/
   ├── cardboard/
   ├── glass/
   ├── metal/
   ├── paper/
   ├── plastic/
   └── trash/
   ```
3. You can create these folders manually or let the app create them automatically on first upload

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub First**:
   ```bash
   # Initialize git repository
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit: Recycle waste dataset collection app"
   
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Add Environment Variables** (Critical Step!):
   - In the Vercel project settings, go to "Settings" → "Environment Variables"
   - Add the following variables:
     
     | Name | Value | Example |
     |------|-------|---------|
     | `GITHUB_TOKEN` | Your GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
     | `GITHUB_REPO` | Your repository in format `username/repo` | `sumiyajid/RecycleBinDataCollection` |
     | `FOLDER_PATH` | Folder path in repo for uploads | `Dataset` |

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # Navigate to project directory
   cd recycle-waste-app
   
   # Deploy
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add GITHUB_TOKEN
   vercel env add GITHUB_REPO
   vercel env add FOLDER_PATH
   ```

5. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

## 📁 Project Structure

```
recycle-waste-app/
├── index.html           # Main HTML file with app interface
├── api/
│   └── config.js        # API endpoint to serve environment variables
├── vercel.json          # Vercel configuration
├── .gitignore           # Git ignore file
├── .env.example         # Example environment variables
└── README.md            # This file
```

## 🔒 Security Best Practices

1. **Never commit tokens**: The `.gitignore` file prevents `.env` files from being committed
2. **Use environment variables**: Tokens are stored in Vercel's environment variables
3. **Token rotation**: Regularly rotate your GitHub token
4. **Minimal permissions**: Only grant necessary repository access
5. **Monitor usage**: Check GitHub token usage regularly

## 🎯 Usage

1. Open the deployed app in your browser
2. Select a waste category (Cardboard, Glass, Metal, Paper, Plastic, or Trash)
3. Click "Start Camera" to access your device camera
4. Position the waste item in the camera frame
5. Click "Capture Photo" to take a picture
6. Review the captured image
7. Click "Send to Dataset" to upload to GitHub

### Auto-Upload Mode

Enable the "Auto-Upload" toggle to automatically upload photos immediately after capturing them, streamlining the collection process.

## 🐛 Troubleshooting

### "Failed to fetch configuration" Error
- **Cause**: Environment variables not set in Vercel
- **Solution**: Go to Vercel project settings → Environment Variables and add all required variables

### "GitHub image upload failed" Error
- **Cause**: Invalid token or insufficient permissions
- **Solution**: 
  1. Verify your GitHub token has `repo` scope
  2. Check that the repository name is correct (`username/repository`)
  3. Ensure the repository exists and is accessible

### Camera Not Working
- **Cause**: Browser permissions or HTTPS required
- **Solution**: 
  1. Grant camera permissions in browser
  2. Ensure you're accessing via HTTPS (Vercel provides this automatically)

### Images Not Appearing in Repository
- **Cause**: Incorrect folder path or repository name
- **Solution**: Verify `GITHUB_REPO` and `FOLDER_PATH` environment variables are correct

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token with repo scope | `ghp_1234567890abcdef` |
| `GITHUB_REPO` | Yes | Repository in format `username/repo` | `sumiyajid/RecycleBinDataCollection` |
| `FOLDER_PATH` | No | Base folder for uploads (default: "Dataset") | `Dataset` |

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built for environmental data collection
- Supports recycling research and AI model training
- Helps in waste classification projects

---

**Note**: Always keep your GitHub tokens secure and never share them publicly. If you suspect your token has been compromised, revoke it immediately and generate a new one.
