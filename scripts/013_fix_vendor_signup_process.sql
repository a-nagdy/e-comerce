-- Update the handle_new_user function to also create vendor records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  );

  -- If the user is a vendor, also create a vendor record
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer') = 'vendor' THEN
    INSERT INTO public.vendors (
      user_id,
      business_name,
      business_description,
      status,
      commission_rate,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'Unnamed Business'),
      COALESCE(NEW.raw_user_meta_data ->> 'business_description', ''),
      'pending',  -- All new vendors start as pending
      10.00,      -- Default commission rate
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Update existing vendor record to pending status if it was auto-approved
UPDATE public.vendors 
SET status = 'pending' 
WHERE status = 'approved' 
AND user_id IN (
  SELECT id FROM public.users 
  WHERE role = 'vendor' 
  AND created_at > NOW() - INTERVAL '1 day'
);

-- Fix the role for existing vendor users who were marked as 'customer'
UPDATE public.users 
SET role = 'vendor' 
WHERE id IN (
  SELECT DISTINCT user_id FROM public.vendors
) AND role = 'customer';
