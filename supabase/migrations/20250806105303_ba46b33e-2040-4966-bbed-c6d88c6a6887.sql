-- Create group purchases table
CREATE TABLE public.group_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  target_size INTEGER NOT NULL,
  current_size INTEGER NOT NULL DEFAULT 1,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  base_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  invite_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create group purchase participants table
CREATE TABLE public.group_purchase_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_purchase_id UUID NOT NULL REFERENCES group_purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_id UUID REFERENCES orders(id),
  UNIQUE(group_purchase_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_purchase_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_purchases
CREATE POLICY "Users can view group purchases they organize or participate in" 
ON public.group_purchases 
FOR SELECT 
USING (
  organizer_id = auth.uid() OR 
  id IN (
    SELECT group_purchase_id 
    FROM group_purchase_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create group purchases" 
ON public.group_purchases 
FOR INSERT 
WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update their group purchases" 
ON public.group_purchases 
FOR UPDATE 
USING (organizer_id = auth.uid());

-- RLS policies for group_purchase_participants
CREATE POLICY "Users can view group purchase participants" 
ON public.group_purchase_participants 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  group_purchase_id IN (
    SELECT id FROM group_purchases WHERE organizer_id = auth.uid()
  )
);

CREATE POLICY "Users can join group purchases" 
ON public.group_purchase_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation" 
ON public.group_purchase_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Function to update group purchase when participants join
CREATE OR REPLACE FUNCTION update_group_purchase_size()
RETURNS TRIGGER AS $$
DECLARE
  new_size INTEGER;
  new_discount NUMERIC;
  base_price NUMERIC;
  new_discounted_price NUMERIC;
BEGIN
  -- Get current participant count
  SELECT COUNT(*) INTO new_size
  FROM group_purchase_participants
  WHERE group_purchase_id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  -- Calculate new discount based on size
  SELECT 
    CASE 
      WHEN new_size >= 6 THEN 50
      WHEN new_size >= 5 THEN 45
      WHEN new_size >= 4 THEN 40
      WHEN new_size >= 3 THEN 35
      WHEN new_size >= 2 THEN 30
      ELSE 0
    END INTO new_discount;
  
  -- Get base price and calculate new discounted price
  SELECT gp.base_price INTO base_price
  FROM group_purchases gp
  WHERE gp.id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  new_discounted_price := base_price * (1 - new_discount / 100);
  
  -- Update group purchase
  UPDATE group_purchases 
  SET 
    current_size = new_size,
    discount_percentage = new_discount,
    discounted_price = new_discounted_price,
    updated_at = now()
  WHERE id = COALESCE(NEW.group_purchase_id, OLD.group_purchase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update group purchase size
CREATE TRIGGER update_group_purchase_size_trigger
  AFTER INSERT OR DELETE ON group_purchase_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_group_purchase_size();

-- Function to auto-expire group purchases
CREATE OR REPLACE FUNCTION expire_old_group_purchases()
RETURNS void AS $$
BEGIN
  UPDATE group_purchases 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' AND expires_at < now();
END;
$$ LANGUAGE plpgsql;