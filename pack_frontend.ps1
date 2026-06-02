# PowerShell Script to pack only the static frontend files for Host-0 deployment
# This avoids encoding issues with Cyrillic filenames and reduces size dramatically!

$projectName = "deploy.zip"
$projectRoot = Get-Location

Write-Host "=== Starting Woodman Steel FRONTEND ONLY Packager ===" -ForegroundColor Cyan

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

# List of folders to copy recursively
$folders = @(
    "api",
    "images",
    "js",
    "hi_tech_style",
    "industrial_precision",
    "iron_woodman_identity"
)

# Copy folders
foreach ($folder in $folders) {
    if (Test-Path "$projectRoot\$folder") {
        Write-Host "Copying folder: $folder..." -ForegroundColor Cyan
        Copy-Item -Path "$projectRoot\$folder" -Destination "$tempDir\$folder" -Recurse -Force
    }
}

# Copy specific safe static files from the root (NO Cyrillic, NO node_modules, NO sqlite)
$rootFiles = @(
    "*.html",
    "*.css",
    "logo.JPG",
    "industrial_404_bg_1778612131862.png",
    "catalog.pdf"
)

foreach ($pattern in $rootFiles) {
    Get-ChildItem -Path "$projectRoot" -Filter $pattern | ForEach-Object {
        Write-Host "Copying root file: $($_.Name)..." -ForegroundColor Cyan
        Copy-Item -Path $_.FullName -Destination $tempDir -Force
    }
}

# Copy .htaccess if it exists (for clean URLs on Apache)
if (Test-Path "$projectRoot\.htaccess") {
    Write-Host "Copying .htaccess..." -ForegroundColor Cyan
    Copy-Item -Path "$projectRoot\.htaccess" -Destination $tempDir -Force
}

# Compress temp directory using native tar for robust zip encoding
Write-Host "Compressing files into $projectName using tar..." -ForegroundColor Cyan
tar -cf "$projectRoot\$projectName" --format=zip -C $tempDir .

# Clean up temp directory
Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item $tempDir -Recurse -Force

Write-Host "=== Success! ===" -ForegroundColor Green
Write-Host "Your frontend-only package is ready: $projectRoot\$projectName" -ForegroundColor Green
Write-Host "Size is highly optimized and all Cyrillic encoding bugs are eliminated!" -ForegroundColor Yellow
