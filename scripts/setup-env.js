// scripts/setup-env.js
// Helper script to check environment setup

const fs = require("fs");
const path = require("path");

function checkEnvFile() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const envExamplePath = path.join(__dirname, "..", ".env.example");

  console.log("🔍 Checking environment configuration...\n");

  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!");
    console.log("📝 Please copy .env.example to .env.local and configure it:");
    console.log("   cp .env.example .env.local\n");
    return false;
  }

  console.log("✅ .env.local file exists");

  // Read and check required variables
  const envContent = fs.readFileSync(envPath, "utf8");
  const requiredVars = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (!envContent.includes(varName + "=") || envContent.includes(varName + "=your-")) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log("\n⚠️  Missing or incomplete environment variables:");
    missingVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log("\n📖 Configuration guide:");
    console.log("   1. MONGODB_URI: Your MongoDB connection string");
    console.log("   2. NEXTAUTH_SECRET: Generate with 'openssl rand -base64 32'");
    console.log("   3. NEXTAUTH_URL: http://localhost:3000 (for development)\n");
    return false;
  }

  console.log("✅ All required environment variables are configured\n");
  return true;
}

function main() {
  console.log("=".repeat(50));
  console.log("  Qlite Global - Environment Setup Check");
  console.log("=".repeat(50) + "\n");

  const isConfigured = checkEnvFile();

  if (isConfigured) {
    console.log("✅ Environment is properly configured!");
    console.log("\n📋 Next steps:");
    console.log("   1. Run: node scripts/create-admin.js");
    console.log("   2. Run: npm run dev");
    console.log("   3. Visit: http://localhost:3000\n");
  } else {
    console.log("❌ Environment setup incomplete");
    console.log("\n📋 Required steps:");
    console.log("   1. Copy .env.example to .env.local");
    console.log("   2. Configure all required variables");
    console.log("   3. Run this script again to verify\n");
  }
}

main();
