-- Add diverse meal content for different cuisines
INSERT INTO automation_meal_content (meal_type, cuisine_type, ingredients, image_url) VALUES

-- Breakfast options
('breakfast', 'american', ARRAY['oats', 'berries', 'almond_milk'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'californian', ARRAY['avocado', 'sourdough', 'tomatoes'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'southwestern', ARRAY['black_beans', 'peppers', 'corn'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'brazilian', ARRAY['acai', 'banana', 'granola'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'middle_eastern', ARRAY['pita', 'hummus', 'olives'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'australian', ARRAY['greek_yogurt', 'muesli', 'honey'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),
('breakfast', 'japanese', ARRAY['miso', 'tofu', 'seaweed'], 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'),

-- Lunch options
('lunch', 'american', ARRAY['chicken', 'quinoa', 'vegetables'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'californian', ARRAY['avocado', 'kale', 'salmon'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'southwestern', ARRAY['turkey', 'sweet_potato', 'peppers'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'brazilian', ARRAY['acai', 'quinoa', 'nuts'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'middle_eastern', ARRAY['lentils', 'bulgur', 'herbs'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'australian', ARRAY['kangaroo', 'sweet_potato', 'spinach'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'japanese', ARRAY['tempeh', 'brown_rice', 'vegetables'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'peruvian', ARRAY['quinoa', 'sweet_potato', 'beans'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'argentinian', ARRAY['beef', 'chimichurri', 'grains'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),
('lunch', 'mexican', ARRAY['beans', 'corn', 'avocado'], 'https://images.unsplash.com/photo-1565299585323-38174c5ab96e?w=800&h=600&fit=crop'),

-- Dinner options
('dinner', 'american', ARRAY['salmon', 'broccoli', 'rice'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'californian', ARRAY['avocado', 'fish', 'vegetables'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'southwestern', ARRAY['chicken', 'beans', 'peppers'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'brazilian', ARRAY['acai', 'fish', 'coconut'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'middle_eastern', ARRAY['lamb', 'bulgur', 'herbs'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'australian', ARRAY['beef', 'vegetables', 'herbs'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'japanese', ARRAY['tofu', 'vegetables', 'miso'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'peruvian', ARRAY['quinoa', 'fish', 'vegetables'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'argentinian', ARRAY['beef', 'vegetables', 'grains'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),
('dinner', 'mexican', ARRAY['beans', 'avocado', 'peppers'], 'https://images.unsplash.com/photo-1627662056862-9eb8705b8a77?w=800&h=600&fit=crop'),

-- Snack options
('snack', 'american', ARRAY['nuts', 'fruits'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'californian', ARRAY['avocado', 'crackers'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'southwestern', ARRAY['peppers', 'hummus'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'brazilian', ARRAY['acai', 'coconut'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'middle_eastern', ARRAY['dates', 'nuts'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'australian', ARRAY['macadamia', 'berries'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'japanese', ARRAY['edamame', 'seaweed'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'peruvian', ARRAY['quinoa', 'nuts'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'argentinian', ARRAY['nuts', 'dried_fruit'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop'),
('snack', 'mexican', ARRAY['avocado', 'lime'], 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&h=600&fit=crop');