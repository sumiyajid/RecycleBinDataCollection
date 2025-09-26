# Recycle Waste Dataset Collection - Setup Guide

## How the App Works

This HTML application allows users to:
1. Select a waste category (cardboard, glass, metal, paper, plastic, trash)
2. Take photos using their phone camera
3. Upload photos directly to your GitHub repository in the correct folder structure

## GitHub Token Setup (Required for Uploads)

### Step 1: Create a GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Tokens (classic)" → "Generate new token"
3. Set token permissions:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Generate and copy the token

### Step 2: Deploy to GitHub Pages

1. Upload these files to your GitHub repository:
   - `index.html` (the main application)
   - `SETUP.md` (this file)

2. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Click Save

3. Your app will be available at: `https://qubitpro.github.io/RecycleWaste/`

### Step 3: Use the Application

1. Open the GitHub Pages URL on your phone
2. Select waste category
3. Click "Start Camera" and allow camera permissions
4. Take a photo
5. Click "Send to Dataset"
6. Enter your GitHub Personal Access Token when prompted
7. Photo uploads to `Dataset/{category}/` folder automatically

## File Structure After Upload

```
RecycleWaste/
├── Dataset/
│   ├── cardboard/
│   │   ├── cardboard_2024-01-15T10-30-45Z.jpg
│   │   └── ...
│   ├── glass/
│   │   ├── glass_2024-01-15T10-31-20Z.jpg
│   │   └── ...
│   ├── metal/
│   ├── paper/
│   ├── plastic/
│   └── trash/
├── index.html
└── SETUP.md
```

## Mobile Usage

- Works best on mobile browsers
- Uses back camera by default
- Photos are automatically named with category and timestamp
- Uploads directly to GitHub repository

## Security Notes

- The GitHub token is requested each time for security
- Token is never stored in the application
- You can revoke the token anytime in GitHub settings
- Consider using a separate repository with restricted access if concerned about security

## Troubleshooting

**Upload fails:**
- Check GitHub token has `repo` permissions
- Verify repository name `QubitPro/RecycleWaste` is correct
- Ensure Dataset folders exist in your repository

**Camera doesn't work:**
- Check browser permissions
- Try using HTTPS (GitHub Pages is secure)
- Some browsers require user interaction to access camera

**Folder structure error:**
- Make sure Dataset folder exists in your repository
- Create empty category folders if needed: `Dataset/cardboard/`, `Dataset/glass/`, etc.