
$oldFiles = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { $_.FullName -notmatch "\.superpowers|\\_[1-8]\\|hi_tech_style" }

$oldTag1 = '<link rel="icon" type="image/png" href="/images/logo_premium.png">'
$oldTag2 = '<link rel="apple-touch-icon" href="/images/logo_premium.png">'
$oldTag3 = '<link rel="mask-icon" href="/images/logo_premium.png" color="#ffb0cc">'

$oldTag4 = '<link rel="icon" type="image/png" href="/images/logo_icon.png">'
$oldTag5 = '<link rel="apple-touch-icon" href="/images/logo_icon.png">'
$oldTag6 = '<link rel="mask-icon" href="/images/logo_icon.png" color="#ffb0cc">'

$newTag1 = '<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">'
$newTag2 = '<link rel="apple-touch-icon" href="/images/favicon.svg">'
$newTag3 = '<link rel="mask-icon" href="/images/favicon.svg" color="#ffb0cc">'

foreach ($file in $oldFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    $content = $content -replace [regex]::Escape($oldTag1), $newTag1
    $content = $content -replace [regex]::Escape($oldTag2), $newTag2
    $content = $content -replace [regex]::Escape($oldTag3), $newTag3
    
    $content = $content -replace [regex]::Escape($oldTag4), $newTag1
    $content = $content -replace [regex]::Escape($oldTag5), $newTag2
    $content = $content -replace [regex]::Escape($oldTag6), $newTag3
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.FullName)"
    }
}
