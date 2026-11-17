param(
  [ValidateSet("start", "stop", "status", "init")]
  [string]$Action = "start"
)

$ErrorActionPreference = "Stop"

$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$PgData = Join-Path $env:LOCALAPPDATA "NEXORA\pgdata"
$PgLog = Join-Path $env:LOCALAPPDATA "NEXORA\pg.log"
$Port = 5434
$Database = "nexora"

function Test-PgReady {
  & "$PgBin\pg_isready.exe" -h localhost -p $Port *> $null
  return $LASTEXITCODE -eq 0
}

if ($Action -eq "init") {
  if (Test-Path $PgData) {
    Write-Host "Cluster sudah ada: $PgData"
    exit 0
  }
  New-Item -ItemType Directory -Force -Path (Split-Path $PgData) | Out-Null
  & "$PgBin\initdb.exe" -D $PgData -U postgres --auth=trust --encoding=UTF8 --locale=C
  Write-Host "Cluster dibuat: $PgData"
  exit 0
}

if ($Action -eq "start") {
  if (-not (Test-Path $PgData)) {
    New-Item -ItemType Directory -Force -Path (Split-Path $PgData) | Out-Null
    & "$PgBin\initdb.exe" -D $PgData -U postgres --auth=trust --encoding=UTF8 --locale=C | Out-Null
    Write-Host "Cluster dev dibuat: $PgData"
  }

  if (-not (Test-PgReady)) {
    & "$PgBin\pg_ctl.exe" -D $PgData -l $PgLog -o "-p $Port" start | Out-Null
    Start-Sleep -Seconds 2
  }

  if (Test-PgReady) {
    $exists = & "$PgBin\psql.exe" -w -h localhost -p $Port -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$Database'"
    if ($exists -ne "1") {
      & "$PgBin\createdb.exe" -h localhost -p $Port -U postgres $Database
      Write-Host "Database '$Database' dibuat."
    }
    Write-Host "PostgreSQL dev siap di localhost:$Port (database: $Database)"
  } else {
    Write-Error "PostgreSQL dev gagal start. Cek log: $PgLog"
  }
  exit 0
}

if ($Action -eq "stop") {
  if (Test-Path $PgData) {
    & "$PgBin\pg_ctl.exe" -D $PgData stop -m fast
  } else {
    Write-Host "Cluster dev belum dibuat."
  }
  exit 0
}

if ($Action -eq "status") {
  & "$PgBin\pg_isready.exe" -h localhost -p $Port
  exit $LASTEXITCODE
}
