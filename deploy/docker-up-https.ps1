param(
  [Parameter(Mandatory = $false)]
  [string]$Domain
)

$ErrorActionPreference = "Stop"

if (-not $Domain) {
  $Domain = $env:DOMAIN
}

if (-not $Domain) {
  Write-Error "DOMAIN is required. Example: .\deploy\docker-up-https.ps1 -Domain example.com"
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$composeFile = Join-Path $root "docker-compose.https.yml"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not in PATH."
}

$env:DOMAIN = $Domain

Write-Host "Starting OptioHire HTTPS stack for domain: $Domain" -ForegroundColor Cyan
docker compose -f "$composeFile" up -d --build

Write-Host "`nServices status:" -ForegroundColor Cyan
docker compose -f "$composeFile" ps

Start-Sleep -Seconds 8

Write-Host "`nHealth endpoint check:" -ForegroundColor Cyan
try {
  $resp = Invoke-WebRequest -Uri "http://localhost/health" -Method GET -TimeoutSec 15
  if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
    Write-Host "OK: http://localhost/health is responding." -ForegroundColor Green
  } else {
    Write-Warning "Health endpoint returned status code $($resp.StatusCode)."
  }
}
catch {
  Write-Warning "Health endpoint is not ready yet. Check logs with:"
  Write-Host "docker compose -f `"$composeFile`" logs -f caddy backend frontend"
}

Write-Host "`nDone. Open: https://$Domain" -ForegroundColor Green
Write-Host "If DNS is still propagating, certificate issuance may take a few minutes."

