# Admin Login Credentials

## Default Admin Account
- **Email**: admin@marketplace.com
- **Password**: admin123
- **Role**: Admin
- **Access**: Full admin dashboard with all permissions

## Default Vendor Account  
- **Email**: vendor@marketplace.com
- **Password**: vendor123
- **Role**: Vendor
- **Access**: Vendor dashboard for product and order management

## Setup Instructions

1. Run the admin user creation script:
   \`\`\`sql
   -- Execute scripts/007_create_admin_user.sql
   \`\`\`

2. The admin can access the admin dashboard at `/admin`
3. The vendor can access the vendor dashboard at `/vendor`

## Supabase Connection Details

Your Supabase project is connected with the following environment variables:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY  
- SUPABASE_ANON_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Guest Cart Functionality

✅ **Implemented Features:**
- Add to cart without login (stored in localStorage)
- Cart count updates in header for both guest and authenticated users
- Automatic cart merging when guest users sign up or log in
- Checkout requires authentication - redirects to login if not signed in
- Guest cart is preserved during login flow and merged with user account
- Real-time cart updates across all components

## Security Notes

- Change default passwords in production
- All cart operations use Row Level Security (RLS)
- Guest cart data is client-side only until user authenticates
- Order processing requires valid user authentication
