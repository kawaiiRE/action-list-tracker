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
    Write-Host "📝 Found uncommitted changes. You may want to commit them first." -ForegroundColor Yellow
    Write-Host "Current changes:" -ForegroundColor Yellow
    git status --short
    $response = Read-Host "Do you want to continue with deployment? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to gh-pages branch
Write-Host "🚀 Deploying to gh-pages branch..." -ForegroundColor Blue
npx gh-pages -d dist --dotfiles

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app will be available at: https://kawaiiRE.github.io/action-list-tracker/" -ForegroundColor Cyan
    Write-Host "⏳ GitHub Pages deployment may take a few minutes to complete." -ForegroundColor Yellow
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
