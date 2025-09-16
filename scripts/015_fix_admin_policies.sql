-- Fix the circular dependency in admin policies
-- We need to drop the problematic policies and recreate them properly

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;

-- Create a more specific admin policy that doesn't create circular dependency
-- Allow admins to view all users (using auth.email instead of role check)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to manage all users
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to view all vendors
CREATE POLICY "Admins can view all vendors" ON public.vendors
  FOR SELECT USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to manage all vendors
CREATE POLICY "Admins can manage all vendors" ON public.vendors
  FOR ALL USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to view all products
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to manage all products
CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to view all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );

-- Allow admins to manage all categories
CREATE POLICY "Admins can manage all categories" ON public.categories
  FOR ALL USING (
    auth.email() IN (
      'admin@marketplace.com', 
      'ahmednagdy165@gmail.com'
    )
  );
