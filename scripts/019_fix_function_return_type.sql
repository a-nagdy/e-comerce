-- Fix the find_similar_products_smart function return type
-- Drop the existing function first
DROP FUNCTION IF EXISTS find_similar_products_smart(character varying, uuid, double precision);

-- Recreate with correct return type
CREATE OR REPLACE FUNCTION find_similar_products_smart(
    product_name VARCHAR,
    category_id UUID DEFAULT NULL,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    catalog_id UUID,
    name TEXT,
    brand TEXT,
    model TEXT,
    category_name TEXT,
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
            
            -- Name similarity (main factor - 50% weight)
            similarity(normalize_product_text(pc.name), normalized_input) * 0.5 as name_score,
            
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
    ORDER BY (sp.name_score + sp.brand_score + sp.category_score + sp.model_score) DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
