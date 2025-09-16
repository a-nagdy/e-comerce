# 🚀 MarketPlace Pro - Quick Setup Guide

This guide will help you set up MarketPlace Pro in minutes with automated database setup.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🎯 Option 1: Automated Setup (Recommended)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd marketplace-pro

# Install dependencies
pnpm install
```

### Step 2: Configure Environment

1. **Create `.env.local` file** in the project root:

```env
# Required - Get these from your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Recommended - For automated database setup
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional - For development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

2. **Get Supabase credentials**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project or select existing
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**
   - Copy the **service_role key** (keep this secret!)

### Step 3: Automated Database Setup

```bash
# Run the automated setup
pnpm run setup

# Or manually if needed
pnpm run setup:db
```

This will:

- ✅ Validate your environment variables
- ✅ Connect to your Supabase database
- ✅ Run all SQL migrations in correct order
- ✅ Set up AI-powered product catalog
- ✅ Create initial data and settings
- ✅ Configure storage and permissions

### Step 4: Start Development

```bash
# Start the development server
pnpm run dev

# Visit your marketplace
open http://localhost:3000
```

## 🛠️ Option 2: Manual Setup

If automated setup doesn't work for your environment:

### Step 1: Run the Combined SQL Script

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `scripts/combined-setup.sql`
3. Paste and execute the script
4. Verify setup with: `SELECT * FROM verify_marketplace_setup();`

### Step 2: Check Individual Scripts (if needed)

If the combined script fails, run these individually:

```sql
-- Core Platform (run these first)
scripts/001_create_marketplace_schema.sql
scripts/002_create_rls_policies.sql
scripts/003_create_functions_and_triggers.sql
scripts/004_seed_initial_data.sql
scripts/005_create_orders_and_shipping.sql
scripts/006_create_site_settings.sql

-- Enhanced Features
scripts/017_create_product_catalog_system.sql
scripts/021_fix_storage_rls_safe.sql
scripts/022_fix_function_types_final.sql
```

## 🔧 Available npm Scripts

```bash
# Setup and Development
pnpm run setup          # Full automated setup
pnpm run setup:db       # Database setup only
pnpm run setup:check    # Check environment variables
pnpm run dev            # Start development server

# Standard Next.js commands
pnpm run build          # Build for production
pnpm run start          # Start production server
pnpm run lint           # Run linter
```

## 🎯 First-Time Setup Checklist

After successful setup:

- [ ] **Environment variables** configured in `.env.local`
- [ ] **Database setup** completed successfully
- [ ] **Development server** running on `http://localhost:3000`
- [ ] **Create admin account** - Sign up and manually set role to 'admin' in database
- [ ] **Configure platform** - Visit `/admin/settings`
- [ ] **Customize appearance** - Visit `/admin/appearance`
- [ ] **Add categories** - Create product categories
- [ ] **Test vendor flow** - Register as vendor and test approval

## 🔐 Admin Account Setup

1. **Sign up** at `http://localhost:3000/auth/signup`
2. **Update user role** in Supabase dashboard:
   ```sql
   UPDATE public.users
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```
3. **Access admin panel** at `http://localhost:3000/admin`

## 🤖 AI Features Setup

The AI-powered product catalog requires:

- ✅ **PostgreSQL trigram extension** (`pg_trgm`) - Auto-enabled in setup
- ✅ **Smart matching functions** - Auto-created in setup
- ✅ **Brand database** - Auto-populated with popular brands
- ✅ **Machine learning feedback** - Auto-configured

Test the AI features:

1. Go to `/vendor/products/new` (as a vendor)
2. Type "Apple iPhone" in product name
3. See intelligent suggestions appear!

## 🎨 Customization Quick Start

### Theme & Branding

1. **Admin Panel** → **Appearance** (`/admin/appearance`)
2. **Upload logo** and customize colors
3. **Configure hero slider** with multiple slides
4. **Set typography** and layout preferences

### Platform Settings

1. **Admin Panel** → **Settings** (`/admin/settings`)
2. **Configure vendor approval** workflow
3. **Set commission rates** and policies
4. **Enable/disable auto-approval** for products

## 🚨 Troubleshooting

### Database Setup Issues

**Error: "Missing Supabase credentials"**

```bash
# Check your .env.local file exists and has correct values
cat .env.local

# Verify environment detection
pnpm run setup:check
```

**Error: "Extension pg_trgm does not exist"**

```sql
-- Run this in Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Error: "RLS policy conflicts"**

```sql
-- Reset RLS policies if needed
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Development Issues

**Port 3000 already in use**

```bash
# Use different port
pnpm run dev -- -p 3001
```

**Build errors**

```bash
# Clear Next.js cache
rm -rf .next
pnpm run dev
```

### AI Suggestions Not Working

1. **Check database functions**:

   ```sql
   SELECT * FROM find_similar_products_smart('test', NULL, 0.5);
   ```

2. **Verify extensions**:

   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
   ```

3. **Check API endpoint**:
   ```bash
   curl "http://localhost:3000/api/products/suggestions?q=apple&categoryId=..."
   ```

## 📞 Need Help?

1. **Check the logs** - Both terminal and browser console
2. **Verify environment** - Run `pnpm run setup:check`
3. **Database status** - Check Supabase dashboard
4. **Manual setup** - Use `scripts/combined-setup.sql`

## 🎉 Success!

If everything is working:

- ✅ Homepage loads at `http://localhost:3000`
- ✅ Admin panel accessible at `/admin`
- ✅ AI suggestions work in vendor product creation
- ✅ Database has all tables and functions

You're ready to build your marketplace! 🚀

---

**Next**: Check out the main [README.md](./README.md) for detailed feature documentation.
