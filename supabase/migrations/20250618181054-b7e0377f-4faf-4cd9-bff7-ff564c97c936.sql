
-- Add India pricing column to programs table
ALTER TABLE public.programs ADD COLUMN price_inr DECIMAL(10,2);

-- Update existing programs with India prices
UPDATE public.programs 
SET price_inr = CASE 
  WHEN duration_days = 21 THEN 999.00
  WHEN duration_days = 49 THEN 1999.00
  WHEN duration_days = 108 THEN 2999.00
  ELSE price_inr
END;
