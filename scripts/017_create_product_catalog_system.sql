-- Create Product Catalog System with Multiple Sellers

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Master Product Catalog (canonical products)
CREATE TABLE IF NOT EXISTS public.product_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    category_id UUID REFERENCES public.categories(id),
    base_description TEXT,
    specifications JSONB, -- Store technical specs for matching
    images TEXT[], -- Array of official product images
    gtin VARCHAR(50), -- Global Trade Item Number (barcode/UPC)
    mpn VARCHAR(100), -- Manufacturer Part Number
    slug VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id), -- Who first created this catalog entry
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Product Offers (vendor-specific listings)
CREATE TABLE IF NOT EXISTS public.product_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    
    -- Offer-specific details
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    condition VARCHAR(20) DEFAULT 'new', -- new, used, refurbished
    
    -- Variant details
    color VARCHAR(50),
    size VARCHAR(50),
    storage VARCHAR(50),
    other_variants JSONB, -- Additional variant options
    
    -- Inventory
    sku VARCHAR(100),
    inventory_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Offer-specific content
    title VARCHAR(255), -- Vendor's custom title
    description TEXT,
    images TEXT[], -- Vendor's images
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique offers per vendor per catalog item per variant
    UNIQUE(catalog_id, vendor_id, color, size, storage)
);

-- 3. Product matching keywords for auto-detection
CREATE TABLE IF NOT EXISTS public.product_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID REFERENCES public.product_catalog(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 1, -- Higher weight = more important keyword
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(catalog_id, keyword)
);

-- 4. Brand database for better matching
CREATE TABLE IF NOT EXISTS public.product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    aliases TEXT[], -- Alternative names: ["Apple", "Apple Inc", "Apple Computer"]
    category_ids UUID[], -- Categories this brand is common in
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Product attributes for better matching
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- "storage", "color", "size", "connectivity"
    type VARCHAR(20) NOT NULL, -- "text", "number", "enum"
    possible_values TEXT[], -- For enum types: ["64GB", "128GB", "256GB"]
    category_ids UUID[], -- Which categories use this attribute
    extraction_patterns TEXT[], -- Regex patterns for auto-extraction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Match feedback for learning
CREATE TABLE IF NOT EXISTS public.product_match_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_text VARCHAR(500) NOT NULL,
    suggested_catalog_id UUID REFERENCES public.product_catalog(id),
    user_choice BOOLEAN NOT NULL, -- true = accepted, false = rejected
    actual_catalog_id UUID REFERENCES public.product_catalog(id),
    confidence_score FLOAT,
    user_id UUID REFERENCES public.users(id),
    category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_offers_catalog_price ON public.product_offers(catalog_id, price ASC);
CREATE INDEX IF NOT EXISTS idx_product_offers_vendor ON public.product_offers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_active ON public.product_offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_keywords_keyword ON public.product_keywords USING gin(keyword gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_catalog_search ON public.product_catalog USING gin((name || ' ' || brand || ' ' || model) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON public.product_catalog(category_id);
CREATE INDEX IF NOT EXISTS idx_product_brands_name ON public.product_brands USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_brands_aliases ON public.product_brands USING gin(aliases);

-- 5. Update existing products table (keep for backward compatibility)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES public.product_catalog(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_catalog_linked BOOLEAN DEFAULT false;

-- 6. Create function to get best offer for a catalog item
CREATE OR REPLACE FUNCTION get_best_offer(catalog_item_id UUID)
RETURNS TABLE (
    offer_id UUID,
    vendor_id UUID,
    vendor_name VARCHAR,
    best_price DECIMAL,
    color VARCHAR,
    size VARCHAR,
    storage VARCHAR,
    in_stock BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id as offer_id,
        po.vendor_id,
        v.business_name as vendor_name,
        po.price as best_price,
        po.color,
        po.size,
        po.storage,
        CASE 
            WHEN po.track_inventory THEN po.inventory_quantity > 0
            ELSE true
        END as in_stock
    FROM public.product_offers po
    JOIN public.vendors v ON po.vendor_id = v.id
    WHERE po.catalog_id = catalog_item_id 
        AND po.is_active = true
        AND (
            CASE 
                WHEN po.track_inventory THEN po.inventory_quantity > 0
                ELSE true
            END
        )
    ORDER BY po.price ASC, po.created_at ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 8. Text normalization function
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

-- 9. Extract brand from product name
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

-- 10. Smart product matching with category context
CREATE OR REPLACE FUNCTION find_similar_products_smart(
    product_name VARCHAR,
    category_id UUID DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    catalog_id UUID,
    name VARCHAR,
    brand VARCHAR,
    model TEXT,
    category_name VARCHAR,
    confidence_score FLOAT,
    match_reasons TEXT[]
) AS $$
DECLARE
    extracted_brand VARCHAR;
    normalized_input TEXT;
BEGIN
    -- Extract brand and normalize input
    extracted_brand := extract_brand_from_text(product_name);
    normalized_input := normalize_product_text(product_name);
    
    RETURN QUERY
    WITH scored_products AS (
        SELECT 
            pc.id as catalog_id,
            pc.name,
            pc.brand,
            pc.model,
            c.name as category_name,
            
            -- Name similarity (40% weight)
            similarity(normalize_product_text(pc.name), normalized_input) * 0.4 as name_score,
            
            -- Brand match (30% weight)
            CASE 
                WHEN extracted_brand IS NOT NULL AND pc.brand IS NOT NULL 
                THEN 
                    CASE 
                        WHEN lower(pc.brand) = lower(extracted_brand) THEN 0.3
                        WHEN similarity(pc.brand, extracted_brand) > 0.8 THEN 0.25
                        ELSE 0
                    END
                ELSE 0
            END as brand_score,
            
            -- Category context bonus (20% weight)
            CASE 
                WHEN find_similar_products_smart.category_id IS NOT NULL AND pc.category_id = find_similar_products_smart.category_id THEN 0.2
                WHEN find_similar_products_smart.category_id IS NOT NULL THEN 0.0
                ELSE 0.1  -- Small bonus if no category specified
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

-- 8. RLS Policies
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_keywords ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active catalog items
CREATE POLICY "Anyone can view active catalog items" ON public.product_catalog
    FOR SELECT USING (is_active = true);

-- Allow public read access to active offers
CREATE POLICY "Anyone can view active offers" ON public.product_offers
    FOR SELECT USING (is_active = true);

-- Allow vendors to manage their own offers
CREATE POLICY "Vendors can manage their offers" ON public.product_offers
    FOR ALL USING (
        vendor_id IN (
            SELECT id FROM public.vendors 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to manage everything
CREATE POLICY "Admins can manage catalog" ON public.product_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage offers" ON public.product_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 9. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_catalog_updated_at
    BEFORE UPDATE ON public.product_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_offers_updated_at
    BEFORE UPDATE ON public.product_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Seed initial brand data
INSERT INTO public.product_brands (name, aliases, category_ids) VALUES
-- Electronics brands
('Apple', ARRAY['Apple Inc', 'Apple Computer', 'apple'], NULL),
('Samsung', ARRAY['Samsung Electronics', 'samsung'], NULL),
('Sony', ARRAY['Sony Corporation', 'sony'], NULL),
('Microsoft', ARRAY['Microsoft Corporation', 'MSFT'], NULL),
('Google', ARRAY['Google LLC', 'Alphabet'], NULL),
('Amazon', ARRAY['Amazon.com', 'amazon'], NULL),
('Dell', ARRAY['Dell Technologies', 'Dell Inc'], NULL),
('HP', ARRAY['Hewlett-Packard', 'HPE'], NULL),
('Lenovo', ARRAY['Lenovo Group'], NULL),
('ASUS', ARRAY['ASUSTeK'], NULL),
('Acer', ARRAY['Acer Inc'], NULL),
('LG', ARRAY['LG Electronics'], NULL),
('Huawei', ARRAY['Huawei Technologies'], NULL),
('Xiaomi', ARRAY['Mi'], NULL),
('OnePlus', ARRAY['One Plus'], NULL),
('Nintendo', ARRAY['Nintendo Co'], NULL),

-- Fashion brands
('Nike', ARRAY['nike'], NULL),
('Adidas', ARRAY['adidas'], NULL),
('Puma', ARRAY['puma'], NULL),
('Under Armour', ARRAY['underarmour'], NULL),
('Levi''s', ARRAY['Levis', 'Levi Strauss'], NULL),
('Calvin Klein', ARRAY['CK'], NULL),
('Tommy Hilfiger', ARRAY['Tommy'], NULL),
('Ralph Lauren', ARRAY['Polo Ralph Lauren'], NULL),
('H&M', ARRAY['HM', 'Hennes & Mauritz'], NULL),
('Zara', ARRAY['zara'], NULL),
('Uniqlo', ARRAY['uniqlo'], NULL),

-- Home & Garden brands  
('IKEA', ARRAY['ikea'], NULL),
('Home Depot', ARRAY['homedepot'], NULL),
('Lowes', ARRAY['Lowe''s'], NULL),
('Philips', ARRAY['Philips Electronics'], NULL),
('Dyson', ARRAY['dyson'], NULL),
('Black & Decker', ARRAY['Black+Decker'], NULL),

-- Sports brands
('Wilson', ARRAY['wilson'], NULL),
('Spalding', ARRAY['spalding'], NULL),
('Rawlings', ARRAY['rawlings'], NULL),
('Callaway', ARRAY['callaway'], NULL),
('TaylorMade', ARRAY['taylormade'], NULL),

-- Book publishers
('Penguin', ARRAY['Penguin Random House'], NULL),
('HarperCollins', ARRAY['Harper Collins'], NULL),
('Simon & Schuster', ARRAY['Simon and Schuster'], NULL),
('Macmillan', ARRAY['macmillan'], NULL),
('Scholastic', ARRAY['scholastic'], NULL)

ON CONFLICT (name) DO NOTHING;
