
// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: any;
}

// Sanitize HTML input to prevent XSS
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"']/g, (match) => {
      const htmlEntities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return htmlEntities[match] || match;
    })
    .trim();
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Validate file upload
export const validateFileUpload = (file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): ValidationResult => {
  const errors: string[] = [];
  
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB`);
  }
  
  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check file extension
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension must be one of: ${options.allowedExtensions.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate user profile data
export const validateUserProfile = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate name
  if (data.name) {
    if (typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 50) {
      errors.push('Name must be between 2 and 50 characters');
    } else {
      sanitized.name = sanitizeHtml(data.name);
    }
  }
  
  // Validate age
  if (data.age !== undefined) {
    const age = Number(data.age);
    if (isNaN(age) || age < 13 || age > 120) {
      errors.push('Age must be between 13 and 120');
    } else {
      sanitized.age = age;
    }
  }
  
  // Validate weight
  if (data.weight !== undefined) {
    const weight = Number(data.weight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      errors.push('Weight must be between 30 and 300 kg');
    } else {
      sanitized.weight = weight;
    }
  }
  
  // Validate height
  if (data.height !== undefined) {
    const height = Number(data.height);
    if (isNaN(height) || height < 100 || height > 250) {
      errors.push('Height must be between 100 and 250 cm');
    } else {
      sanitized.height = height;
    }
  }
  
  // Validate gender
  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Invalid gender selection');
  } else if (data.gender) {
    sanitized.gender = data.gender;
  }
  
  // Sanitize text fields
  if (data.health_issues) {
    sanitized.health_issues = sanitizeHtml(data.health_issues);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

// Validate community post data
export const validateCommunityPost = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate title
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title is required');
  } else if (data.title.length < 3 || data.title.length > 100) {
    errors.push('Title must be between 3 and 100 characters');
  } else {
    sanitized.title = sanitizeHtml(data.title);
  }
  
  // Validate content
  if (!data.content || typeof data.content !== 'string') {
    errors.push('Content is required');
  } else if (data.content.length < 10 || data.content.length > 2000) {
    errors.push('Content must be between 10 and 2000 characters');
  } else {
    sanitized.content = sanitizeHtml(data.content);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

// Validate wellness tracking data
export const validateWellnessData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate water intake
  if (data.water_litres !== undefined) {
    const water = Number(data.water_litres);
    if (isNaN(water) || water < 0 || water > 10) {
      errors.push('Water intake must be between 0 and 10 litres');
    } else {
      sanitized.water_litres = water;
    }
  }
  
  // Validate surya namaskar count
  if (data.surya_namaskar_count !== undefined) {
    const count = Number(data.surya_namaskar_count);
    if (isNaN(count) || count < 0 || count > 108) {
      errors.push('Surya Namaskar count must be between 0 and 108');
    } else {
      sanitized.surya_namaskar_count = count;
    }
  }
  
  // Validate meditation minutes
  if (data.meditation_minutes !== undefined) {
    const minutes = Number(data.meditation_minutes);
    if (isNaN(minutes) || minutes < 0 || minutes > 180) {
      errors.push('Meditation minutes must be between 0 and 180');
    } else {
      sanitized.meditation_minutes = minutes;
    }
  }
  
  // Validate meditation completed
  if (data.meditation_completed !== undefined) {
    sanitized.meditation_completed = Boolean(data.meditation_completed);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};
