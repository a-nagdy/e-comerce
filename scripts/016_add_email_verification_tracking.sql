-- Add email verification tracking and active status management

-- Add email_verified column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add active column if it doesn't exist (should be boolean, not text)
DO $$ 
BEGIN
    -- Check if active column exists and is text type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'active' 
        AND data_type = 'text'
    ) THEN
        -- Drop the text column and recreate as boolean
        ALTER TABLE public.users DROP COLUMN active;
        ALTER TABLE public.users ADD COLUMN active BOOLEAN DEFAULT false;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'active'
    ) THEN
        -- Column doesn't exist, create it
        ALTER TABLE public.users ADD COLUMN active BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update the handle_new_user function to set email_verified and active status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    email_verified, 
    active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
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

-- Create function to update user verification status
CREATE OR REPLACE FUNCTION public.update_user_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update email_verified and active status based on email_confirmed_at
  UPDATE public.users 
  SET 
    email_verified = (NEW.email_confirmed_at IS NOT NULL),
    active = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update verification status when auth.users is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.update_user_verification_status();

-- Update existing users based on their current email confirmation status
UPDATE public.users 
SET 
  email_verified = (
    SELECT email_confirmed_at IS NOT NULL 
    FROM auth.users 
    WHERE auth.users.id = public.users.id
  ),
  active = (
    SELECT email_confirmed_at IS NOT NULL 
    FROM auth.users 
    WHERE auth.users.id = public.users.id
  )
WHERE EXISTS (
  SELECT 1 FROM auth.users 
  WHERE auth.users.id = public.users.id
);
