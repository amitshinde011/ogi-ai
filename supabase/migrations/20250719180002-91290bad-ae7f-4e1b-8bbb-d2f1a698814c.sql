-- Add comment templates for missing persona types in automation_comments table

-- Nutritionist persona comments
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('nutritionist', 'encouragement', 'Great balance of nutrients!', ARRAY['healthy', 'nutritious']),
('nutritionist', 'encouragement', 'Love the fiber content here!', ARRAY['healthy', 'nutritious']),
('nutritionist', 'encouragement', 'Perfect protein portion!', ARRAY['healthy', 'nutritious']),
('nutritionist', 'meal_identification', 'Excellent source of vitamins!', ARRAY['healthy', 'nutritious']),
('nutritionist', 'meal_identification', 'Anti-inflammatory ingredients!', ARRAY['healthy', 'nutritious']),
('nutritionist', 'cooking_tip', 'Try adding omega-3 rich seeds!', ARRAY['healthy', 'nutritious']);

-- Plant-based persona comments  
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('plant_based', 'encouragement', 'Plant power at its finest!', ARRAY['vegan', 'plant-based']),
('plant_based', 'encouragement', 'Love this cruelty-free creation!', ARRAY['vegan', 'plant-based']),
('plant_based', 'encouragement', 'Nature''s goodness on a plate!', ARRAY['vegan', 'plant-based']),
('plant_based', 'meal_identification', 'Such vibrant plant colors!', ARRAY['vegan', 'plant-based']),
('plant_based', 'meal_identification', 'Sustainable eating done right!', ARRAY['vegan', 'plant-based']),
('plant_based', 'cooking_tip', 'Perfect plant-based protein combo!', ARRAY['vegan', 'plant-based']);

-- Traditional cuisine persona comments
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('traditional_cuisine', 'encouragement', 'Authentic flavors shine through!', ARRAY['traditional', 'authentic']),
('traditional_cuisine', 'encouragement', 'Just like grandma made it!', ARRAY['traditional', 'authentic']),
('traditional_cuisine', 'encouragement', 'Classic recipe perfection!', ARRAY['traditional', 'authentic']),
('traditional_cuisine', 'meal_identification', 'Traditional cooking at its best!', ARRAY['traditional', 'authentic']),
('traditional_cuisine', 'meal_identification', 'Time-honored preparation methods!', ARRAY['traditional', 'authentic']),
('traditional_cuisine', 'cooking_tip', 'The secret is in the slow cooking!', ARRAY['traditional', 'authentic']);

-- Busy professional persona comments
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('busy_professional', 'encouragement', 'Quick and nutritious - perfect!', ARRAY['quick', 'efficient']),
('busy_professional', 'encouragement', 'Meal prep goals achieved!', ARRAY['quick', 'efficient']),
('busy_professional', 'encouragement', 'Efficient cooking at its finest!', ARRAY['quick', 'efficient']),
('busy_professional', 'meal_identification', 'Perfect for busy schedules!', ARRAY['quick', 'efficient']),
('busy_professional', 'meal_identification', 'Smart meal planning!', ARRAY['quick', 'efficient']),
('busy_professional', 'cooking_tip', 'Batch cooking saves so much time!', ARRAY['quick', 'efficient']);

-- Wellness coach persona comments
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('wellness_coach', 'encouragement', 'Nourishing your body beautifully!', ARRAY['wellness', 'mindful']),
('wellness_coach', 'encouragement', 'Mindful eating in action!', ARRAY['wellness', 'mindful']),
('wellness_coach', 'encouragement', 'Balance and wellness on a plate!', ARRAY['wellness', 'mindful']),
('wellness_coach', 'meal_identification', 'Holistic nutrition approach!', ARRAY['wellness', 'mindful']),
('wellness_coach', 'meal_identification', 'Food as medicine concept!', ARRAY['wellness', 'mindful']),
('wellness_coach', 'cooking_tip', 'Listen to your body''s needs!', ARRAY['wellness', 'mindful']);

-- Fitness enthusiast persona comments
INSERT INTO automation_comments (persona_type, comment_type, template_text, context_tags) VALUES
('fitness_enthusiast', 'encouragement', 'Fuel for your fitness goals!', ARRAY['fitness', 'energy']),
('fitness_enthusiast', 'encouragement', 'Pre-workout nutrition done right!', ARRAY['fitness', 'energy']),
('fitness_enthusiast', 'encouragement', 'Recovery fuel at its best!', ARRAY['fitness', 'energy']),
('fitness_enthusiast', 'meal_identification', 'Perfect post-workout meal!', ARRAY['fitness', 'energy']),
('fitness_enthusiast', 'meal_identification', 'Muscle-building nutrition!', ARRAY['fitness', 'energy']),
('fitness_enthusiast', 'cooking_tip', 'Timing your nutrition perfectly!', ARRAY['fitness', 'energy']);