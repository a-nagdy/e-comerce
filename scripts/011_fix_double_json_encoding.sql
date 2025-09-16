-- Fix double JSON encoding issue in site_settings
-- Run this in your Supabase SQL editor

-- Update all the double-encoded JSON values to proper single encoding
UPDATE public.site_settings 
SET value = CASE 
  -- Fix site name (remove extra quotes and escaping)
  WHEN key = 'site_name' THEN '"Anasity"'
  
  -- Fix hero title 
  WHEN key = 'hero_title' THEN '"Discover Amazing Products from Trusted Vendors"'
  
  -- Fix hero subtitle
  WHEN key = 'hero_subtitle' THEN '"Shop from thousands of products across multiple categories with fast shipping and secure checkout."'
  
  -- Fix hero CTA text
  WHEN key = 'hero_cta_text' THEN '"Start Shopping"'
  
  -- Fix meta title
  WHEN key = 'meta_title' THEN '"MarketPlace Pro - Quality Products from Trusted Vendors"'
  
  -- Fix meta description  
  WHEN key = 'meta_description' THEN '"Discover quality products from verified vendors. Shop electronics, fashion, home goods and more."'
  
  -- Fix meta keywords
  WHEN key = 'meta_keywords' THEN '"marketplace, ecommerce, online shopping, vendors"'
  
  -- Fix tagline
  WHEN key = 'site_tagline' THEN '"Your premier destination for quality products"'
  
  -- Fix colors (remove extra escaping)
  WHEN key = 'primary_color' THEN '"#3b82f6"'
  WHEN key = 'secondary_color' THEN '"#64748b"'  
  WHEN key = 'accent_color' THEN '"#10b981"'
  WHEN key = 'background_color' THEN '"#ffffff"'
  WHEN key = 'text_color' THEN '"#1f2937"'
  
  -- Fix fonts
  WHEN key = 'primary_font' THEN '"Inter"'
  WHEN key = 'heading_font' THEN '"Inter"'
  
  -- Fix layout settings
  WHEN key = 'container_width' THEN '"full"'  -- Keep your current setting
  WHEN key = 'header_style' THEN '"centered"' -- Keep your current setting
  
  -- Fix footer text
  WHEN key = 'footer_text' THEN '"© 2024 MarketPlace Pro. All rights reserved."'
  
  -- Fix social media (empty strings)
  WHEN key = 'social_facebook' THEN '""'
  WHEN key = 'social_twitter' THEN '""'
  WHEN key = 'social_instagram' THEN '""'
  WHEN key = 'social_linkedin' THEN '""'
  WHEN key = 'social_youtube' THEN '""'
  WHEN key = 'social_tiktok' THEN '""'
  
  -- Keep other values as they are if they're already correct
  ELSE value
END,
updated_at = NOW()
WHERE key IN (
  'site_name', 'hero_title', 'hero_subtitle', 'hero_cta_text', 
  'meta_title', 'meta_description', 'meta_keywords', 'site_tagline',
  'primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color',
  'primary_font', 'heading_font', 'container_width', 'header_style', 'footer_text',
  'social_facebook', 'social_twitter', 'social_instagram', 'social_linkedin', 'social_youtube', 'social_tiktok'
);

-- Remove the duplicate hero_c_t_a_text entry (it should be hero_cta_text)
DELETE FROM public.site_settings WHERE key = 'hero_c_t_a_text';

-- Verify the results
SELECT key, value, description 
FROM public.site_settings 
WHERE key IN (
  'site_name', 'hero_title', 'container_width', 'primary_color', 'social_facebook'
)
ORDER BY key;
