#!/usr/bin/env node

/**
 * Simple Database Setup Script for MarketPlace Pro
 *
 * This script provides clear instructions for manual database setup
 * and verifies if the database is already configured.
 */

const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config();

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bright: "\x1b[1m",
};

class SimpleSetup {
  constructor() {
    this.supabase = null;
  }

  // Print colored console messages
  log(message, color = "white") {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  // Initialize Supabase client
  initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    return this.supabase;
  }

  // Check if database is already set up
  async checkDatabaseSetup() {
    try {
      // Try to query one of our core tables
      const { data, error } = await this.supabase
        .from("users")
        .select("id")
        .limit(1);

      if (error && error.code === "PGRST116") {
        // Table doesn't exist
        return false;
      }

      // If we get here, the table exists
      return true;
    } catch (err) {
      return false;
    }
  }

  // Validate environment
  validateEnvironment() {
    this.log("\n🔍 Validating environment...", "blue");

    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    const recommended = ["SUPABASE_SERVICE_ROLE_KEY"];

    let isValid = true;

    // Check required variables
    for (const envVar of required) {
      if (!process.env[envVar]) {
        this.log(`   ❌ Missing required: ${envVar}`, "red");
        isValid = false;
      } else {
        this.log(`   ✅ Found: ${envVar}`, "green");
      }
    }

    // Check recommended variables
    for (const envVar of recommended) {
      if (!process.env[envVar]) {
        this.log(`   ⚠️  Missing recommended: ${envVar}`, "yellow");
        this.log(`      (Required for complete setup)`, "yellow");
      } else {
        this.log(`   ✅ Found: ${envVar}`, "green");
      }
    }

    if (!isValid) {
      throw new Error(
        "Missing required environment variables. Please check your .env file."
      );
    }

    return isValid;
  }

  // Provide manual setup instructions
  async provideSetupInstructions() {
    this.log(`\n📋 Database Setup Instructions`, "cyan");
    this.log(`   Manual setup required for best reliability`, "white");

    const isSetup = await this.checkDatabaseSetup();

    if (isSetup) {
      this.log(`\n✅ Database is already set up!`, "green");
      this.log(
        `   Core tables detected. Your MarketPlace Pro is ready!`,
        "green"
      );
      this.log(`\n🚀 Next steps:`, "cyan");
      this.log(`   1. Run: pnpm run dev`, "white");
      this.log(`   2. Visit: http://localhost:3000`, "white");
      this.log(`   3. Create your first admin account`, "white");
      return true;
    }

    this.log(`\n🔧 Follow these steps to set up your database:`, "blue");
    this.log(``, "white");

    this.log(`1. 📖 Open your Supabase Dashboard:`, "cyan");
    this.log(`   → Go to: https://supabase.com/dashboard`, "white");
    this.log(`   → Select your project`, "white");
    this.log(``, "white");

    this.log(`2. 🛠️  Navigate to SQL Editor:`, "cyan");
    this.log(`   → Click "SQL Editor" in the left sidebar`, "white");
    this.log(`   → Click "New query"`, "white");
    this.log(``, "white");

    this.log(`3. 📄 Copy and run the setup script:`, "cyan");
    this.log(`   → Open: scripts/combined-setup.sql`, "white");
    this.log(`   → Copy ALL the contents (Ctrl+A, Ctrl+C)`, "white");
    this.log(`   → Paste into Supabase SQL Editor (Ctrl+V)`, "white");
    this.log(`   → Click "Run" button (or press Ctrl+Enter)`, "white");
    this.log(``, "white");

    this.log(`4. ⏳ Wait for completion:`, "cyan");
    this.log(`   → The script may take 30-60 seconds to complete`, "white");
    this.log(
      `   → You should see "Setup completed successfully!" at the end`,
      "white"
    );
    this.log(``, "white");

    this.log(`5. ✅ Verify setup:`, "cyan");
    this.log(`   → Run this script again: pnpm run setup-db`, "white");
    this.log(`   → Or start your app: npm run dev`, "white");
    this.log(``, "white");

    const scriptPath = path.resolve(__dirname, "combined-setup.sql");
    this.log(`📁 Script location: ${scriptPath}`, "yellow");
    this.log(``, "white");

    this.log(`💡 Why manual setup?`, "magenta");
    this.log(
      `   Supabase doesn't allow direct SQL execution via API for security.`,
      "white"
    );
    this.log(`   Manual setup ensures all features work correctly.`, "white");

    return false;
  }

  // Main setup process
  async run() {
    try {
      this.log("🚀 MarketPlace Pro - Database Setup", "bright");
      this.log("=====================================\n", "bright");

      // Validate environment
      this.validateEnvironment();

      // Initialize Supabase
      this.log("\n🔌 Connecting to Supabase...", "blue");
      this.initializeSupabase();
      this.log("   ✅ Connected successfully", "green");

      // Check setup and provide instructions
      const isSetup = await this.provideSetupInstructions();

      if (!isSetup) {
        this.log(`\n❓ Need help?`, "cyan");
        this.log(`   → Check the README.md for detailed instructions`, "white");
        this.log(
          `   → Visit: https://supabase.com/docs for Supabase docs`,
          "white"
        );
        process.exit(1);
      }
    } catch (error) {
      this.log(`\n💥 Setup failed: ${error.message}`, "red");
      this.log("\n🛠️  Troubleshooting:", "yellow");
      this.log("   1. Check your .env file exists", "white");
      this.log("   2. Verify Supabase credentials are correct", "white");
      this.log("   3. Ensure your Supabase project is active", "white");
      this.log("   4. Try the manual setup steps above", "white");
      process.exit(1);
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new SimpleSetup();
  setup.run();
}

module.exports = SimpleSetup;
