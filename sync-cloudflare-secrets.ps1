# Parse the .env file and sync required secrets to Cloudflare Workers
param(
    # Defaults to production. Pass -ProjectName atyouragetechnologies-aya-test
    # to sync the same secrets to the test.atyourage.app Worker instead.
    [string]$ProjectName = "atyouragetechnologies-aya-admin"
)

$envPath = ".\.env"
# This MUST match a real Worker name — verified via the Cloudflare API
# (accounts/{id}/workers/domains) which Worker each Custom Domain is bound to.
# Production is "atyouragetechnologies-aya-admin" (atyourage.app / www).
# "aya-web-app" was a past mistake: an unrelated, unbound Worker.
$projectName = $ProjectName

if (-Not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Syncing secrets to Cloudflare project: $projectName" -ForegroundColor Cyan

# The specific keys that the backend API needs in production
$keysToSync = @(
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "SUPABASE_ACCESS_TOKEN",
    "VITE_AUTH_SALT",
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
    "VAPID_PUBLIC_KEY",
    "VITE_VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
    "CASHFREE_APP_ID",
    "CASHFREE_SECRET_KEY",
    "CASHFREE_ENVIRONMENT",
    "VITE_CDN_URL",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID"
)

$secretsJson = @{}

foreach ($line in Get-Content $envPath -Encoding UTF8) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        continue
    }

    $parts = $line.Split('=', 2)
    if ($parts.Length -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        # Remove surrounding quotes if they exist
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if ($keysToSync -contains $key) {
            $secretsJson[$key] = $value
        }
    }
}

if ($secretsJson.Count -gt 0) {
    Write-Host "Syncing $($secretsJson.Count) secrets in bulk..." -ForegroundColor Yellow
    $tempFile = "temp_secrets.json"
    $secretsJson | ConvertTo-Json -Depth 10 | Set-Content $tempFile -Encoding UTF8
    
    # Use the bulk command to avoid rate limiting
    npx wrangler secret bulk $tempFile --name $projectName
    
    # Clean up the temp file
    Remove-Item $tempFile
    Write-Host "All secrets synced in a single request! Your Cloudflare Workers now have access to your Supabase keys." -ForegroundColor Green
} else {
    Write-Host "No valid secrets found to sync." -ForegroundColor Red
}
