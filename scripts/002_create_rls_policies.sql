-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for vendors table
CREATE POLICY "Vendors can view their own data" ON public.vendors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own data" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create vendor profiles" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view approved vendors" ON public.vendors
  FOR SELECT USING (status = 'approved');

-- RLS Policies for categories table
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- RLS Policies for products table
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can manage their own products" ON public.products
  FOR ALL USING (
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for product variants table
CREATE POLICY "Anyone can view active product variants" ON public.product_variants
  FOR SELECT USING (
    is_active = true AND 
    product_id IN (SELECT id FROM public.products WHERE is_active = true)
  );

CREATE POLICY "Vendors can manage their product variants" ON public.product_variants
  FOR ALL USING (
    product_id IN (
      SELECT p.id FROM public.products p
      JOIN public.vendors v ON p.vendor_id = v.id
      WHERE v.user_id = auth.uid()
    )
  );

-- RLS Policies for customers table
CREATE POLICY "Customers can view their own data" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can update their own data" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create customer profiles" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for addresses table
CREATE POLICY "Users can manage their own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors can view orders containing their products" ON public.orders
  FOR SELECT USING (
    id IN (
      SELECT DISTINCT oi.order_id 
      FROM public.order_items oi
      JOIN public.vendors v ON oi.vendor_id = v.id
      WHERE v.user_id = auth.uid()
    )
  );

-- RLS Policies for order items table
CREATE POLICY "Users can view order items for their orders" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    ) OR
    vendor_id IN (
      SELECT id FROM public.vendors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for cart items table
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for shipping methods table
CREATE POLICY "Anyone can view active shipping methods" ON public.shipping_methods
  FOR SELECT USING (is_active = true);

-- RLS Policies for site settings table (admin only for now)
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
