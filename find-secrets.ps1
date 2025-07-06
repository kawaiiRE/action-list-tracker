# Script to find all potential secrets in the repository
Write-Host "Scanning for potential secrets in the repository..." -ForegroundColor Yellow

# Define patterns for various types of secrets
$patterns = @(
    "AIza[0-9A-Za-z_-]{35}",  # Google API keys
    "AKIA[0-9A-Z]{16}",       # AWS Access Key ID
    "sk-[0-9A-Za-z]{48}",     # OpenAI API keys
    "pk_[0-9A-Za-z]{50}",     # Stripe public keys
    "rk_[0-9A-Za-z]{48}",     # Stripe restricted keys
    "Bearer [A-Za-z0-9_-]+",  # Bearer tokens
    "[a-zA-Z0-9_-]*[sS][eE][cC][rR][eE][tT][a-zA-Z0-9_-]*",  # Secret-like patterns
    "[a-zA-Z0-9_-]*[pP][aA][sS][sS][wW][oO][rR][dD][a-zA-Z0-9_-]*",  # Password-like patterns
    "[a-zA-Z0-9_-]*[tT][oO][kK][eE][nN][a-zA-Z0-9_-]*",  # Token-like patterns
    "[a-zA-Z0-9_-]*[kK][eE][yY][a-zA-Z0-9_-]*",  # Key-like patterns
    "-----BEGIN [A-Z ]+-----",  # Private keys
    "private_key",
    "client_secret",
    "auth_token",
    "access_token",
    "refresh_token"
)

Write-Host "Checking current working directory files..." -ForegroundColor Cyan

foreach ($pattern in $patterns) {
    Write-Host "Searching for pattern: $pattern" -ForegroundColor Gray
    
    # Search in all files (current state)
    $files = Get-ChildItem -Recurse -File | Where-Object { 
        $_.Name -notlike "*.git*" -and 
        $_.Name -notlike "node_modules*" -and 
        $_.Name -notlike "dist*" -and
        $_.Name -notlike "*.log"
    }
    
    foreach ($file in $files) {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match $pattern) {
                Write-Host "FOUND in file: $($file.FullName)" -ForegroundColor Red
                $matches = [regex]::Matches($content, $pattern)
                foreach ($match in $matches) {
                    Write-Host "  -> $($match.Value)" -ForegroundColor Yellow
                }
            }
        }
        catch {
            # Skip binary files or files that can't be read
        }
    }
}

Write-Host "`nChecking Git history for secrets..." -ForegroundColor Cyan

foreach ($pattern in $patterns) {
    Write-Host "Searching Git history for pattern: $pattern" -ForegroundColor Gray
    
    try {
        $gitResult = git log -p --all -S $pattern 2>$null
        if ($gitResult) {
            Write-Host "FOUND in Git history: $pattern" -ForegroundColor Red
        }
    }
    catch {
        # Git command failed, continue
    }
}

Write-Host "`nScan completed." -ForegroundColor Green
