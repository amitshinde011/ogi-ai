-- Fix automation user profile pictures by updating user_profiles table to match automation_users
UPDATE user_profiles 
SET profile_photo_url = au.profile_photo_url 
FROM automation_users au 
WHERE user_profiles.user_id = au.user_id 
AND au.profile_photo_url IS NOT NULL;

-- Update meal content with proper meal images that match ingredients
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND cuisine_type = 'american' AND 'acai' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND cuisine_type = 'indian' AND 'idli' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND cuisine_type = 'indian' AND 'curry' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop' WHERE meal_type = 'snack' AND cuisine_type = 'mediterranean' AND 'hummus' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND cuisine_type = 'mediterranean' AND 'salad' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND cuisine_type = 'american' AND 'pancakes' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND cuisine_type = 'american' AND 'burger' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND cuisine_type = 'american' AND 'salmon' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND cuisine_type = 'indian' AND 'biryani' = ANY(ingredients);
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND cuisine_type = 'mediterranean' AND 'pasta' = ANY(ingredients);

-- Set fallback images for any remaining null image_urls
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND image_url IS NULL;
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND image_url IS NULL;
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND image_url IS NULL;
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop' WHERE meal_type = 'snack' AND image_url IS NULL;