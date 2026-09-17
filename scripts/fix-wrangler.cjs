const fs = require('fs');
const path = require('path');

const wranglerPath = path.join(process.cwd(), '.output', 'server', 'wrangler.json');
if (fs.existsSync(wranglerPath)) {
  let data = fs.readFileSync(wranglerPath, 'utf8');
  // Replace the compatibility date with a safe past date
  data = data.replace(/"compatibility_date"\s*:\s*"[^"]+"/, '"compatibility_date": "2024-04-01"');
  // Shorten the name to avoid 54-char limit in Cloudflare, AND make sure it
  // matches the Worker that atyourage.app's Custom Domain is actually bound to
  // (verified via Cloudflare API: accounts/{id}/workers/domains). Deploying
  // under any other name creates a second, unrelated Worker that nothing
  // routes to — which is exactly what happened before this fix.
  data = data.replace(/"name"\s*:\s*"[^"]+"/, '"name": "atyouragetechnologies-aya-admin"');
  // Normalize Windows backslashes in directory paths for Cloudflare Wrangler
  data = data.replace(/"directory"\s*:\s*"\.\.\\\\public"/, '"directory": "../public"');
  fs.writeFileSync(wranglerPath, data);
  console.log('[Deploy Web] Fixed compatibility_date and assets directory in wrangler.json');
} else {
  console.log('[Deploy Web] Warning: wrangler.json not found in .output/server/');
}
