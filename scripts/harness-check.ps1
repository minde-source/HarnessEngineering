param(
  [switch]$SkipAudit
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [Parameter(Mandatory=$true)][string]$Name,
    [Parameter(Mandatory=$true)][scriptblock]$Command
  )

  Write-Host ""
  Write-Host "== $Name ==" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE."
  }
}

if (-not (Test-Path -LiteralPath "package.json")) {
  throw "package.json not found. Run this script from the project root."
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json
$scripts = $package.scripts

Invoke-Step "Git status" {
  git status --short
}

if ($scripts.PSObject.Properties.Name -contains "lint") {
  Invoke-Step "Lint" { npm.cmd run lint }
} else {
  Write-Host "Skip lint: package.json has no lint script." -ForegroundColor Yellow
}

if ($scripts.PSObject.Properties.Name -contains "test") {
  Invoke-Step "Test" { npm.cmd test }
} else {
  Write-Host "Skip test: package.json has no test script." -ForegroundColor Yellow
}

if ($scripts.PSObject.Properties.Name -contains "build") {
  Invoke-Step "Build" { npm.cmd run build }
} else {
  Write-Host "Skip build: package.json has no build script." -ForegroundColor Yellow
}

if (-not $SkipAudit) {
  Invoke-Step "Runtime audit" { npm.cmd audit --omit=dev --audit-level=high }
}

Write-Host ""
Write-Host "Harness check complete." -ForegroundColor Green
