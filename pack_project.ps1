# PowerShell Script to automatically package the project for Reg.ru deployment
# Run this script in PowerShell: .\pack_project.ps1

$projectName = "deploy.zip"
$projectRoot = Get-Location

Write-Host "=== Starting Woodman Steel Project Packager ===" -ForegroundColor Cyan

# Remove old archive if exists
if (Test-Path "$projectRoot\$projectName") {
    Write-Host "Removing existing $projectName..." -ForegroundColor Yellow
    Remove-Item "$projectRoot\$projectName" -Force
}

# Create a temporary directory for packaging
$tempDir = "$projectRoot\deploy_temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# List of files and folders to include
$includes = @(
    "api",
    "deploy",
    "images",
    "js",
    "hi_tech_style",
    "industrial_precision",
    "iron_woodman_identity",
    "*.html",
    "*.js",
    "*.json",
    "*.xml",
    "*.png",
    "*.JPG",
    "README.md",
    ".htaccess"
)

# Copy files to temp directory
Write-Host "Collecting files for deployment..." -ForegroundColor Cyan
foreach ($pattern in $includes) {
    Get-ChildItem -Path "$projectRoot" -Filter $pattern | ForEach-Object {
        $dest = Join-Path $tempDir $_.Name
        if ($_.PsIsContainer) {
            Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
        } else {
            Copy-Item -Path $_.FullName -Destination $tempDir -Force
        }
    }
}

# Exclude specific heavy/dev files from temp directory if copied
$excludeTemp = @("package-lock.json", "database.sqlite")
foreach ($file in $excludeTemp) {
    if (Test-Path "$tempDir\$file") {
        Remove-Item "$tempDir\$file" -Force
    }
}

# Add standard placeholder .env if not present
if (-not (Test-Path "$tempDir\.env")) {
    Write-Host "Adding clean .env template to archive..." -ForegroundColor Yellow
    $envContent = @"
SUPABASE_URL=https://drbknuvnsyonmeudoleo.supabase.co
SUPABASE_SERVICE_KEY=
SUPABASE_ANON_KEY=
SMTP_PASS=
ADMIN_EMAILS=commercialbreakf@gmail.com
NODE_ENV=production
PORT=3000
"@
    Set-Content -Path "$tempDir\.env" -Value $envContent
}

# Compress temp directory
Write-Host "Compressing files into $projectName..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath "$projectRoot\$projectName" -Force

# Clean up temp directory
Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item $tempDir -Recurse -Force

Write-Host "=== Success! ===" -ForegroundColor Green
Write-Host "Your package is ready: $projectRoot\$projectName" -ForegroundColor Green
Write-Host "You only need to upload this single file to your Reg.ru server!" -ForegroundColor Yellow
