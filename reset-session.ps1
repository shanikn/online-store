# Reset Claude Code Auto-Compact Timer
# Run this when you start a new Claude Code session

$sessionFile = Join-Path $env:TEMP 'claude_autocompact_timer.txt'

# Delete existing session file and create new one
if (Test-Path $sessionFile) {
    Remove-Item $sessionFile
}

(Get-Date).ToString("yyyy-MM-dd HH:mm:ss") | Out-File $sessionFile -NoNewline
Write-Host "Auto-compact timer reset. New session started at $(Get-Date -Format 'HH:mm')"
Write-Host "Auto-compact expected in approximately 2.5 hours"