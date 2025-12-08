/**
 * SEO Verification Script - PRODUCTION VERSION
 * Run this after deploying to verify production SEO
 * 
 * Usage: node scripts/verify-seo-production.js
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'quotation.qrpixeldesign.com';
const USE_HTTPS = true; // Production uses HTTPS

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkUrl(url, expectedContent = null) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        const contentMatch = expectedContent ? data.includes(expectedContent) : true;
        
        resolve({
          success: success && contentMatch,
          statusCode: res.statusCode,
          data: data,
          fullData: data,
          preview: data.substring(0, 500),
          contentMatch,
        });
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });
  });
}

async function runTests() {
  log('\n🔍 SEO Verification Script - PRODUCTION', colors.cyan);
  log('='.repeat(50), colors.cyan);
  log(`Testing domain: ${DOMAIN}\n`, colors.blue);

  const baseUrl = `${USE_HTTPS ? 'https' : 'http'}://${DOMAIN}`;
  
  // Test 1: robots.txt
  log('Test 1: Checking robots.txt...', colors.yellow);
  const robotsResult = await checkUrl(`${baseUrl}/robots.txt`);
  if (robotsResult.statusCode === 200 && (robotsResult.data.includes('User-Agent') || robotsResult.data.includes('User-agent'))) {
    log('✅ robots.txt is accessible and valid', colors.green);
    if (robotsResult.data.includes('Sitemap:') || robotsResult.data.includes('sitemap:')) {
      log('✅ Sitemap URL found in robots.txt', colors.green);
    }
  } else {
    log(`❌ robots.txt failed (Status: ${robotsResult.statusCode || 'Error'})`, colors.red);
    if (robotsResult.error) log(`   Error: ${robotsResult.error}`, colors.red);
  }

  // Test 2: sitemap.xml
  log('\nTest 2: Checking sitemap.xml...', colors.yellow);
  const sitemapResult = await checkUrl(`${baseUrl}/sitemap.xml`, '<urlset');
  if (sitemapResult.success) {
    log('✅ sitemap.xml is accessible and valid', colors.green);
    const urlCount = (sitemapResult.data.match(/<url>/g) || []).length;
    log(`✅ Found ${urlCount} URLs in sitemap`, colors.green);
  } else {
    log(`❌ sitemap.xml failed (Status: ${sitemapResult.statusCode || 'Error'})`, colors.red);
    if (sitemapResult.error) log(`   Error: ${sitemapResult.error}`, colors.red);
  }

  // Test 3: Homepage metadata
  log('\nTest 3: Checking homepage metadata...', colors.yellow);
  const homeResult = await checkUrl(baseUrl, '<meta');
  if (homeResult.success) {
    log('✅ Homepage is accessible', colors.green);
    
    const checks = [
      { name: 'Title tag', pattern: '<title>' },
      { name: 'Description meta', pattern: 'name="description"' },
      { name: 'OpenGraph tags', pattern: 'property="og:' },
      { name: 'Canonical URL', pattern: 'rel="canonical"' },
    ];
    
    checks.forEach(check => {
      if (homeResult.data.includes(check.pattern)) {
        log(`✅ ${check.name} found`, colors.green);
      } else {
        log(`⚠️  ${check.name} not found`, colors.yellow);
      }
    });
  } else {
    log(`❌ Homepage failed (Status: ${homeResult.statusCode || 'Error'})`, colors.red);
  }

  // Test 4: Products page
  log('\nTest 4: Checking products page...', colors.yellow);
  const productsResult = await checkUrl(`${baseUrl}/products`, 'application/ld+json');
  if (productsResult.success) {
    log('✅ Products page is accessible', colors.green);
    
    if (productsResult.data.includes('application/ld+json')) {
      log('✅ Structured data (JSON-LD) found', colors.green);
    } else {
      log('⚠️  Structured data not found', colors.yellow);
    }
    
    if (productsResult.data.includes('schema.org')) {
      log('✅ Schema.org markup detected', colors.green);
    }
  } else {
    log(`❌ Products page failed (Status: ${productsResult.statusCode || 'Error'})`, colors.red);
  }

  // Summary
  log('\n' + '='.repeat(50), colors.cyan);
  log('📊 Verification Summary', colors.cyan);
  log('='.repeat(50), colors.cyan);
  
  const allTests = [robotsResult, sitemapResult, homeResult, productsResult];
  const passedTests = allTests.filter(t => t.success).length;
  const totalTests = allTests.length;
  
  if (passedTests === totalTests) {
    log(`\n✅ All ${totalTests} tests passed!`, colors.green);
    log('\n🎉 Your production site is properly configured for SEO!', colors.green);
    log('\nNext steps:', colors.cyan);
    log('1. Submit sitemap to Google Search Console', colors.blue);
    log('2. Request indexing for key pages', colors.blue);
    log('3. Monitor progress over next 2-4 weeks', colors.blue);
  } else {
    log(`\n⚠️  ${passedTests}/${totalTests} tests passed`, colors.yellow);
    log('\nPlease review the failed tests above.', colors.yellow);
  }
  
  log('\n📚 For more help, see:', colors.cyan);
  log('- SEO_QUICK_START.md', colors.blue);
  log('- SEO_IMPLEMENTATION_GUIDE.md', colors.blue);
  log('- SEO_FIXES_SUMMARY.md\n', colors.blue);
}

// Run the tests
runTests().catch(err => {
  log(`\n❌ Script error: ${err.message}`, colors.red);
  process.exit(1);
});
