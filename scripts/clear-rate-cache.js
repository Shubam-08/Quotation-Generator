/**
 * Clear exchange rate cache
 * This will force the system to use the updated fallback rates
 */

console.log('🔄 Clearing exchange rate cache...\n');

// Clear localStorage cache (run this in browser console)
const browserScript = `
// Run this in your browser console:
localStorage.removeItem('exchangeRates');
localStorage.removeItem('ratesLastUpdated');
localStorage.removeItem('selectedCurrency');
console.log('✅ Browser cache cleared! Please refresh the page.');
`;

console.log('To clear the cache, you have two options:\n');
console.log('Option 1: Restart the dev server');
console.log('  1. Stop the server (Ctrl+C)');
console.log('  2. Run: npm run dev\n');

console.log('Option 2: Clear browser cache');
console.log('  1. Open browser console (F12)');
console.log('  2. Run this code:');
console.log('─────────────────────────────────────');
console.log(browserScript);
console.log('─────────────────────────────────────\n');

console.log('Option 3: Hard refresh');
console.log('  - Windows/Linux: Ctrl + Shift + R');
console.log('  - Mac: Cmd + Shift + R\n');

console.log('✅ After clearing cache, the USD prices will be correct!');
