@echo off
echo 🚀 Starting deployment process...

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Error: Not in a git repository!
    pause
    exit /b 1
)

REM Check for uncommitted changes and commit them
echo 📝 Checking for uncommitted changes...
git add .
git commit -m "Update source code - %date% %time%"

REM Push to main branch (ignore errors if nothing to push)
echo ⬆️ Pushing changes to main branch...
git push origin main

REM Build the project
echo 🔨 Building the project...
call npm run build

if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Deploy to gh-pages branch
echo 🚀 Deploying to gh-pages branch...
call npx gh-pages -d dist --dotfiles

if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ✅ Deployment successful!
echo 🌐 Your app will be available at: https://kawaiiRE.github.io/action-list-tracker/
echo ⏳ GitHub Pages deployment may take a few minutes to complete.
pause
