-- Migration script to transition from old products system to new catalog system

-- 1. First migrate existing products to catalog + offers structure
INSERT INTO public.product_catalog (
    name,
    brand,
    category_id,
    base_description,
    specifications,
    images,
    slug,
    is_active,
    created_by,
    created_at,
    updated_at
)
SELECT DISTINCT
    p.name,
    -- Try to extract brand from product name (basic extraction)
    CASE 
        WHEN p.name ILIKE '%apple%' THEN 'Apple'
        WHEN p.name ILIKE '%samsung%' THEN 'Samsung'
        WHEN p.name ILIKE '%sony%' THEN 'Sony'
        WHEN p.name ILIKE '%nike%' THEN 'Nike'
        WHEN p.name ILIKE '%adidas%' THEN 'Adidas'
        WHEN p.name ILIKE '%microsoft%' THEN 'Microsoft'
        WHEN p.name ILIKE '%google%' THEN 'Google'
        ELSE NULL
    END as brand,
    p.category_id,
    p.description as base_description,
    jsonb_build_object(
        'weight', p.weight,
        'dimensions', p.dimensions,
        'barcode', p.barcode
    ) as specifications,
    -- Convert JSONB images array to TEXT[] array
    CASE 
        WHEN p.images IS NOT NULL AND jsonb_typeof(p.images) = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(p.images))
        ELSE ARRAY[]::TEXT[]
    END as images,
    LOWER(REPLACE(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9\s]', '', 'g'), ' ', '-')) as slug,
    p.is_active,
    v.user_id as created_by,
    p.created_at,
    p.updated_at
FROM public.products p
JOIN public.vendors v ON p.vendor_id = v.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_catalog pc 
    WHERE pc.name = p.name AND pc.category_id = p.category_id
)
GROUP BY p.name, p.category_id, p.description, p.weight, p.dimensions, p.barcode, 
         p.images, p.is_active, v.user_id, p.created_at, p.updated_at;

-- 2. Create product offers from existing products
INSERT INTO public.product_offers (
    catalog_id,
    vendor_id,
    price,
    compare_price,
    condition,
    sku,
    inventory_quantity,
    track_inventory,
    title,
    description,
    images,
    is_active,
    is_featured,
    created_at,
    updated_at
)
SELECT 
    pc.id as catalog_id,
    p.vendor_id,
    p.price,
    p.compare_price,
    'new' as condition, -- Default condition
    p.sku,
    p.inventory_quantity,
    p.track_inventory,
    p.name as title,
    p.short_description as description,
    -- Convert JSONB images array to TEXT[] array for offers
    CASE 
        WHEN p.images IS NOT NULL AND jsonb_typeof(p.images) = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(p.images))
        ELSE ARRAY[]::TEXT[]
    END as images,
    p.is_active,
    p.is_featured,
    p.created_at,
    p.updated_at
FROM public.products p
JOIN public.product_catalog pc ON (
    pc.name = p.name 
    AND pc.category_id = p.category_id
);

-- 3. Migrate product variants to offer variants
-- For now, we'll handle variants as separate offers with variant info in color/size fields
INSERT INTO public.product_offers (
    catalog_id,
    vendor_id,
    price,
    compare_price,
    condition,
    color,
    size,
    storage,
    other_variants,
    sku,
    inventory_quantity,
    track_inventory,
    title,
    description,
    images,
    is_active,
    is_featured,
    created_at,
    updated_at
)
SELECT 
    po.catalog_id,
    p.vendor_id,
    COALESCE(pv.price, po.price) as price,
    COALESCE(pv.compare_price, po.compare_price) as compare_price,
    'new' as condition,
    (pv.options->>'color')::VARCHAR(50) as color,
    (pv.options->>'size')::VARCHAR(50) as size,
    (pv.options->>'storage')::VARCHAR(50) as storage,
    pv.options as other_variants,
    pv.sku,
    pv.inventory_quantity,
    true as track_inventory,
    p.name || ' - ' || pv.name as title,
    p.short_description as description,
    -- Handle variant images properly
    CASE 
        WHEN pv.image_url IS NOT NULL 
        THEN ARRAY[pv.image_url]::TEXT[]
        WHEN p.images IS NOT NULL AND jsonb_typeof(p.images) = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(p.images))
        ELSE ARRAY[]::TEXT[]
    END as images,
    pv.is_active,
    false as is_featured,
    pv.created_at,
    NOW() as updated_at
FROM public.product_variants pv
JOIN public.products p ON pv.product_id = p.id
JOIN public.product_offers po ON po.catalog_id IN (
    SELECT pc.id FROM public.product_catalog pc 
    WHERE pc.name = p.name AND pc.category_id = p.category_id
) AND po.vendor_id = p.vendor_id;

-- 4. Update existing products table to link to catalog
UPDATE public.products 
SET catalog_id = pc.id,
    is_catalog_linked = true
FROM public.product_catalog pc
WHERE pc.name = products.name 
  AND pc.category_id = products.category_id;

-- 5. Generate keywords for existing catalog items
WITH keyword_data AS (
    SELECT 
        pc.id as catalog_id,
        pc.brand,
        UNNEST(string_to_array(
            LOWER(REGEXP_REPLACE(pc.name, '[^a-zA-Z0-9\s]', ' ', 'g')), 
            ' '
        )) as keyword
    FROM public.product_catalog pc
    WHERE pc.brand IS NOT NULL
)
INSERT INTO public.product_keywords (catalog_id, keyword, weight)
SELECT 
    catalog_id,
    keyword,
    CASE 
        WHEN keyword = LOWER(brand) THEN 3
        ELSE 1
    END as weight
FROM keyword_data
WHERE LENGTH(keyword) > 2 AND keyword != '';

-- 6. Remove any remaining duplicates
DELETE FROM public.product_keywords a USING public.product_keywords b 
WHERE a.id > b.id AND a.catalog_id = b.catalog_id AND a.keyword = b.keyword;

-- 7. Update order_items to reference catalog system
-- Add new columns to order_items for catalog compatibility
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES public.product_catalog(id),
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.product_offers(id);

-- Update order_items with catalog references
UPDATE public.order_items oi
SET catalog_id = p.catalog_id,
    offer_id = po.id
FROM public.products p
JOIN public.product_offers po ON po.catalog_id = p.catalog_id AND po.vendor_id = p.vendor_id
WHERE oi.product_id = p.id
  AND p.catalog_id IS NOT NULL;

-- 8. Update cart_items for catalog compatibility
-- Add new columns to cart_items
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES public.product_offers(id);

-- Update cart_items with offer references
UPDATE public.cart_items ci
SET offer_id = po.id
FROM public.products p
JOIN public.product_offers po ON po.catalog_id = p.catalog_id AND po.vendor_id = p.vendor_id
WHERE ci.product_id = p.id
  AND p.catalog_id IS NOT NULL;

-- 9. Create a view for backward compatibility
CREATE OR REPLACE VIEW public.products_with_catalog AS
SELECT 
    p.*,
    pc.name as catalog_name,
    pc.brand as catalog_brand,
    pc.base_description as catalog_description,
    po.id as primary_offer_id,
    po.price as best_price,
    po.inventory_quantity as total_inventory
FROM public.products p
LEFT JOIN public.product_catalog pc ON p.catalog_id = pc.id
LEFT JOIN public.product_offers po ON po.catalog_id = pc.id 
WHERE po.id = (
    SELECT po2.id 
    FROM public.product_offers po2 
    WHERE po2.catalog_id = pc.id 
    ORDER BY po2.price ASC, po2.created_at ASC 
    LIMIT 1
);

-- 10. Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_catalog_id ON public.products(catalog_id);
CREATE INDEX IF NOT EXISTS idx_order_items_catalog_id ON public.order_items(catalog_id);
CREATE INDEX IF NOT EXISTS idx_order_items_offer_id ON public.order_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_offer_id ON public.cart_items(offer_id);

-- 11. Add RLS policies for compatibility
-- Allow users to see their cart items with offers
CREATE POLICY "Users can view their cart offers" ON public.cart_items
    FOR SELECT USING (user_id = auth.uid());

-- Allow authenticated users to manage their cart offers
CREATE POLICY "Users can manage their cart offers" ON public.cart_items
    FOR ALL USING (user_id = auth.uid());

-- 12. Update statistics
-- Create a function to get catalog statistics
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
        (SELECT COUNT(*)::INTEGER FROM public.product_catalog WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM public.product_offers WHERE is_active = true),
        (SELECT COUNT(*)::INTEGER FROM public.product_offers WHERE is_active = true AND inventory_quantity > 0),
        (SELECT COUNT(DISTINCT vendor_id)::INTEGER FROM public.product_offers WHERE is_active = true),
        (SELECT COUNT(DISTINCT category_id)::INTEGER FROM public.product_catalog WHERE is_active = true);
END;
$$ LANGUAGE plpgsql;

-- 13. Create notification for migration completion
DO $$
DECLARE
    catalog_count INTEGER;
    offers_count INTEGER;
    products_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO catalog_count FROM public.product_catalog;
    SELECT COUNT(*) INTO offers_count FROM public.product_offers;
    SELECT COUNT(*) INTO products_count FROM public.products WHERE is_catalog_linked = true;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Created % catalog items', catalog_count;
    RAISE NOTICE 'Created % product offers', offers_count;
    RAISE NOTICE 'Linked % existing products to catalog', products_count;
END $$;
