param(
  [Parameter(Mandatory = $true)]
  [string]$ZoneName,

  [Parameter(Mandatory = $true)]
  [string]$RoutePattern,

  [string]$WorkerName = "upstream-monitor",
  [string]$KvNamespaceTitle = "upstream_monitor_data",
  [string]$AdminUser = "admin",
  [string]$AdminPassword = "",
  [string]$EncryptionSecret = "",
  [string]$CloudflareApiToken = "",
  [string]$CloudflareApiTokenFile = "",
  [string]$WorkerDir = ""
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPath([string]$PathValue) {
  if ([System.IO.Path]::IsPathRooted($PathValue)) { return $PathValue }
  return Join-Path (Split-Path $PSScriptRoot -Parent) $PathValue
}

function Read-Token {
  if (![string]::IsNullOrWhiteSpace($CloudflareApiToken)) { return $CloudflareApiToken.Trim() }
  if (![string]::IsNullOrWhiteSpace($CloudflareApiTokenFile)) {
    $path = Resolve-RepoPath $CloudflareApiTokenFile
    if (!(Test-Path -LiteralPath $path)) { throw "Cloudflare token file not found: $path" }
    return ([System.IO.File]::ReadAllText($path)).Trim()
  }
  if (![string]::IsNullOrWhiteSpace($env:CLOUDFLARE_API_TOKEN)) { return $env:CLOUDFLARE_API_TOKEN.Trim() }
  throw "Set -CloudflareApiToken, -CloudflareApiTokenFile, or CLOUDFLARE_API_TOKEN."
}

function New-RandomSecret([int]$Bytes = 32) {
  $buffer = [byte[]]::new($Bytes)
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($buffer) } finally { $rng.Dispose() }
  return [Convert]::ToBase64String($buffer)
}

function Invoke-CfApi([string]$Method, [string]$Path, $Body = $null) {
  $headers = @{
    Authorization = "Bearer $script:CloudflareToken"
    "Content-Type" = "application/json"
  }
  $args = @{
    Method = $Method
    Uri = "https://api.cloudflare.com/client/v4$Path"
    Headers = $headers
  }
  if ($null -ne $Body) { $args.Body = ($Body | ConvertTo-Json -Depth 20) }
  $response = Invoke-RestMethod @args
  if (-not $response.success) {
    $messages = @($response.errors | ForEach-Object { $_.message }) -join "; "
    throw "Cloudflare API failed: $messages"
  }
  return $response.result
}

function Ensure-WorkerRoute([string]$ZoneNameValue, [string]$Pattern, [string]$ScriptName) {
  $zones = @(Invoke-CfApi "GET" "/zones?name=$([uri]::EscapeDataString($ZoneNameValue))&per_page=50")
  if ($zones.Count -lt 1) { throw "Cloudflare zone not found: $ZoneNameValue" }
  $zone = $zones[0]
  $routes = @(Invoke-CfApi "GET" "/zones/$($zone.id)/workers/routes?per_page=100")
  $route = $routes | Where-Object { $_.pattern -eq $Pattern } | Select-Object -First 1
  $body = @{ pattern = $Pattern; script = $ScriptName }
  if ($route) {
    Invoke-CfApi "PUT" "/zones/$($zone.id)/workers/routes/$($route.id)" $body | Out-Null
    Write-Host "Updated Worker route: $Pattern -> $ScriptName"
    return
  }
  Invoke-CfApi "POST" "/zones/$($zone.id)/workers/routes" $body | Out-Null
  Write-Host "Created Worker route: $Pattern -> $ScriptName"
}

function Ensure-ProxiedDnsRecord([string]$ZoneNameValue, [string]$HostName) {
  $zones = @(Invoke-CfApi "GET" "/zones?name=$([uri]::EscapeDataString($ZoneNameValue))&per_page=50")
  if ($zones.Count -lt 1) { throw "Cloudflare zone not found: $ZoneNameValue" }
  $zone = $zones[0]
  $records = @(Invoke-CfApi "GET" "/zones/$($zone.id)/dns_records?type=CNAME&name=$([uri]::EscapeDataString($HostName))&per_page=20")
  $body = @{ type = "CNAME"; name = $HostName; content = "workers.dev"; ttl = 1; proxied = $true }
  if ($records.Count -gt 0) {
    Invoke-CfApi "PUT" "/zones/$($zone.id)/dns_records/$($records[0].id)" $body | Out-Null
    Write-Host "Updated DNS record: $HostName -> workers.dev"
    return
  }
  Invoke-CfApi "POST" "/zones/$($zone.id)/dns_records" $body | Out-Null
  Write-Host "Created DNS record: $HostName -> workers.dev"
}

function Put-WorkerSecret([string]$Name, [string]$Value, [string]$ConfigPath) {
  Write-Host "Writing Worker secret $Name..."
  $Value | npx wrangler secret put $Name --config $ConfigPath
}

$script:CloudflareToken = Read-Token
$env:CLOUDFLARE_API_TOKEN = $script:CloudflareToken

if ([string]::IsNullOrWhiteSpace($AdminPassword)) {
  $secure = Read-Host "Enter monitor admin password" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $AdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
if ($AdminPassword.Length -lt 6) { throw "Admin password must be at least 6 characters." }
if ([string]::IsNullOrWhiteSpace($EncryptionSecret)) { $EncryptionSecret = New-RandomSecret 32 }
if ($EncryptionSecret.Length -lt 16) { throw "Encryption secret must be at least 16 characters." }

$repoRoot = Split-Path $PSScriptRoot -Parent
if ([string]::IsNullOrWhiteSpace($WorkerDir)) { $WorkerDir = Join-Path $repoRoot "worker" }
$WorkerDir = Resolve-Path -LiteralPath $WorkerDir
$configPath = Join-Path $WorkerDir "wrangler.jsonc"

$accounts = @(Invoke-CfApi "GET" "/accounts?per_page=50")
if ($accounts.Count -lt 1) { throw "No Cloudflare account is available for this token." }
$account = $accounts[0]
$env:CLOUDFLARE_ACCOUNT_ID = $account.id
Write-Host "Using Cloudflare account: $($account.name) ($($account.id))"

$namespaces = @(Invoke-CfApi "GET" "/accounts/$($account.id)/storage/kv/namespaces?per_page=100")
$namespace = $namespaces | Where-Object { $_.title -eq $KvNamespaceTitle } | Select-Object -First 1
if (!$namespace) {
  $namespace = Invoke-CfApi "POST" "/accounts/$($account.id)/storage/kv/namespaces" @{ title = $KvNamespaceTitle }
  Write-Host "Created KV namespace: $KvNamespaceTitle ($($namespace.id))"
} else {
  Write-Host "Using KV namespace: $KvNamespaceTitle ($($namespace.id))"
}

$wrangler = @{
  name = $WorkerName
  main = "src/worker.js"
  compatibility_date = "2026-05-07"
  routes = @(@{ pattern = $RoutePattern; zone_name = $ZoneName })
  kv_namespaces = @(@{ binding = "MONITOR_DATA"; id = $namespace.id })
  triggers = @{ crons = @("*/30 * * * *") }
}
$wrangler | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $configPath -Encoding UTF8
Write-Host "Wrote $configPath"

Put-WorkerSecret "ADMIN_USER" $AdminUser $configPath
Put-WorkerSecret "ADMIN_PASSWORD" $AdminPassword $configPath
Put-WorkerSecret "ENCRYPTION_SECRET" $EncryptionSecret $configPath

Ensure-WorkerRoute $ZoneName $RoutePattern $WorkerName
Ensure-ProxiedDnsRecord $ZoneName (($RoutePattern -split '/')[0])

Push-Location $WorkerDir
try {
  npx wrangler deploy --config $configPath
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Done."
Write-Host "Monitor URL: https://$(($RoutePattern -split '/')[0])/"
Write-Host "Admin user: $AdminUser"
