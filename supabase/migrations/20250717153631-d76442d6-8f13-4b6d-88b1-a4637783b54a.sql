-- Update meal content with more reliable healthy vegetarian food images
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND ingredients @> ARRAY['oats'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND ingredients @> ARRAY['quinoa'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND ingredients @> ARRAY['chia seeds'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND ingredients @> ARRAY['avocado'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&h=600&fit=crop' WHERE meal_type = 'breakfast' AND ingredients @> ARRAY['green smoothie'];

-- Update lunch images with healthy vegetarian meals
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND ingredients @> ARRAY['lentils'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND ingredients @> ARRAY['chickpeas'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND ingredients @> ARRAY['quinoa salad'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND ingredients @> ARRAY['mixed greens'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop' WHERE meal_type = 'lunch' AND ingredients @> ARRAY['vegetable stir fry'];

-- Update dinner images with healthy vegetarian meals
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND ingredients @> ARRAY['black beans'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND ingredients @> ARRAY['lentil curry'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND ingredients @> ARRAY['roasted vegetables'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND ingredients @> ARRAY['vegetable soup'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop' WHERE meal_type = 'dinner' AND ingredients @> ARRAY['vegetable curry'];

-- Update snack images with healthy vegetarian snacks
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop' WHERE meal_type = 'snack' AND ingredients @> ARRAY['roasted chickpeas'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop' WHERE meal_type = 'snack' AND ingredients @> ARRAY['hummus'];
UPDATE automation_meal_content SET image_url = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop' WHERE meal_type = 'snack' AND ingredients @> ARRAY['green tea'];

-- Delete any old posts that might have unhealthy content
DELETE FROM posts WHERE created_at < NOW() - INTERVAL '2 hours' AND author_id IN (
  SELECT user_id FROM automation_users WHERE user_id IS NOT NULL
);

-- Refresh the community feed view
SELECT refresh_community_feed_view();