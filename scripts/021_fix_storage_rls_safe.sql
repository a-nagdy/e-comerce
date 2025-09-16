-- Fix Storage and Catalog RLS Policies for Vendors (Safe Version)

-- 1. Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace-assets', 
    'marketplace-assets', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow uploads for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow viewing for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete own files" ON storage.objects;

-- Create storage policies for authenticated users (admin and vendors)
CREATE POLICY "Allow uploads for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND bucket_id = 'marketplace-assets'
);

CREATE POLICY "Allow viewing for authenticated users" ON storage.objects
FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND bucket_id = 'marketplace-assets'
);

CREATE POLICY "Allow delete own files" ON storage.objects
FOR DELETE USING (
    auth.role() = 'authenticated' 
    AND bucket_id = 'marketplace-assets'
);

-- 3. Fix product_catalog RLS policies to allow vendors to create entries
DROP POLICY IF EXISTS "Enable insert for admin users only" ON public.product_catalog;
DROP POLICY IF EXISTS "Enable insert for admins only" ON public.product_catalog;
DROP POLICY IF EXISTS "Allow catalog creation for admins and vendors" ON public.product_catalog;
DROP POLICY IF EXISTS "Allow catalog read for admins and vendors" ON public.product_catalog;
DROP POLICY IF EXISTS "Allow catalog update for admins and own entries for vendors" ON public.product_catalog;

CREATE POLICY "Allow catalog creation for admins and vendors" ON public.product_catalog
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'vendor')
    )
);

CREATE POLICY "Allow catalog read for all authenticated users" ON public.product_catalog
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid()
    )
);

CREATE POLICY "Allow catalog update for admins and creators" ON public.product_catalog
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND (
            users.role = 'admin' 
            OR (users.role = 'vendor' AND product_catalog.created_by = auth.uid())
        )
    )
);

-- 4. Fix product_keywords RLS policies
DROP POLICY IF EXISTS "Enable insert for admin users only" ON public.product_keywords;
DROP POLICY IF EXISTS "Allow keywords for admins and vendors" ON public.product_keywords;
DROP POLICY IF EXISTS "Allow keyword read for authenticated users" ON public.product_keywords;

CREATE POLICY "Allow keywords for admins and vendors" ON public.product_keywords
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'vendor')
    )
);

CREATE POLICY "Allow keyword read for authenticated users" ON public.product_keywords
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid()
    )
);

-- 5. Ensure product_offers policies allow vendors
DROP POLICY IF EXISTS "Vendors can manage their offers" ON public.product_offers;
DROP POLICY IF EXISTS "Allow offers for vendors and admins" ON public.product_offers;

CREATE POLICY "Allow offers for vendors and admins" ON public.product_offers
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users u
        LEFT JOIN public.vendors v ON u.id = v.user_id
        WHERE u.id = auth.uid() 
        AND (
            u.role = 'admin' 
            OR (u.role = 'vendor' AND v.id = product_offers.vendor_id)
        )
    )
);

-- 6. Enable RLS on all tables (if not already enabled)
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_match_feedback ENABLE ROW LEVEL SECURITY;

-- 7. Allow public read access to brands (for the extraction function)
DROP POLICY IF EXISTS "Allow public read for brands" ON public.product_brands;
CREATE POLICY "Allow public read for brands" ON public.product_brands
FOR SELECT USING (true);

-- 8. Allow feedback from authenticated users
DROP POLICY IF EXISTS "Allow feedback from authenticated users" ON public.product_match_feedback;
DROP POLICY IF EXISTS "Allow read own feedback" ON public.product_match_feedback;

CREATE POLICY "Allow feedback from authenticated users" ON public.product_match_feedback
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
);

CREATE POLICY "Allow read own feedback" ON public.product_match_feedback
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- 9. Drop and recreate get_best_offer function with correct signature
DROP FUNCTION IF EXISTS get_best_offer(uuid);
DROP FUNCTION IF EXISTS get_best_offer(UUID);

CREATE OR REPLACE FUNCTION get_best_offer(catalog_item_id UUID)
RETURNS TABLE (
    best_price DECIMAL(10,2),
    vendor_name TEXT,
    vendor_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.price as best_price,
        v.business_name as vendor_name,
        po.vendor_id
    FROM public.product_offers po
    JOIN public.vendors v ON po.vendor_id = v.id
    WHERE po.catalog_id = catalog_item_id 
        AND po.is_active = true
    ORDER BY po.price ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 10. Drop and recreate get_catalog_statistics function
DROP FUNCTION IF EXISTS get_catalog_statistics();

CREATE OR REPLACE FUNCTION get_catalog_statistics()
RETURNS TABLE (
    total_catalog_items INTEGER,
    total_offers INTEGER,
    active_offers INTEGER,
    vendors_with_offers INTEGER,
    categories_with_products INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.product_catalog) as total_catalog_items,
        (SELECT COUNT(*)::INTEGER FROM public.product_offers) as total_offers,
        (SELECT COUNT(*)::INTEGER FROM public.product_offers WHERE is_active = true) as active_offers,
        (SELECT COUNT(DISTINCT vendor_id)::INTEGER FROM public.product_offers WHERE is_active = true) as vendors_with_offers,
        (SELECT COUNT(DISTINCT category_id)::INTEGER FROM public.product_catalog) as categories_with_products;
END;
$$ LANGUAGE plpgsql;
