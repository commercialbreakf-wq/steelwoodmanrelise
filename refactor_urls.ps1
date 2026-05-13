
# =============================================================================
# URL REFACTORING SCRIPT — Железный Дровосек
# Maps old cryptic paths (_1, _2, ...) to logical page names
# =============================================================================

$root = "C:\Users\egas1\Downloads\Stitch_first"

Write-Host "=== STARTING URL REFACTORING ===" -ForegroundColor Cyan

# Step 1: Copy code.html files to new logical locations
$mappings = @(
    @{ From = "_1\code.html";  To = "calculator\index.html" },
    @{ From = "_2\code.html";  To = "certificates\index.html" },
    @{ From = "_4\code.html";  To = "fleet\index.html" },
    @{ From = "_5\code.html";  To = "catalog\index.html" },
    @{ From = "_6\code.html";  To = "services\index.html" },
    @{ From = "_7\code.html";  To = "about\index.html" },
    @{ From = "_8\code.html";  To = "contacts\index.html" }
)

foreach ($m in $mappings) {
    $src = Join-Path $root $m.From
    $dst = Join-Path $root $m.To
    $dstDir = Split-Path $dst -Parent
    
    if (!(Test-Path $dstDir)) {
        New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    }
    
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "  Copied: $($m.From) -> $($m.To)" -ForegroundColor Green
}

# Also copy certificate sub-pages from _2 to certificates/
$certFiles = @(
    "certificate_carbon.html",
    "certificate_eco.html", 
    "certificate_pipes.html",
    "certificate_stainless.html",
    "certificate_view.html"
)

foreach ($cf in $certFiles) {
    $src = Join-Path $root "_2\$cf"
    $dst = Join-Path $root "certificates\$cf"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "  Copied cert: _2\$cf -> certificates\$cf" -ForegroundColor Green
    }
}

Write-Host "`n=== FILES COPIED. Now replacing URLs in all HTML/JS files ===" -ForegroundColor Cyan

# Step 2: Replace all URL references in all HTML and JS files
$urlReplacements = @(
    # Old Stitch _N paths -> new logical paths
    @{ Old = '/_1/code.html';    New = '/calculator/' },
    @{ Old = '/_1/code';         New = '/calculator/' },
    @{ Old = '"/_2/code.html"';  New = '"/certificates/"' },
    @{ Old = "/_2/code.html";    New = '/certificates/' },
    @{ Old = '/_2/code';         New = '/certificates/' },
    @{ Old = '/_4/code.html';    New = '/fleet/' },
    @{ Old = '/_4/code';         New = '/fleet/' },
    @{ Old = '/_5/code.html';    New = '/catalog/' },
    @{ Old = '/_5/code';         New = '/catalog/' },
    @{ Old = '/_6/code.html';    New = '/services/' },
    @{ Old = '/_6/code';         New = '/services/' },
    @{ Old = '/_7/code.html';    New = '/about/' },
    @{ Old = '/_7/code';         New = '/about/' },
    @{ Old = '/_8/code.html';    New = '/contacts/' },
    @{ Old = '/_8/code';         New = '/contacts/' },
    # news.html -> /news/
    @{ Old = '/news.html';              New = '/news/' },
    @{ Old = '/news_trends_2026.html';  New = '/news/trends-2026/' },
    @{ Old = '/news_sheets_2026.html';  New = '/news/sheets-2026/' },
    @{ Old = '/news_market_adaptation.html'; New = '/news/market-adaptation/' },
    # cart, cabinet
    @{ Old = '/cart.html';      New = '/cart/' },
    @{ Old = '/cabinet.html';   New = '/cabinet/' },
    # catalog.html (old root file) if still referenced
    @{ Old = '/catalog.html';   New = '/catalog/' }
)

$files = Get-ChildItem -Path $root -Include "*.html","*.js" -Recurse -File |
         Where-Object { $_.FullName -notmatch '\\node_modules\\' -and 
                        $_.FullName -notmatch '\\_[0-9]\\' }

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    foreach ($r in $urlReplacements) {
        if ($content -like "*$($r.Old)*") {
            $content = $content.Replace($r.Old, $r.New)
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Updated: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "New URL structure:" -ForegroundColor Cyan
Write-Host "  /calculator/   (was /_1/code.html)" -ForegroundColor White
Write-Host "  /certificates/ (was /_2/code.html)" -ForegroundColor White
Write-Host "  /fleet/        (was /_4/code.html)" -ForegroundColor White
Write-Host "  /catalog/      (was /_5/code.html)" -ForegroundColor White
Write-Host "  /services/     (was /_6/code.html)" -ForegroundColor White
Write-Host "  /about/        (was /_7/code.html)" -ForegroundColor White
Write-Host "  /contacts/     (was /_8/code.html)" -ForegroundColor White
Write-Host "  /news/         (was /news.html)" -ForegroundColor White
Write-Host "  /cart/         (was /cart.html)" -ForegroundColor White
Write-Host "  /cabinet/      (was /cabinet.html)" -ForegroundColor White
