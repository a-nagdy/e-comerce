# Database Setup Guide - MarketPlace Pro

## Quick Start

1. **Run the setup checker:**

   ```bash
   npm run setup
   ```

2. **If database is not set up, follow the manual setup steps below.**

## Manual Database Setup

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your MarketPlace Pro project
3. If you don't have a project yet, create one:
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "marketplace-pro")
   - Set a database password
   - Choose a region closest to you
   - Click "Create new project"

### Step 2: Open SQL Editor

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"** to create a new SQL script

### Step 3: Execute Setup Script

1. Open the file `scripts/combined-setup.sql` in your code editor
2. Select all content (Ctrl+A or Cmd+A)
3. Copy the content (Ctrl+C or Cmd+C)
4. Go back to Supabase SQL Editor
5. Paste the content (Ctrl+V or Cmd+V)
6. Click the **"Run"** button (or press Ctrl+Enter)

### Step 4: Wait for Completion

- The script will take 30-60 seconds to run
- You should see progress messages in the Results panel
- Look for "Setup completed successfully!" at the end
- If you see any errors, scroll down to the troubleshooting section

### Step 5: Verify Setup

Run the setup checker again to confirm everything is working:

```bash
npm run setup
```

You should see "✅ Database is already set up!" if successful.

## What the Setup Script Does

The combined setup script creates:

1. **Core Tables:**

   - `users` - User accounts and profiles
   - `vendors` - Vendor/seller information
   - `categories` - Product categories
   - `product_catalog` - Centralized product information
   - `product_offers` - Vendor-specific product offers
   - `orders` - Customer orders
   - `cart_items` - Shopping cart functionality

2. **AI Features:**

   - Product matching algorithms
   - Smart product suggestions
   - Brand detection and normalization

3. **Security:**

   - Row Level Security (RLS) policies
   - User authentication integration
   - Vendor approval workflows

4. **Initial Data:**
   - Default categories (Electronics, Clothing, etc.)
   - Shipping methods
   - Site settings
   - Popular brand database

## Environment Variables Required

Make sure your `.env.local` file contains:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Recommended (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase dashboard under **Settings > API**.

## Troubleshooting

### "Permission denied" errors

- Make sure you're using your Service Role Key, not the Anon Key
- Check that RLS policies are properly configured
- Ensure you're the project owner or have admin access

### "Extension does not exist" errors

- Some extensions might need to be enabled manually
- Go to **Database > Extensions** in Supabase
- Enable `uuid-ossp` and `pg_trgm` extensions

### Script execution timeout

- The script is large and might take time
- If it times out, try running it in smaller chunks
- You can copy individual sections from the combined script

### Missing tables after setup

- Check if the script completed successfully
- Look for error messages in the SQL Editor results
- Try running the verification function:
  ```sql
  SELECT * FROM verify_marketplace_setup();
  ```

### Connection issues

- Verify your Supabase project is active (not paused)
- Check that your environment variables are correct
- Ensure your project has sufficient resources

## Development Commands

```bash
# Check if database is set up
npm run setup

# Check environment variables
npm run setup:check

# Use old setup script (if needed)
npm run setup:db:old

# Start development server
npm run dev
```

## Next Steps

After successful database setup:

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Visit your app:**
   Open [http://localhost:3000](http://localhost:3000)

3. **Create admin account:**

   - Navigate to `/auth/signup`
   - Create your first account
   - This will be your admin account

4. **Configure your marketplace:**
   - Go to Admin Dashboard
   - Set up site settings
   - Add categories and products
   - Configure vendor approval settings

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Check the project's README.md for additional information
4. Ensure all environment variables are correctly set

The MarketPlace Pro is now ready for development and testing!
