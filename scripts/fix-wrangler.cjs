const fs = require('fs');
const path = require('path');

const wranglerPath = path.join(process.cwd(), '.output', 'server', 'wrangler.json');
if (fs.existsSync(wranglerPath)) {
  let data = fs.readFileSync(wranglerPath, 'utf8');
  // Replace the compatibility date with a safe past date
  data = data.replace(/"compatibility_date"\s*:\s*"[^"]+"/, '"compatibility_date": "2024-04-01"');
  // Normalize Windows backslashes in directory paths for Cloudflare Wrangler
  data = data.replace(/"directory"\s*:\s*"\.\.\\\\public"/, '"directory": "../public"');
  fs.writeFileSync(wranglerPath, data);
  console.log('[Deploy Web] Fixed compatibility_date and assets directory in wrangler.json');
} else {
  console.log('[Deploy Web] Warning: wrangler.json not found in .output/server/');
}
