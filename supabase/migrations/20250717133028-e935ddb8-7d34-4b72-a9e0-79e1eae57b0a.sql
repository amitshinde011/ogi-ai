-- Update automation_meal_content table to make image_url optional since we generate images dynamically
ALTER TABLE public.automation_meal_content ALTER COLUMN image_url DROP NOT NULL;