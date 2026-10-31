# Read-only health check. No writes.
$RepoDir = Split-Path -Parent $PSScriptRoot
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$pass = 0; $warn = 0; $fail = 0

function Check($label, $status) {
  "{0,-45} {1}" -f $label, $status
  if ($status -eq "PASS") { $script:pass++ }
  elseif ($status -like "WARN*") { $script:warn++ }
  else { $script:fail++ }
}

if (Get-Command git -ErrorAction SilentlyContinue) { Check "git installed" "PASS" } else { Check "git installed" "FAIL" }
if (Get-Command gh -ErrorAction SilentlyContinue) { Check "gh CLI installed" "PASS" } else { Check "gh CLI installed" "WARN not found" }
try { gh auth status *> $null; if ($LASTEXITCODE -eq 0) { Check "gh authenticated" "PASS" } else { Check "gh authenticated" "WARN not logged in" } } catch { Check "gh authenticated" "WARN not logged in" }
if (Test-Path $ClaudeDir) { Check "~/.claude exists" "PASS" } else { Check "~/.claude exists" "FAIL" }
$claudeMd = Join-Path $ClaudeDir "CLAUDE.md"
if ((Test-Path $claudeMd) -and (Select-String -Path $claudeMd -Pattern "engineering-operating-system" -Quiet -ErrorAction SilentlyContinue)) { Check "global CLAUDE.md linked" "PASS" } else { Check "global CLAUDE.md linked" "WARN run install.ps1" }
if (Test-Path (Join-Path $RepoDir ".git")) { Check "repo is a git checkout" "PASS" } else { Check "repo is a git checkout" "FAIL" }

"---"
"PASS=$pass WARN=$warn FAIL=$fail"
if ($fail -gt 0) { exit 1 }
exit 0
