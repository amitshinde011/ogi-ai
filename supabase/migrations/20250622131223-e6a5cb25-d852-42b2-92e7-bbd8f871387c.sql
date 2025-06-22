
-- Create coupon_codes table to store coupon information
CREATE TABLE public.coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add some sample coupon codes
INSERT INTO public.coupon_codes (code, discount_percentage, is_active, usage_limit, valid_from, valid_until) VALUES
  ('WELCOME10', 10.00, true, 100, now(), now() + interval '30 days'),
  ('SAVE20', 20.00, true, 50, now(), now() + interval '60 days'),
  ('NEWUSER15', 15.00, true, 200, now(), now() + interval '90 days');

-- Enable Row Level Security
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read active coupon codes (for validation)
CREATE POLICY "Anyone can read active coupon codes" ON public.coupon_codes
  FOR SELECT
  USING (is_active = true);

-- Create policy for admins to manage coupon codes (you can modify this based on your admin system)
CREATE POLICY "Allow insert/update coupon codes" ON public.coupon_codes
  FOR ALL
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_coupon_codes_updated_at
  BEFORE UPDATE ON public.coupon_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
