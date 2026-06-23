param(
  [Parameter(Mandatory = $true)]
  [string]$MonitorUrl
)

$ErrorActionPreference = "Stop"

$url = $MonitorUrl.Trim()
if ($url -notmatch "^https?://") {
  $url = "https://$url"
}
$uri = [Uri]$url
$originPattern = "$($uri.Scheme)://$($uri.Host)/*"

$manifestPath = Join-Path (Split-Path $PSScriptRoot -Parent) "extension\manifest.json"
$text = [System.IO.File]::ReadAllText($manifestPath)
$text = $text.Replace("https://YOUR_MONITOR_DOMAIN/*", $originPattern)
$text = $text.Replace("https://monitor.example.com/*", $originPattern)
[System.IO.File]::WriteAllText($manifestPath, $text, [System.Text.UTF8Encoding]::new($false))

Write-Host "Updated extension manifest monitor URL: $originPattern"
