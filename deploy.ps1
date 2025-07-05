#!/usr/bin/env pwsh

# Deploy script for Action Tracker
# This script builds the project and deploys it to GitHub Pages using gh-pages

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes in source code
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Found uncommitted changes. Committing to main branch..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Update source code - $timestamp"
    
    # Push to main branch
    Write-Host "⬆️ Pushing changes to main branch..." -ForegroundColor Blue
    git push origin main
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to push to main branch" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Successfully pushed to main branch" -ForegroundColor Green
} else {
    Write-Host "✅ No uncommitted changes found" -ForegroundColor Green
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Deploy to gh-pages branch
Write-Host "🚀 Deploying to gh-pages branch..." -ForegroundColor Blue
$deployTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
gh-pages -d dist --dotfiles --message "Deploy to gh-pages - $deployTimestamp"

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app will be available at: https://kawaiiRE.github.io/action-list-tracker/" -ForegroundColor Cyan
    Write-Host "⏳ GitHub Pages deployment may take a few minutes to complete." -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
