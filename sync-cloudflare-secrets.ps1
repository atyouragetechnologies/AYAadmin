# Parse the .env file and sync required secrets to Cloudflare Workers
$envPath = ".\.env"
$projectName = "atyouragetechnologies-aya-admin"

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
    "CASHFREE_ENVIRONMENT"
)

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
            Write-Host "Syncing secret: $key" -ForegroundColor Yellow
            # Pipe the value directly into wrangler
            $value | npx wrangler secret put $key --name $projectName
            Write-Host "Successfully synced $key" -ForegroundColor Green
        }
    }
}

Write-Host "All secrets synced! Your Cloudflare Workers now have access to your Supabase keys." -ForegroundColor Green
