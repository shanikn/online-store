# Create submission zip file
$tempFolder = "212737068_Shani_Knobel_FP25"
$zipName = "212737068_Shani_Knobel_FP25.zip"

Write-Host "Creating submission package..." -ForegroundColor Cyan

# Clean up if exists
if (Test-Path $tempFolder) {
    Remove-Item -Recurse -Force $tempFolder
}
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Create temp folder
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy required root files
Write-Host "Copying root files..." -ForegroundColor Yellow
Copy-Item "server.js" $tempFolder
Copy-Item "persist_module.js" $tempFolder
Copy-Item "test.js" $tempFolder
Copy-Item "package.json" $tempFolder

# Copy folders
Write-Host "Copying folders..." -ForegroundColor Yellow
Copy-Item "screens" -Destination $tempFolder -Recurse
Copy-Item "public" -Destination $tempFolder -Recurse
Copy-Item "data" -Destination $tempFolder -Recurse

# Remove debug files
Write-Host "Removing debug files..." -ForegroundColor Yellow
$debugFile1 = Join-Path $tempFolder "public\debug-menu.html"
$debugFile2 = Join-Path $tempFolder "public\force-close-menu.html"
if (Test-Path $debugFile1) { Remove-Item $debugFile1 }
if (Test-Path $debugFile2) { Remove-Item $debugFile2 }

# Create zip
Write-Host "Creating zip file..." -ForegroundColor Yellow
Compress-Archive -Path $tempFolder -DestinationPath $zipName

# Clean up temp folder
Remove-Item -Recurse -Force $tempFolder

# Show results
Write-Host ""
Write-Host "✅ SUCCESS! Submission zip created!" -ForegroundColor Green
Write-Host ""
Write-Host "File: $zipName" -ForegroundColor Cyan
$size = [Math]::Round((Get-Item $zipName).Length / 1KB, 2)
Write-Host "Size: $size KB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to submit! 🚀" -ForegroundColor Green
