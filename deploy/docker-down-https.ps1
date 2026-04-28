param(
  [switch]$RemoveVolumes
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not in PATH."
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$composeFile = Join-Path $root "docker-compose.https.yml"

if ($RemoveVolumes) {
  Write-Host "Stopping OptioHire HTTPS stack and removing volumes..." -ForegroundColor Yellow
  docker compose -f "$composeFile" down -v
}
else {
  Write-Host "Stopping OptioHire HTTPS stack..." -ForegroundColor Yellow
  docker compose -f "$composeFile" down
}

if ($LASTEXITCODE -ne 0) {
  throw "Failed to stop Docker Compose stack."
}

Write-Host "Done." -ForegroundColor Green

