-- Update automation users to set profile_photo_url for existing records
UPDATE public.automation_users
SET profile_photo_url = CASE
  WHEN name = 'Chef Maria' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=b6e3f4'
  WHEN name = 'Dietician Sarah' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=d1d4f9'
  WHEN name = 'Fitness Coach Alex' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede'
  WHEN name = 'Home Cook Emma' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffdfbf'
  WHEN name = 'Nutritionist John' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=ffd5dc'
  WHEN name = 'Wellness Coach Maya' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=d1f4e3'
  WHEN name = 'Chef Raj' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj&backgroundColor=fadbd8'
  WHEN name = 'Health Coach Priya' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=f9e79f'
  WHEN name = 'Yoga Instructor Amit' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit&backgroundColor=d5f5e3'
  ELSE 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name
END
WHERE profile_photo_url IS NULL;

-- Create a function to handle profile photo generation for new automation users
CREATE OR REPLACE FUNCTION public.set_automation_user_profile_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_photo_url IS NULL THEN
    -- Generate a seed based on name and timezone for consistency
    NEW.profile_photo_url := 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.name || 
                           '&backgroundColor=' || 
                           CASE 
                             WHEN NEW.persona_type = 'health_enthusiast' THEN 'd1f4e3'
                             WHEN NEW.persona_type = 'foodie' THEN 'ffdfbf'
                             WHEN NEW.persona_type = 'home_cook' THEN 'fadbd8'
                             ELSE 'f9e79f'
                           END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set profile photos for new automation users
CREATE TRIGGER set_automation_user_profile_photo_trigger
BEFORE INSERT ON public.automation_users
FOR EACH ROW
EXECUTE FUNCTION public.set_automation_user_profile_photo();