$ErrorActionPreference = 'Stop'

$port = 3011
$appToken = 'owner-operator-assistant-main'
$found = $false

$listeners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
foreach ($conn in $listeners) {
  $connectionPid = $conn.OwningProcess
  if (-not $connectionPid) { continue }
  $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$connectionPid" -ErrorAction SilentlyContinue
  if ($null -ne $proc -and $proc.CommandLine -like "*$appToken*") {
    Write-Host "[INFO] Stopping app process $connectionPid on port $port"
    taskkill.exe /PID $connectionPid /T /F | Out-Null
    $found = $true
  }
}

if ($found) {
  Write-Host '[INFO] App stopped.'
} else {
  Write-Host "[INFO] No running $appToken dev server found on port $port."
}
