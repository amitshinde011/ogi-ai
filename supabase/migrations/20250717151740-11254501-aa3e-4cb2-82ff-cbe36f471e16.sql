-- Add missing caption templates for dinner
INSERT INTO automation_captions (meal_type, persona_type, template_text, variables) VALUES
('dinner', 'busy_professional', '🍽️ Quick dinner that doesn''t compromise on nutrition! Made this {meal} in 30 minutes. {ingredient} makes it so satisfying! #QuickMeals #BusyLife', ARRAY['meal', 'ingredient']),
('dinner', 'fitness_enthusiast', '💪 Perfect post-workout {meal}! The combination of {ingredient1} and {ingredient2} gives me {benefit}. #PostWorkout #FitnessFood', ARRAY['meal', 'ingredient1', 'ingredient2', 'benefit']),
('dinner', 'nutritionist', '🥗 Tonight''s {meal} is packed with {nutrients}! This combination supports {benefit} and tastes amazing. #NutritionFacts #HealthyEating', ARRAY['meal', 'nutrients', 'benefit']),
('dinner', 'plant_based', '🌱 This plant-based {meal} is everything! {ingredient} is such a versatile ingredient for {meal_time}. #PlantBased #Vegan', ARRAY['meal', 'ingredient', 'meal_time']),

-- Add missing caption templates for snacks
('snack', 'busy_professional', '⏰ Quick {meal} break! This {ingredient} snack keeps me energized between meetings. #SnackTime #ProductivityFuel', ARRAY['meal', 'ingredient']),
('snack', 'fitness_enthusiast', '🏃‍♂️ Pre-workout {meal}! {ingredient} gives me the perfect energy boost for training. #PreWorkout #EnergyBoost', ARRAY['meal', 'ingredient']),
('snack', 'nutritionist', '🍎 Smart {meal} choice! {ingredient} provides {benefit} - perfect for sustained energy. #SmartSnacking #NutritionTips', ARRAY['meal', 'ingredient', 'benefit']),
('snack', 'plant_based', '🌿 Love this plant-based {meal}! {ingredient} is nature''s perfect snack. #PlantPowered #NaturalSnack', ARRAY['meal', 'ingredient']),
('snack', 'wellness_coach', '✨ Mindful {meal} moment! This {ingredient} snack nourishes both body and soul. #MindfulEating #WellnessJourney', ARRAY['meal', 'ingredient']),
('snack', 'traditional_cuisine', '🏺 Traditional {meal} preparation! {ingredient} has been a staple snack in our culture for generations. #Traditional #Heritage', ARRAY['meal', 'ingredient']),

-- Add missing breakfast caption for traditional_cuisine
('breakfast', 'traditional_cuisine', '🌅 Starting the day with traditional {meal}! The way {ingredient1} and {ingredient2} blend together is pure comfort. #Traditional #Heritage', ARRAY['meal', 'ingredient1', 'ingredient2']);