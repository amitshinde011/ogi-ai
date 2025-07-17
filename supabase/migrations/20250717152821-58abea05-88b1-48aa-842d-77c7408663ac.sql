-- Clear existing meal content and replace with healthy vegetarian meals only
DELETE FROM automation_meal_content;

-- Insert healthy vegetarian meal content with matching images
INSERT INTO automation_meal_content (meal_type, cuisine_type, dietary_tags, ingredients, image_url) VALUES
-- Healthy Breakfast Options
('breakfast', 'indian', ARRAY['vegetarian', 'healthy', 'fiber'], ARRAY['oats', 'fruits', 'nuts'], 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop'),
('breakfast', 'indian', ARRAY['vegetarian', 'healthy', 'protein'], ARRAY['quinoa', 'berries', 'almonds'], 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&h=600&fit=crop'),
('breakfast', 'mediterranean', ARRAY['vegetarian', 'healthy', 'antioxidants'], ARRAY['chia seeds', 'banana', 'greek yogurt'], 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=800&h=600&fit=crop'),
('breakfast', 'mediterranean', ARRAY['vegetarian', 'healthy', 'fiber'], ARRAY['avocado', 'whole grain toast', 'seeds'], 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop'),
('breakfast', 'asian', ARRAY['vegetarian', 'healthy', 'probiotics'], ARRAY['green smoothie', 'spinach', 'mango'], 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&fit=crop'),

-- Healthy Lunch Options  
('lunch', 'indian', ARRAY['vegetarian', 'healthy', 'protein'], ARRAY['lentils', 'vegetables', 'brown rice'], 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop'),
('lunch', 'indian', ARRAY['vegetarian', 'healthy', 'fiber'], ARRAY['chickpeas', 'quinoa', 'vegetables'], 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&h=600&fit=crop'),
('lunch', 'mediterranean', ARRAY['vegetarian', 'healthy', 'omega3'], ARRAY['quinoa salad', 'vegetables', 'olive oil'], 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'),
('lunch', 'mediterranean', ARRAY['vegetarian', 'healthy', 'antioxidants'], ARRAY['mixed greens', 'nuts', 'seeds'], 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop'),
('lunch', 'asian', ARRAY['vegetarian', 'healthy', 'vitamins'], ARRAY['vegetable stir fry', 'tofu', 'brown rice'], 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop'),

-- Healthy Dinner Options
('dinner', 'indian', ARRAY['vegetarian', 'healthy', 'protein'], ARRAY['black beans', 'vegetables', 'quinoa'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'indian', ARRAY['vegetarian', 'healthy', 'fiber'], ARRAY['lentil curry', 'vegetables', 'millet'], 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'),
('dinner', 'mediterranean', ARRAY['vegetarian', 'healthy', 'omega3'], ARRAY['roasted vegetables', 'chickpeas', 'herbs'], 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop'),
('dinner', 'mediterranean', ARRAY['vegetarian', 'healthy', 'antioxidants'], ARRAY['vegetable soup', 'beans', 'whole grains'], 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop'),
('dinner', 'asian', ARRAY['vegetarian', 'healthy', 'minerals'], ARRAY['vegetable curry', 'tofu', 'brown rice'], 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop'),

-- Healthy Snack Options
('snack', 'indian', ARRAY['vegetarian', 'healthy', 'protein'], ARRAY['roasted chickpeas', 'spices'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'mediterranean', ARRAY['vegetarian', 'healthy', 'fiber'], ARRAY['hummus', 'vegetables', 'whole grain'], 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=600&fit=crop'),
('snack', 'asian', ARRAY['vegetarian', 'healthy', 'antioxidants'], ARRAY['green tea', 'nuts', 'dried fruits'], 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=600&fit=crop');

-- Update caption templates to match healthy vegetarian content
DELETE FROM automation_captions WHERE meal_type IN ('breakfast', 'lunch', 'dinner', 'snack');

INSERT INTO automation_captions (meal_type, persona_type, template_text, variables) VALUES
-- Breakfast captions
('breakfast', 'health_enthusiast', 'Starting the day with nourishing {ingredient1} and {ingredient2}! 🌱 This healthy breakfast fuels my body with natural energy. #HealthyEating #PlantBased', ARRAY['ingredient1', 'ingredient2']),
('breakfast', 'fitness_focused', 'Breakfast fuel: {ingredient1} packed with {ingredient2} for sustained energy! 💪 Ready to tackle the day ahead. #FitnessFood #HealthyStart', ARRAY['ingredient1', 'ingredient2']),
('breakfast', 'mindful_eater', 'Mindful morning with colorful {ingredient1} and {ingredient2}! 🧘‍♀️ Taking time to nourish my body and soul. #MindfulEating #Wellness', ARRAY['ingredient1', 'ingredient2']),

-- Lunch captions  
('lunch', 'health_enthusiast', 'Midday nutrition with protein-rich {ingredient1} and fresh {ingredient2}! 🥗 Keeping my energy steady throughout the day. #HealthyLunch #PlantProtein', ARRAY['ingredient1', 'ingredient2']),
('lunch', 'fitness_focused', 'Power lunch: {ingredient1} with {ingredient2} for optimal performance! 🏃‍♀️ Fueling my active lifestyle. #FitnessNutrition #HealthyLiving', ARRAY['ingredient1', 'ingredient2']),
('lunch', 'mindful_eater', 'Savoring this wholesome combination of {ingredient1} and {ingredient2}! 🙏 Grateful for nourishing food. #GratefulEating #Wholesome', ARRAY['ingredient1', 'ingredient2']),

-- Dinner captions
('dinner', 'health_enthusiast', 'Evening nourishment with hearty {ingredient1} and {ingredient2}! 🌙 Perfect way to end the day with healthy choices. #HealthyDinner #WellnessJourney', ARRAY['ingredient1', 'ingredient2']),
('dinner', 'fitness_focused', 'Recovery dinner: {ingredient1} and {ingredient2} to refuel after a great day! 💪 Supporting my fitness goals. #RecoveryFood #HealthyChoices', ARRAY['ingredient1', 'ingredient2']),
('dinner', 'mindful_eater', 'Ending the day mindfully with nourishing {ingredient1} and {ingredient2}! ✨ Food as medicine for body and soul. #MindfulDinner #SelfCare', ARRAY['ingredient1', 'ingredient2']),

-- Snack captions
('snack', 'health_enthusiast', 'Healthy snack time with {ingredient1}! 🌿 Keeping my energy levels balanced throughout the day. #HealthySnacks #NutrientDense', ARRAY['ingredient1']),
('snack', 'fitness_focused', 'Pre/post workout fuel: {ingredient1} for sustained energy! 🔥 Smart snacking for active lifestyle. #FitnessSnacks #CleanEating', ARRAY['ingredient1']),
('snack', 'mindful_eater', 'Mindful snacking with wholesome {ingredient1}! 🌱 Listening to my body''s needs. #IntuitiveEating #Mindfulness', ARRAY['ingredient1']);