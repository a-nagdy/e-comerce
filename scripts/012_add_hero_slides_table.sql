-- Create hero_slides table for multiple hero sections
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/categories',
  background_image TEXT,
  background_color TEXT DEFAULT '#3b82f6',
  text_color TEXT DEFAULT '#ffffff',
  overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero slide
INSERT INTO public.hero_slides (title, subtitle, cta_text, cta_link, sort_order, is_active) VALUES
('Discover Amazing Products from Trusted Vendors', 'Shop from thousands of products across multiple categories with fast shipping and secure checkout.', 'Start Shopping', '/categories', 1, true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON public.hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON public.hero_slides(sort_order);

-- Enable Row Level Security
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all to read active hero slides" ON public.hero_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin to manage hero slides" ON public.hero_slides
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_hero_slides_updated_at 
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
