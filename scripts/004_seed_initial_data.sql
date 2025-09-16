-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, price, estimated_days) VALUES
('Standard Shipping', 'Standard delivery within business days', 5.99, '5-7 business days'),
('Express Shipping', 'Faster delivery for urgent orders', 12.99, '2-3 business days'),
('Overnight Shipping', 'Next business day delivery', 24.99, '1 business day'),
('Free Shipping', 'Free standard shipping on qualifying orders', 0.00, '7-10 business days');

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashion and apparel for all ages'),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
('Books', 'books', 'Books, magazines, and educational materials'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Health & Beauty', 'health-beauty', 'Health, wellness, and beauty products');

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', '"Marketplace"', 'The name of the marketplace'),
('site_description', '"A comprehensive e-commerce marketplace"', 'Site description for SEO'),
('currency', '"USD"', 'Default currency'),
('tax_rate', '0.08', 'Default tax rate (8%)'),
('commission_rate', '0.10', 'Default vendor commission rate (10%)'),
('require_vendor_approval', 'true', 'Whether vendors need approval before selling'),
('allow_guest_checkout', 'true', 'Allow customers to checkout without creating an account'),
('min_order_amount', '0', 'Minimum order amount'),
('free_shipping_threshold', '50', 'Free shipping threshold amount');
