/**
 * Standalone pure Node test runner for AYA Validation Suite
 */
const { execSync } = require('child_process');

console.log('Compiling TypeScript validation...');
try {
    execSync('npx tsc scripts/validate_aya_platform.ts --module nodenext --moduleResolution nodenext --target es2022 --outDir dist/tests --skipLibCheck', { stdio: 'inherit' });
    console.log('Running compiled test suite...');
    execSync('node dist/tests/scripts/validate_aya_platform.js', { stdio: 'inherit' });
} catch (err) {
    console.error('Test run failed:', err.message);
    process.exit(1);
}
