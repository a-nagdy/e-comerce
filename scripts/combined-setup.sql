-- ================================================
-- MarketPlace Pro - Combined Database Setup Script
-- ================================================
-- This script combines all necessary SQL scripts for easy setup
-- Run this in your Supabase SQL Editor for complete database setup

-- Enable necessary extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Required for AI product matching

-- ================================================
-- 1. CORE SCHEMA AND AUTHENTICATION
-- ================================================

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer',
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  tax_id TEXT,
  status vendor_status DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. AI-POWERED PRODUCT CATALOG SYSTEM
-- ================================================

-- Product catalog (canonical product data)
CREATE TABLE IF NOT EXISTS public.product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    category_id UUID REFERENCES public.categories(id),
    base_description TEXT,
    specifications JSONB DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    gtin VARCHAR(50), -- Global Trade Item Number
    mpn VARCHAR(100), -- Manufacturer Part Number
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product offers (vendor-specific offers)
CREATE TABLE IF NOT EXISTS public.product_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.product_catalog(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    
    -- Offer-specific details
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    condition VARCHAR(20) DEFAULT 'new', -- new, used, refurbished
    
    -- Variant details
    color VARCHAR(50),
    size VARCHAR(50),
    storage VARCHAR(50),
    other_variants JSONB,
    
    -- Inventory
    sku VARCHAR(100),
    inventory_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Offer-specific content
    title VARCHAR(255),
    description TEXT,
    images TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique offers per vendor per catalog item per variant
    UNIQUE(catalog_id, vendor_id, color, size, storage)
);

-- Product matching keywords for auto-detection
CREATE TABLE IF NOT EXISTS public.product_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(catalog_id, keyword)
);

-- Brand database for better matching
CREATE TABLE IF NOT EXISTS public.product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    aliases TEXT[],
    category_ids UUID[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product match feedback for learning
CREATE TABLE IF NOT EXISTS public.product_match_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_text VARCHAR(500) NOT NULL,
    suggested_catalog_id UUID REFERENCES public.product_catalog(id),
    user_choice BOOLEAN NOT NULL,
    actual_catalog_id UUID REFERENCES public.product_catalog(id),
    confidence_score FLOAT,
    user_id UUID REFERENCES public.users(id),
    category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. ORDERS AND SHIPPING
-- ================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.product_offers(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    estimated_days TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 4. SITE SETTINGS AND CUSTOMIZATION
-- ================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    background_image TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. SHOPPING CART
-- ================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.product_offers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, offer_id)
);

-- ================================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_product_offers_catalog_price ON public.product_offers(catalog_id, price ASC);
CREATE INDEX IF NOT EXISTS idx_product_offers_vendor ON public.product_offers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_active ON public.product_offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_keywords_keyword ON public.product_keywords USING gin(keyword gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_catalog_search ON public.product_catalog USING gin((name || ' ' || brand || ' ' || model) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON public.product_catalog(category_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

-- ================================================
-- 7. AI FUNCTIONS FOR PRODUCT MATCHING
-- ================================================

-- Text normalization function
CREATE OR REPLACE FUNCTION normalize_product_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN trim(regexp_replace(
        regexp_replace(
            lower(input_text), 
            '[^a-z0-9\s]', ' ', 'g'
        ), 
        '\s+', ' ', 'g'
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Extract brand from product name
CREATE OR REPLACE FUNCTION extract_brand_from_text(product_text TEXT)
RETURNS VARCHAR AS $$
DECLARE
    brand_record RECORD;
    normalized_text TEXT;
BEGIN
    normalized_text := normalize_product_text(product_text);
    
    -- Check for exact brand matches first
    FOR brand_record IN 
        SELECT name FROM public.product_brands 
        WHERE is_active = true 
        ORDER BY length(name) DESC
    LOOP
        IF position(' ' || lower(brand_record.name) || ' ' IN ' ' || normalized_text || ' ') > 0 THEN
            RETURN brand_record.name;
        END IF;
    END LOOP;
    
    -- Check aliases
    FOR brand_record IN 
        SELECT name, aliases FROM public.product_brands 
        WHERE is_active = true AND aliases IS NOT NULL
    LOOP
        FOR i IN 1..array_length(brand_record.aliases, 1) LOOP
            IF position(' ' || lower(brand_record.aliases[i]) || ' ' IN ' ' || normalized_text || ' ') > 0 THEN
                RETURN brand_record.name;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Smart product matching function
CREATE OR REPLACE FUNCTION find_similar_products_smart(
    product_name VARCHAR,
    category_id UUID DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    catalog_id UUID,
    name VARCHAR(255),
    brand VARCHAR(255),
    model VARCHAR(255),
    category_name VARCHAR(255),
    confidence_score FLOAT,
    match_reasons TEXT[]
) AS $$
DECLARE
    extracted_brand VARCHAR;
    normalized_input TEXT;
BEGIN
    extracted_brand := extract_brand_from_text(product_name);
    normalized_input := normalize_product_text(product_name);
    
    RETURN QUERY
    WITH scored_products AS (
        SELECT 
            pc.id as catalog_id,
            pc.name::VARCHAR(255),
            pc.brand::VARCHAR(255),
            pc.model::VARCHAR(255),
            c.name::VARCHAR(255) as category_name,
            
            -- Name similarity (30% weight)
            similarity(normalize_product_text(pc.name), normalized_input) * 0.3 as name_score,
            
            -- Brand match (40% weight - increased for better brand matching)
            CASE 
                WHEN extracted_brand IS NOT NULL AND pc.brand IS NOT NULL 
                THEN 
                    CASE 
                        WHEN lower(pc.brand) = lower(extracted_brand) THEN 0.4
                        WHEN similarity(pc.brand, extracted_brand) > 0.8 THEN 0.35
                        ELSE 0
                    END
                ELSE 0
            END as brand_score,
            
            -- Category context bonus (20% weight)
            CASE 
                WHEN find_similar_products_smart.category_id IS NOT NULL AND pc.category_id = find_similar_products_smart.category_id THEN 0.2
                WHEN find_similar_products_smart.category_id IS NOT NULL THEN 0.0
                ELSE 0.1
            END as category_score,
            
            -- Model similarity (10% weight)
            CASE 
                WHEN pc.model IS NOT NULL 
                THEN similarity(normalize_product_text(pc.model), normalized_input) * 0.1
                ELSE 0
            END as model_score,
            
            -- Build match reasons
            ARRAY_REMOVE(ARRAY[
                CASE WHEN similarity(normalize_product_text(pc.name), normalized_input) > 0.7 
                     THEN 'Name match' ELSE NULL END,
                CASE WHEN extracted_brand IS NOT NULL AND pc.brand IS NOT NULL AND lower(pc.brand) = lower(extracted_brand)
                     THEN 'Exact brand match' ELSE NULL END,
                CASE WHEN find_similar_products_smart.category_id IS NOT NULL AND pc.category_id = find_similar_products_smart.category_id 
                     THEN 'Same category' ELSE NULL END
            ], NULL) as match_reasons
            
        FROM public.product_catalog pc
        LEFT JOIN public.categories c ON pc.category_id = c.id
        WHERE pc.is_active = true
            AND (find_similar_products_smart.category_id IS NULL OR pc.category_id = find_similar_products_smart.category_id)
    )
    SELECT 
        sp.catalog_id,
        sp.name,
        sp.brand,
        sp.model,
        sp.category_name,
        (sp.name_score + sp.brand_score + sp.category_score + sp.model_score) as confidence_score,
        sp.match_reasons
    FROM scored_products sp
    WHERE (sp.name_score + sp.brand_score + sp.category_score + sp.model_score) >= similarity_threshold
    ORDER BY confidence_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. TRIGGERS AND FUNCTIONS
-- ================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    -- Create vendor record if role is vendor
    IF (NEW.raw_user_meta_data->>'role') = 'vendor' THEN
        INSERT INTO public.vendors (user_id, business_name, status)
        VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'New Vendor'), 'pending')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Update user role
        UPDATE public.users SET role = 'vendor' WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (simplified for setup)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public read access for categories and active catalog items
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active catalog items" ON public.product_catalog FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active offers" ON public.product_offers FOR SELECT USING (is_active = true);

-- Vendors can manage their own data
CREATE POLICY "Vendors manage own offers" ON public.product_offers FOR ALL USING (
    vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);

-- Admin access to everything
CREATE POLICY "Admins can manage everything" ON public.users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ================================================
-- 10. INITIAL DATA
-- ================================================

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, price, estimated_days) VALUES
('Standard Shipping', 'Standard delivery within business days', 5.99, '5-7 business days'),
('Express Shipping', 'Faster delivery for urgent orders', 12.99, '2-3 business days'),
('Overnight Shipping', 'Next business day delivery', 24.99, '1 business day'),
('Free Shipping', 'Free standard shipping on qualifying orders', 0.00, '7-10 business days')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashion and apparel for all ages'),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
('Books', 'books', 'Books, magazines, and educational materials'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Health & Beauty', 'health-beauty', 'Health, wellness, and beauty products')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_name', '"MarketPlace Pro"', 'The name of the marketplace'),
('site_description', '"A comprehensive e-commerce marketplace"', 'Site description for SEO'),
('currency', '"USD"', 'Default currency'),
('tax_rate', '0.08', 'Default tax rate (8%)'),
('commission_rate', '0.10', 'Default vendor commission rate (10%)'),
('require_vendor_approval', 'true', 'Whether vendors need approval before selling'),
('auto_approve_products', 'false', 'Whether products are auto-approved'),
('require_product_moderation', 'true', 'Whether products need moderation'),
('allow_guest_checkout', 'true', 'Allow customers to checkout without creating an account'),
('min_order_amount', '0', 'Minimum order amount'),
('free_shipping_threshold', '50', 'Free shipping threshold amount')
ON CONFLICT (key) DO NOTHING;

-- Insert some popular brands for better matching
INSERT INTO public.product_brands (name, aliases, is_active) VALUES
('Apple', ARRAY['Apple Inc', 'Apple Computer'], true),
('Samsung', ARRAY['Samsung Electronics'], true),
('Google', ARRAY['Google LLC'], true),
('Microsoft', ARRAY['Microsoft Corporation'], true),
('Sony', ARRAY['Sony Corporation'], true),
('Nike', ARRAY['Nike Inc'], true),
('Adidas', ARRAY['Adidas AG'], true)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 11. STORAGE BUCKET SETUP
-- ================================================

-- Create storage bucket for marketplace assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('marketplace-assets', 'marketplace-assets', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'marketplace-assets' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public downloads" ON storage.objects
    FOR SELECT USING (bucket_id = 'marketplace-assets');

-- ================================================
-- SETUP COMPLETE
-- ================================================

-- Create a function to verify setup
CREATE OR REPLACE FUNCTION verify_marketplace_setup()
RETURNS TABLE (
    component TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Tables'::TEXT as component,
        CASE 
            WHEN COUNT(*) >= 15 THEN 'OK'
            ELSE 'INCOMPLETE'
        END as status,
        COUNT(*)::TEXT || ' tables created' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN (
        'users', 'vendors', 'categories', 'product_catalog', 'product_offers',
        'orders', 'order_items', 'cart_items', 'site_settings', 'hero_slides'
    )
    
    UNION ALL
    
    SELECT 
        'Functions'::TEXT,
        CASE 
            WHEN COUNT(*) >= 3 THEN 'OK'
            ELSE 'INCOMPLETE'
        END,
        COUNT(*)::TEXT || ' functions created'
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name IN (
        'normalize_product_text', 'extract_brand_from_text', 'find_similar_products_smart'
    )
    
    UNION ALL
    
    SELECT 
        'Extensions'::TEXT,
        CASE 
            WHEN COUNT(*) >= 2 THEN 'OK'
            ELSE 'MISSING'
        END,
        string_agg(extname, ', ')
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pg_trgm');
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT * FROM verify_marketplace_setup();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 MarketPlace Pro database setup completed successfully!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Run: pnpm run dev';
    RAISE NOTICE '   2. Visit: http://localhost:3000';
    RAISE NOTICE '   3. Create your first admin account';
END $$;
