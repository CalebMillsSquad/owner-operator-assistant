$ErrorActionPreference = 'Stop'

$appDir = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$port = 3011
$appUrl = "http://localhost:$port"
$appToken = 'owner-operator-assistant-main'
$appName = 'TRUSTed Dispatching'

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (-not $nodeCommand -or -not $npmCommand) {
  Write-Host '[ERROR] Node.js is not available in PATH. Install Node.js first.'
  exit 1
}

if (-not (Test-Path (Join-Path $appDir 'node_modules'))) {
  Write-Host '[INFO] Installing local dependencies...'
  & $npmCommand.Source install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[ERROR] Dependency installation failed. Review the npm output above.'
    exit 1
  }
}

$nextCli = Join-Path $appDir 'node_modules\next\dist\bin\next'
if (-not (Test-Path $nextCli)) {
  Write-Host '[ERROR] The local Next.js runtime is missing. Run: npm install'
  exit 1
}

$existing = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
$existingPid = $existing | Select-Object -First 1 -ExpandProperty OwningProcess

if ($existingPid) {
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$existingPid" -ErrorAction SilentlyContinue
  if ($null -ne $proc -and $proc.CommandLine -like "*$appToken*") {
    Write-Host "[INFO] App server already running at $appUrl (PID $existingPid)."
  }
  else {
    Write-Host "[ERROR] TCP port $port is occupied by an unrelated process (PID $existingPid)."
    if ($null -ne $proc) {
      Write-Host "ProcessName=$($proc.Name)"
      Write-Host "CommandLine=$($proc.CommandLine)"
    }
    exit 1
  }
} else {
  Write-Host "[INFO] Starting $appName on port $port..."
  $serverArguments = @("`"$nextCli`"", 'dev', "`"$appDir`"", '--port', "$port")
  Start-Process -WindowStyle Minimized -FilePath $nodeCommand.Source -ArgumentList $serverArguments -WorkingDirectory $appDir | Out-Null
}

Write-Host "[INFO] Waiting for application to respond at $appUrl"
for ($i = 0; $i -lt 80; $i++) {
  try {
    $status = (Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2).StatusCode
    if ($status -ge 200 -and $status -lt 500) {
      Write-Host "[INFO] $appName is ready at $appUrl"
      Start-Process $appUrl | Out-Null
      Write-Host "[INFO] Launched: $appUrl"
      exit 0
    }
  } catch {}
  Start-Sleep -Seconds 1
}

Write-Host '[ERROR] Server did not respond in time.'
exit 1
