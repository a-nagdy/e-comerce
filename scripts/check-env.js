#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks if all required environment variables are set
 */

require("dotenv").config();

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bright: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log("\n🔍 MarketPlace Pro - Environment Check", "bright");
  log("=====================================", "bright");

  const required = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL" },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      description: "Supabase anonymous key",
    },
  ];

  const recommended = [
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      description: "Supabase service role key (for admin operations)",
    },
  ];

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  log("\n📋 Required Environment Variables:", "blue");
  for (const { key, description } of required) {
    if (process.env[key]) {
      log(`   ✅ ${key} - ${description}`, "green");
    } else {
      log(`   ❌ ${key} - ${description}`, "red");
      hasErrors = true;
    }
  }

  // Check recommended variables
  log("\n🔧 Recommended Environment Variables:", "blue");
  for (const { key, description } of recommended) {
    if (process.env[key]) {
      log(`   ✅ ${key} - ${description}`, "green");
    } else {
      log(`   ⚠️  ${key} - ${description}`, "yellow");
      hasWarnings = true;
    }
  }

  // Results
  log("\n📊 Environment Check Results:", "bright");
  if (hasErrors) {
    log("   ❌ FAILED - Missing required environment variables", "red");
    log("\n🛠️  Setup Instructions:", "yellow");
    log("   1. Copy .env.example to .env.local (if available)", "yellow");
    log(
      "   2. Get your Supabase credentials from https://supabase.com/dashboard",
      "yellow"
    );
    log("   3. Add the required variables to your .env.local file", "yellow");
    log("   4. Run: pnpm run setup", "yellow");
    process.exit(1);
  } else if (hasWarnings) {
    log("   ⚠️  PARTIAL - Some recommended variables missing", "yellow");
    log("   💡 Some advanced features may require manual setup", "yellow");
  } else {
    log("   ✅ PASSED - All environment variables configured", "green");
  }

  log("\n🚀 Next steps:", "blue");
  log("   1. Run: pnpm run setup (to setup database)", "blue");
  log("   2. Run: pnpm run dev (to start development)", "blue");
  log("   3. Visit: http://localhost:3000", "blue");
}

if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };
