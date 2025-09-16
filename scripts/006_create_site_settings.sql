-- Create site_settings table for customizable frontend settings
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('branding', 'colors', 'typography', 'layout', 'homepage', 'seo', 'social')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create themes table for predefined theme configurations
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    settings JSONB NOT NULL,
    preview_image VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
-- Branding Settings
('site_name', '"MarketPlace Pro"', 'branding', 'Main site name displayed in header'),
('site_tagline', '"Your premier destination for quality products"', 'branding', 'Site tagline for homepage'),
('site_logo', '{"url": "", "alt": "MarketPlace Pro Logo"}', 'branding', 'Main site logo'),
('site_favicon', '{"url": ""}', 'branding', 'Site favicon'),

-- SEO Settings
('meta_title', '"MarketPlace Pro - Quality Products from Trusted Vendors"', 'seo', 'Default meta title'),
('meta_description', '"Discover quality products from verified vendors. Shop electronics, fashion, home goods and more."', 'seo', 'Default meta description'),
('meta_keywords', '"marketplace, ecommerce, online shopping, vendors"', 'seo', 'Default meta keywords'),
('og_image', '{"url": ""}', 'seo', 'Open Graph image for social sharing'),

-- Color Settings
('primary_color', '"#3b82f6"', 'colors', 'Primary brand color'),
('secondary_color', '"#64748b"', 'colors', 'Secondary color for text and elements'),
('accent_color', '"#10b981"', 'colors', 'Accent color for highlights'),
('background_color', '"#ffffff"', 'colors', 'Main background color'),
('text_color', '"#1f2937"', 'colors', 'Primary text color'),

-- Typography Settings
('primary_font', '"Inter"', 'typography', 'Primary font family'),
('heading_font', '"Inter"', 'typography', 'Font family for headings'),
('base_font_size', '16', 'typography', 'Base font size in pixels'),
('line_height', '1.5', 'typography', 'Default line height'),

-- Layout Settings
('container_width', '"full"', 'layout', 'Container width: standard, wide, or full'),
('header_style', '"full"', 'layout', 'Header layout style'),
('product_grid_columns', '4', 'layout', 'Number of columns in product grid'),
('sticky_header', 'true', 'layout', 'Enable sticky header'),
('rounded_corners', 'true', 'layout', 'Use rounded corners'),
('drop_shadows', 'true', 'layout', 'Enable drop shadows'),

-- Homepage Settings
('hero_title', '"Discover Amazing Products from Trusted Vendors"', 'homepage', 'Hero section title'),
('hero_subtitle', '"Shop from thousands of products across multiple categories with fast shipping and secure checkout."', 'homepage', 'Hero section subtitle'),
('hero_cta_text', '"Start Shopping"', 'homepage', 'Hero call-to-action button text'),
('hero_background', '{"url": "", "type": "image"}', 'homepage', 'Hero background image or color'),
('show_hero_search', 'true', 'homepage', 'Show search bar in hero section'),
('show_featured_categories', 'true', 'homepage', 'Display featured categories section'),
('show_featured_products', 'true', 'homepage', 'Display featured products section'),
('show_top_vendors', 'true', 'homepage', 'Display top vendors section'),
('show_testimonials', 'false', 'homepage', 'Display testimonials section'),
('show_newsletter_signup', 'true', 'homepage', 'Display newsletter signup section'),
('featured_products_count', '12', 'homepage', 'Number of featured products to display'),

-- Footer Settings
('footer_text', '"© 2024 MarketPlace Pro. All rights reserved."', 'layout', 'Footer copyright text'),
('show_social_links', 'true', 'layout', 'Display social media links in footer'),
('show_newsletter_footer', 'true', 'layout', 'Show newsletter signup in footer'),
('show_payment_methods', 'true', 'layout', 'Display payment method icons'),

-- Social Media Settings
('social_facebook', '""', 'social', 'Facebook page URL'),
('social_twitter', '""', 'social', 'Twitter profile URL'),
('social_instagram', '""', 'social', 'Instagram profile URL'),
('social_linkedin', '""', 'social', 'LinkedIn company URL'),
('social_youtube', '""', 'social', 'YouTube channel URL'),
('social_tiktok', '""', 'social', 'TikTok profile URL');

-- Insert default themes
INSERT INTO themes (name, description, settings, is_default) VALUES
('Default Blue', 'Clean and professional blue theme', '{
  "primary_color": "#3b82f6",
  "secondary_color": "#64748b", 
  "accent_color": "#10b981",
  "primary_font": "Inter",
  "container_width": "standard"
}', true),

('Modern Purple', 'Vibrant purple theme for creative brands', '{
  "primary_color": "#8b5cf6",
  "secondary_color": "#64748b",
  "accent_color": "#f59e0b", 
  "primary_font": "Poppins",
  "container_width": "wide"
}', false),

('Nature Green', 'Eco-friendly green theme', '{
  "primary_color": "#10b981",
  "secondary_color": "#64748b",
  "accent_color": "#3b82f6",
  "primary_font": "Open Sans", 
  "container_width": "standard"
}', false),

('Bold Red', 'High-impact red theme for dynamic brands', '{
  "primary_color": "#ef4444",
  "secondary_color": "#64748b",
  "accent_color": "#8b5cf6",
  "primary_font": "Montserrat",
  "container_width": "wide"
}', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_type ON site_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_site_settings_active ON site_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_default ON themes(is_default);

-- Create updated_at trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
