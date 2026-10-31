# Bootstrap: install approved global CLAUDE.md reference + report environment.
$ErrorActionPreference = "Stop"

$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$GlobalClaudeMd = Join-Path $ClaudeDir "CLAUDE.md"
$RepoDir = Split-Path -Parent $PSScriptRoot
$Marker = "# --- engineering-operating-system (managed, see below) ---"

Write-Host "== Engineering OS bootstrap =="

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host "FAIL: git not found"; exit 1 }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Write-Host "WARN: gh (GitHub CLI) not found" }
else {
  gh auth status *> $null
  if ($LASTEXITCODE -ne 0) { Write-Host "WARN: gh not authenticated. Run: gh auth login" }
}

New-Item -ItemType Directory -Force -Path $ClaudeDir | Out-Null

$alreadyLinked = (Test-Path $GlobalClaudeMd) -and (Select-String -Path $GlobalClaudeMd -Pattern ([regex]::Escape($Marker)) -Quiet -ErrorAction SilentlyContinue)

if ((Test-Path $GlobalClaudeMd) -and -not $alreadyLinked) {
  Copy-Item $GlobalClaudeMd "$GlobalClaudeMd.bak.$(Get-Date -UFormat %s)"
  Write-Host "Backed up existing $GlobalClaudeMd"
}

if (-not $alreadyLinked) {
  Add-Content -Path $GlobalClaudeMd -Encoding utf8 -Value @"

$Marker
See $RepoDir/CLAUDE.md for engineering standards, agents, and workflows that apply across all projects.
# --- end engineering-operating-system ---
"@
  Write-Host "Linked $GlobalClaudeMd -> $RepoDir/CLAUDE.md"
} else {
  Write-Host "Already linked, skipping."
}

Write-Host "== Done. Run bootstrap/doctor.ps1 to verify. =="
