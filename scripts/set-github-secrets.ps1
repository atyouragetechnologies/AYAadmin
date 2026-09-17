# Parse the .env file and set required secrets to GitHub Repository
$envFile = ".\.env"

if (-not (Test-Path $envFile)) {
    Write-Host ".env file not found in the root directory!" -ForegroundColor Red
    exit 1
}

$requiredSecrets = @(
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ACCESS_TOKEN",
    "VITE_AUTH_SALT",
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_MEASUREMENT_ID",
    "FIREBASE_SERVICE_ACCOUNT_JSON",
    "VAPID_PUBLIC_KEY",
    "VITE_VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
    "VITE_CDN_URL",
    "CASHFREE_APP_ID",
    "CASHFREE_SECRET_KEY",
    "CASHFREE_ENVIRONMENT",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID"
)

$successCount = 0
$missingCount = 0

Write-Host "Syncing secrets to GitHub repository..." -ForegroundColor Cyan

Get-Content $envFile -Encoding UTF8 | ForEach-Object {
    if ($_ -match "^([^#=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Remove surrounding quotes if they exist
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if ($requiredSecrets -contains $key) {
            Write-Host "Setting $key in GitHub..." -ForegroundColor Yellow
            $value | gh secret set $key
            if ($LASTEXITCODE -eq 0) {
                $successCount++
                Write-Host "Successfully synced $key" -ForegroundColor Green
            } else {
                Write-Host "[Error] Failed to set $key. Are you logged in with 'gh auth login'?" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nDone! Successfully set $successCount secrets to GitHub." -ForegroundColor Green
