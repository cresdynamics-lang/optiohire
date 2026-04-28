param(
  [string[]]$Services
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not in PATH."
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$composeFile = Join-Path $root "docker-compose.https.yml"
$serviceList = @()

if ($Services -and $Services.Length -gt 0) {
  foreach ($entry in $Services) {
    $parts = $entry -split ","
    foreach ($part in $parts) {
      $trimmed = $part.Trim()
      if ($trimmed) {
        $serviceList += $trimmed
      }
    }
  }
}

if ($serviceList.Length -gt 0) {
  Write-Host "Tailing logs for: $($serviceList -join ', ')" -ForegroundColor Cyan
  docker compose -f "$composeFile" logs -f --tail=150 @serviceList
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to tail logs for selected services."
  }
}
else {
  Write-Host "Tailing logs for caddy, backend, frontend..." -ForegroundColor Cyan
  docker compose -f "$composeFile" logs -f --tail=150 caddy backend frontend
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to tail default service logs."
  }
}

