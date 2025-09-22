# Garden-themed statusline (COMMENTED OUT - use ccstatusline for now)
# To reactivate: change settings.local.json statusLine command to:
# "powershell -NoProfile -ExecutionPolicy Bypass -File .claude/garden-status.ps1"
$cachePath = Join-Path $env:TEMP 'claude_garden_persistent.txt'
if (!(Test-Path $cachePath)) {
    '1' | Out-File $cachePath -NoNewline
}

$growth = [int](Get-Content $cachePath)
$growth++
$growth | Out-File $cachePath -NoNewline

$stage = [math]::Floor($growth / 10)

# Use Unicode code points for emojis to avoid encoding issues
switch ($stage) {
    0 { $plant = [System.Char]::ConvertFromUtf32(0x1F331) }  # 🌱
    1 { $plant = [System.Char]::ConvertFromUtf32(0x1F33F) }  # 🌿
    2 { $plant = [System.Char]::ConvertFromUtf32(0x1F343) }  # 🍃
    3 { $plant = [System.Char]::ConvertFromUtf32(0x1F333) }  # 🌳
    default { $plant = [System.Char]::ConvertFromUtf32(0x1F33A) }  # 🌺
}

if ($growth % 7 -eq 0) {
    $weather = [System.Char]::ConvertFromUtf32(0x1F327) + [System.Char]::ConvertFromUtf32(0xFE0F)  # 🌧️
} elseif ($growth % 5 -eq 0) {
    $weather = [System.Char]::ConvertFromUtf32(0x2600) + [System.Char]::ConvertFromUtf32(0xFE0F)   # ☀️
} else {
    $weather = [System.Char]::ConvertFromUtf32(0x26C5)  # ⛅
}

$folder = [System.Char]::ConvertFromUtf32(0x1F4C1)  # 📁
$statusText = "[Sonnet 4] $plant $weather Garden Lv.$stage | $folder online_store | Growth: $growth"
Write-Host -NoNewline $statusText