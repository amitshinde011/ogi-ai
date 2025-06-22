
-- Add a 100% discount coupon code
INSERT INTO public.coupon_codes (code, discount_percentage, is_active, usage_limit, valid_from, valid_until) 
VALUES ('FREE100', 100.00, true, 10, now(), now() + interval '90 days');
