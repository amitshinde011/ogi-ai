-- Update automation users to use more realistic profile photos
UPDATE public.automation_users
SET profile_photo_url = CASE
  WHEN name = 'Chef Maria' THEN 'https://images.unsplash.com/photo-1607631568011-da5b2b8c4d1d?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Dietician Sarah' THEN 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Fitness Coach Alex' THEN 'https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Home Cook Emma' THEN 'https://images.unsplash.com/photo-1611432579699-484f7990b127?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Nutritionist John' THEN 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Wellness Coach Maya' THEN 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Chef Raj' THEN 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Health Coach Priya' THEN 'https://images.unsplash.com/photo-1592621385612-4d7129426394?q=80&w=400&h=400&fit=crop'
  WHEN name = 'Yoga Instructor Amit' THEN 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=400&h=400&fit=crop'
  ELSE profile_photo_url
END;

-- Update the trigger to use real images for new automation users based on persona type
CREATE OR REPLACE FUNCTION public.set_automation_user_profile_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_photo_url IS NULL THEN
    -- Choose realistic photos based on persona type
    NEW.profile_photo_url := CASE 
      WHEN NEW.persona_type = 'health_enthusiast' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1579628573859-eee1f9a04ab3?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1562771379-eafdca7a02f8?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      WHEN NEW.persona_type = 'foodie' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1587241321921-91a834d6d191?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1584729724879-75a56129bddf?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1514846326710-096e4a8035e0?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      WHEN NEW.persona_type = 'home_cook' THEN 
        (ARRAY[
          'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop'
        ])[floor(random()*3+1)]
      ELSE 
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=400&fit=crop'
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;