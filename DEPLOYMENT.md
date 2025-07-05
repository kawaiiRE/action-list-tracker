# Deployment Guide

This project supports multiple deployment methods to GitHub Pages using the `gh-pages` branch.

## Prerequisites

Make sure you have the following installed:
- Node.js (version 18 or higher)
- npm
- Git

## Deployment Methods

### Method 1: Using npm scripts (Recommended)

1. **Quick Deploy**: Build and deploy in one command
   ```bash
   npm run deploy
   ```

2. **Deploy with cleanup**: Deploy and remove source maps
   ```bash
   npm run deploy:clean
   ```

3. **Deploy source changes**: Push source code changes to main branch
   ```bash
   npm run deploy:source
   ```

### Method 2: Using PowerShell script (Windows)

Run the PowerShell script:
```powershell
.\deploy.ps1
```

This script will:
- Check for uncommitted changes
- Build the project
- Deploy to gh-pages branch
- Provide deployment status

### Method 3: Using Batch script (Windows)

Run the batch file:
```cmd
deploy.bat
```

### Method 4: Manual deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to gh-pages:
   ```bash
   npx gh-pages -d dist --dotfiles
   ```

## Deployment Process

The deployment process:

1. **Build**: Creates production-ready files in the `dist` folder
2. **Deploy**: Pushes the `dist` folder contents to the `gh-pages` branch
3. **GitHub Pages**: GitHub automatically serves the content from the `gh-pages` branch

## Accessing the Deployed Application

After deployment, your application will be available at:
```
https://kawaiiRE.github.io/action-list-tracker/
```

**Note**: GitHub Pages deployment may take 1-5 minutes to propagate changes.

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you have write access to the repository
2. **Branch Not Found**: The gh-pages branch will be created automatically on first deployment
3. **Build Errors**: Check the build output for any compilation errors
4. **404 Error**: The SPA routing is handled by the included 404.html file

### Deployment Verification

To verify deployment was successful:
1. Check the `gh-pages` branch in your GitHub repository
2. Visit the GitHub Pages URL
3. Check the GitHub repository's Pages settings

## Environment Variables

Make sure your environment variables are properly set:
- Create a `.env` file in the root directory
- Use `VUE_APP_` prefix for all environment variables
- Example: `VUE_APP_FIREBASE_API_KEY=your-api-key`

## GitHub Pages Configuration

The project is configured for GitHub Pages with:
- Base URL: `/action-list-tracker/`
- SPA routing support via 404.html
- Proper asset paths for production

## Scripts Explained

- `npm run serve`: Start development server
- `npm run build`: Build for production
- `npm run deploy`: Build and deploy to gh-pages
- `npm run deploy:clean`: Deploy with cleanup
- `npm run deploy:source`: Push source changes to main branch
