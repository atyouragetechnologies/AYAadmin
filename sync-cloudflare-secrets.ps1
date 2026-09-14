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
    "CLOUDFLARE_API_KEY",
    "CLOUDFLARE_ACCOUNT_ID",
    "SUPABASE_ACCESS_TOKEN",
    "VITE_AUTH_SALT"
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
