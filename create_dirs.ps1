$root = "C:\Users\egas1\Downloads\Stitch_first"

# Create news/ directory structure
New-Item -ItemType Directory -Path "$root\news" -Force | Out-Null
Copy-Item "$root\news.html" "$root\news\index.html" -Force

New-Item -ItemType Directory -Path "$root\news\trends-2026" -Force | Out-Null
New-Item -ItemType Directory -Path "$root\news\sheets-2026" -Force | Out-Null
New-Item -ItemType Directory -Path "$root\news\market-adaptation" -Force | Out-Null
Copy-Item "$root\news_trends_2026.html" "$root\news\trends-2026\index.html" -Force
Copy-Item "$root\news_sheets_2026.html" "$root\news\sheets-2026\index.html" -Force
Copy-Item "$root\news_market_adaptation.html" "$root\news\market-adaptation\index.html" -Force

# Create cart/ directory
New-Item -ItemType Directory -Path "$root\cart" -Force | Out-Null
Copy-Item "$root\cart.html" "$root\cart\index.html" -Force

# Create cabinet/ directory
New-Item -ItemType Directory -Path "$root\cabinet" -Force | Out-Null
Copy-Item "$root\cabinet.html" "$root\cabinet\index.html" -Force

# Update URLs inside the newly created files too
$urlReplacements = @(
    @{ Old = '/_1/code.html';    New = '/calculator/' },
    @{ Old = '/_1/code';         New = '/calculator/' },
    @{ Old = '/_2/code.html';    New = '/certificates/' },
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
    @{ Old = '/news.html';              New = '/news/' },
    @{ Old = '/news_trends_2026.html';  New = '/news/trends-2026/' },
    @{ Old = '/news_sheets_2026.html';  New = '/news/sheets-2026/' },
    @{ Old = '/news_market_adaptation.html'; New = '/news/market-adaptation/' },
    @{ Old = '/cart.html';      New = '/cart/' },
    @{ Old = '/cabinet.html';   New = '/cabinet/' },
    @{ Old = '/catalog.html';   New = '/catalog/' }
)

$newFiles = @(
    "$root\news\index.html",
    "$root\news\trends-2026\index.html",
    "$root\news\sheets-2026\index.html",
    "$root\news\market-adaptation\index.html",
    "$root\cart\index.html",
    "$root\cabinet\index.html",
    "$root\calculator\index.html",
    "$root\certificates\index.html",
    "$root\fleet\index.html",
    "$root\catalog\index.html",
    "$root\services\index.html",
    "$root\about\index.html",
    "$root\contacts\index.html"
)

foreach ($file in $newFiles) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        $modified = $false
        foreach ($r in $urlReplacements) {
            if ($content -like "*$($r.Old)*") {
                $content = $content.Replace($r.Old, $r.New)
                $modified = $true
            }
        }
        if ($modified) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  Updated: $file" -ForegroundColor Yellow
        }
    }
}

Write-Host "All done!" -ForegroundColor Green
