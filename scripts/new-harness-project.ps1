param(
  [Parameter(Mandatory=$true)][string]$Destination
)

$ErrorActionPreference = "Stop"
$skillRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $skillRoot "assets\starter-next-supabase"
$target = [IO.Path]::GetFullPath($Destination)

if (-not (Test-Path -LiteralPath $source)) {
  throw "Starter source was not found at $source"
}

if (Test-Path -LiteralPath $target) {
  $existing = Get-ChildItem -LiteralPath $target -Force
  if ($existing.Count -gt 0) {
    throw "Destination already contains files. Choose a new or empty directory."
  }
} else {
  New-Item -ItemType Directory -Path $target | Out-Null
}

Get-ChildItem -LiteralPath $source -Force |
  Where-Object { $_.Name -notin @("node_modules", ".next", "coverage") } |
  Copy-Item -Destination $target -Recurse
Write-Host "Starter copied to $target" -ForegroundColor Green
Write-Host "Next: copy .env.example to .env.local, then run npm install and npm run dev."
