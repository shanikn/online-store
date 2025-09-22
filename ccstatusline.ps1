# Claude Code Status Line
# Simple status display for Claude Code

$currentDir = Split-Path -Leaf (Get-Location)
$gitBranch = ""

# Check if we're in a git repository
try {
    $gitBranch = git branch --show-current 2>$null
    if ($gitBranch) {
        $gitBranch = " | branch: $gitBranch"
    }
} catch {
    # Not in a git repo or git not available
}

# Calculate time until auto-compact with automatic session detection
# Claude Code auto-compacts based on conversation length and complexity
# Typical auto-compact occurs around 2-3 hours of active conversation
$sessionFile = Join-Path $env:TEMP 'claude_autocompact_timer.txt'
$sessionIdFile = Join-Path $env:TEMP 'claude_session_id.txt'

# Generate a session identifier based on current Claude Code process
$currentSessionId = ""
try {
    # Try to get Claude Code process info for session detection
    $claudeProcess = Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($claudeProcess) {
        $currentSessionId = "$($claudeProcess.Id)-$($claudeProcess.StartTime.ToString('yyyyMMdd-HHmmss'))"
    } else {
        # Fallback: use current hour as session identifier (new session each hour)
        $currentSessionId = (Get-Date).ToString("yyyyMMdd-HH")
    }
} catch {
    # Fallback: use current hour as session identifier
    $currentSessionId = (Get-Date).ToString("yyyyMMdd-HH")
}

# Check if this is a new session
$needsReset = $false
if (Test-Path $sessionIdFile) {
    $lastSessionId = Get-Content $sessionIdFile -ErrorAction SilentlyContinue
    if ($lastSessionId -ne $currentSessionId) {
        $needsReset = $true
    }
} else {
    $needsReset = $true
}

# If session file doesn't exist or we detected a new session, create/reset it
if (!(Test-Path $sessionFile) -or $needsReset) {
    (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") | Out-File $sessionFile -NoNewline
    $currentSessionId | Out-File $sessionIdFile -NoNewline
}

try {
    $sessionStart = Get-Date (Get-Content $sessionFile)
    $sessionDuration = (Get-Date) - $sessionStart
    # Auto-compact typically occurs around 2.5 hours of conversation
    $autoCompactThreshold = New-TimeSpan -Hours 2 -Minutes 30
    $remaining = $autoCompactThreshold - $sessionDuration

    if ($remaining.TotalMinutes -le 0) {
        $timeDisplay = "Auto-compact due"
    } else {
        $hours = [math]::Floor($remaining.TotalHours)
        $minutes = $remaining.Minutes
        if ($hours -gt 0) {
            $timeDisplay = "Auto-compact: ${hours}h ${minutes}m"
        } else {
            $timeDisplay = "Auto-compact: ${minutes}m"
        }
    }

    # Add indicator if this was a fresh session reset
    if ($needsReset -and $sessionDuration.TotalMinutes -lt 1) {
        $timeDisplay += " (NEW)"
    }
} catch {
    $timeDisplay = "Auto-compact: Unknown"
}

# Create 2-line status display without colors for Claude Code compatibility
$branchName = $gitBranch.Replace(' | branch: ', '')

# Line 1: Model and project info with separator
$line1 = "[Sonnet 4] | Project: $currentDir"

# Line 2: Branch and auto-compact timer (no icon prefix)
$line2 = "Branch: $branchName | $timeDisplay"

# Output both lines
Write-Host $line1
Write-Host -NoNewline $line2