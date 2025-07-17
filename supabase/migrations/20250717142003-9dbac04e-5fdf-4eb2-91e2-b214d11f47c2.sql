-- Fix invalid timezones and add more meal content
-- First, fix the invalid timezone
UPDATE public.automation_users 
SET timezone = 'America/Mexico_City' 
WHERE timezone = 'America/Guadalajara';

-- Add more diverse meal content to solve the "No meal content found" issue
INSERT INTO public.automation_meal_content (meal_type, cuisine_type, ingredients, dietary_tags) VALUES
-- Indian breakfast options
('breakfast', 'indian', ARRAY['oats', 'milk', 'cardamom', 'nuts'], ARRAY['vegetarian', 'healthy']),
('breakfast', 'indian', ARRAY['dosa', 'coconut chutney', 'sambar'], ARRAY['vegetarian', 'traditional']),
('breakfast', 'indian', ARRAY['poha', 'onions', 'turmeric', 'peas'], ARRAY['vegetarian', 'light']),
('breakfast', 'indian', ARRAY['idli', 'sambar', 'coconut chutney'], ARRAY['vegetarian', 'steamed']),

-- Indian lunch options
('lunch', 'indian', ARRAY['rice', 'dal', 'vegetables', 'roti'], ARRAY['vegetarian', 'complete']),
('lunch', 'indian', ARRAY['biryani', 'raita', 'pickle'], ARRAY['rice', 'flavorful']),
('lunch', 'indian', ARRAY['rajma', 'rice', 'onions'], ARRAY['protein', 'beans']),
('lunch', 'indian', ARRAY['chole', 'bhature', 'salad'], ARRAY['chickpeas', 'indulgent']),

-- Indian dinner options  
('dinner', 'indian', ARRAY['roti', 'sabzi', 'dal', 'rice'], ARRAY['vegetarian', 'balanced']),
('dinner', 'indian', ARRAY['khichdi', 'ghee', 'papad'], ARRAY['comfort', 'easy']),
('dinner', 'indian', ARRAY['paneer curry', 'naan', 'salad'], ARRAY['protein', 'creamy']),

-- Mediterranean breakfast options
('breakfast', 'mediterranean', ARRAY['greek yogurt', 'honey', 'nuts', 'berries'], ARRAY['protein', 'fresh']),
('breakfast', 'mediterranean', ARRAY['avocado toast', 'olive oil', 'tomatoes'], ARRAY['healthy fats', 'fresh']),
('breakfast', 'mediterranean', ARRAY['omelette', 'feta', 'herbs', 'olives'], ARRAY['protein', 'herbs']),

-- Mediterranean lunch options
('lunch', 'mediterranean', ARRAY['quinoa salad', 'olives', 'feta', 'cucumber'], ARRAY['protein', 'fresh']),
('lunch', 'mediterranean', ARRAY['hummus', 'pita', 'vegetables'], ARRAY['plant-based', 'fiber']),
('lunch', 'mediterranean', ARRAY['grilled fish', 'lemon', 'herbs', 'salad'], ARRAY['omega-3', 'light']),

-- Mediterranean dinner options
('dinner', 'mediterranean', ARRAY['pasta', 'olive oil', 'tomatoes', 'basil'], ARRAY['carbs', 'fresh']),
('dinner', 'mediterranean', ARRAY['grilled chicken', 'herbs', 'roasted vegetables'], ARRAY['protein', 'roasted']),
('dinner', 'mediterranean', ARRAY['moussaka', 'eggplant', 'cheese'], ARRAY['traditional', 'comfort']),

-- Snack options for both cuisines
('snack', 'indian', ARRAY['samosa', 'chutney'], ARRAY['crispy', 'traditional']),
('snack', 'indian', ARRAY['bhel puri', 'sev', 'chutneys'], ARRAY['street food', 'tangy']),
('snack', 'mediterranean', ARRAY['nuts', 'dried fruits'], ARRAY['healthy', 'energy']),
('snack', 'mediterranean', ARRAY['olives', 'cheese', 'crackers'], ARRAY['savory', 'light']);

-- Add validation for future timezone entries by creating a constraint
-- (We'll handle this in the application code instead of DB constraint for flexibility)