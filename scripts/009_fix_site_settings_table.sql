-- Fix site_settings table to match the API expectations
-- Run this in your Supabase SQL editor

-- Drop existing site_settings table if it exists (be careful - this will lose existing data)
-- DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Create the correct site_settings table structure
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings with the correct structure
INSERT INTO public.site_settings (key, value, description) VALUES
-- Branding Settings
('site_name', '"MarketPlace Pro"', 'Main site name displayed in header'),
('site_tagline', '"Your premier destination for quality products"', 'Site tagline for homepage'),
('site_logo', '{"url": "", "alt": "MarketPlace Pro Logo"}', 'Main site logo'),
('site_favicon', '{"url": ""}', 'Site favicon'),

-- SEO Settings
('meta_title', '"MarketPlace Pro - Quality Products from Trusted Vendors"', 'Default meta title'),
('meta_description', '"Discover quality products from verified vendors. Shop electronics, fashion, home goods and more."', 'Default meta description'),
('meta_keywords', '"marketplace, ecommerce, online shopping, vendors"', 'Default meta keywords'),
('og_image', '{"url": ""}', 'Open Graph image for social sharing'),

-- Color Settings
('primary_color', '"#3b82f6"', 'Primary brand color'),
('secondary_color', '"#64748b"', 'Secondary color for text and elements'),
('accent_color', '"#10b981"', 'Accent color for highlights'),
('background_color', '"#ffffff"', 'Main background color'),
('text_color', '"#1f2937"', 'Primary text color'),

-- Typography Settings
('primary_font', '"Inter"', 'Primary font family'),
('heading_font', '"Inter"', 'Font family for headings'),
('base_font_size', '16', 'Base font size in pixels'),
('line_height', '1.5', 'Default line height'),

-- Layout Settings
('container_width', '"standard"', 'Container width: standard, wide, or full'),
('header_style', '"standard"', 'Header layout style'),
('product_grid_columns', '4', 'Number of columns in product grid'),
('sticky_header', 'true', 'Enable sticky header'),
('rounded_corners', 'true', 'Use rounded corners'),
('drop_shadows', 'true', 'Enable drop shadows'),

-- Homepage Settings
('hero_title', '"Discover Amazing Products from Trusted Vendors"', 'Hero section title'),
('hero_subtitle', '"Shop from thousands of products across multiple categories with fast shipping and secure checkout."', 'Hero section subtitle'),
('hero_cta_text', '"Start Shopping"', 'Hero call-to-action button text'),
('hero_background', '{"url": "", "type": "image"}', 'Hero background image or color'),
('show_hero_search', 'true', 'Show search bar in hero section'),
('show_featured_categories', 'true', 'Display featured categories section'),
('show_featured_products', 'true', 'Display featured products section'),
('show_top_vendors', 'true', 'Display top vendors section'),
('show_testimonials', 'false', 'Display testimonials section'),
('show_newsletter_signup', 'true', 'Display newsletter signup section'),
('featured_products_count', '12', 'Number of featured products to display'),

-- Footer Settings
('footer_text', '"© 2024 MarketPlace Pro. All rights reserved."', 'Footer copyright text'),
('show_social_links', 'true', 'Display social media links in footer'),
('show_newsletter_footer', 'true', 'Show newsletter signup in footer'),
('show_payment_methods', 'true', 'Display payment method icons'),

-- Social Media Settings
('social_facebook', '""', 'Facebook page URL'),
('social_twitter', '""', 'Twitter profile URL'),
('social_instagram', '""', 'Instagram profile URL'),
('social_linkedin', '""', 'LinkedIn company URL'),
('social_youtube', '""', 'YouTube channel URL'),
('social_tiktok', '""', 'TikTok profile URL')

ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all users to read settings
CREATE POLICY "Allow all to read site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Create RLS policy to allow only admins to update settings
CREATE POLICY "Allow admin to update site settings" ON public.site_settings
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at 
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
