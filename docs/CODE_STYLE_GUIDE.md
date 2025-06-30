
# Code Style Guide

## Overview
This document establishes coding standards and best practices for the Yogi AI project to ensure consistency, maintainability, and code quality across the team.

## TypeScript Standards

### Type Definitions
Always use explicit types for better code documentation and error prevention.

```typescript
// ✅ Good - Explicit interface
interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
}

// ❌ Avoid - Any type
const user: any = getUserData();

// ✅ Good - Proper typing
const user: UserProfile = getUserData();
```

### Function Typing
```typescript
// ✅ Good - Function with proper types
const formatUserName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// ✅ Good - Async function typing
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};
```

### Generic Types
```typescript
// ✅ Good - Generic hook typing
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useApi = <T>(endpoint: string): UseApiResult<T> => {
  // Implementation
};
```

## React Component Standards

### Component Structure
```typescript
// ✅ Good - Proper component structure
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserCardProps {
  user: UserProfile;
  onEdit: (userId: string) => void;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  className = '' 
}) => {
  const handleEditClick = () => {
    onEdit(user.id);
  };

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <Button onClick={handleEditClick}>
        Edit Profile
      </Button>
    </div>
  );
};

export default UserCard;
```

### Hooks Usage
```typescript
// ✅ Good - Custom hook pattern
const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};
```

### Event Handlers
```typescript
// ✅ Good - Proper event handler typing
const LoginForm: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Handle input changes
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        name="email" 
        onChange={handleInputChange}
      />
    </form>
  );
};
```

## Naming Conventions

### Variables and Functions
```typescript
// ✅ Good - Descriptive camelCase
const userAuthToken = getAuthToken();
const isUserLoggedIn = checkAuthStatus();

// ❌ Avoid - Unclear abbreviations
const usrTkn = getToken();
const isAuth = checkStatus();
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

### Components and Files
```typescript
// ✅ Good - PascalCase for components
const UserProfileCard = () => { /* */ };
const PaymentGatewaySelector = () => { /* */ };

// ✅ Good - File names match component names
// UserProfileCard.tsx
// PaymentGatewaySelector.tsx
```

## Import Organization

### Import Order
```typescript
// 1. React and core libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// 2. External UI libraries
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// 3. Internal utilities and hooks
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';

// 4. Internal components
import UserProfile from '@/components/UserProfile';
import LoadingSpinner from '@/components/LoadingSpinner';

// 5. Types (if not inline)
import type { UserProfile, ApiResponse } from '@/types';
```

### Path Aliases
Always use configured path aliases for clean imports:
```typescript
// ✅ Good - Using path aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// ❌ Avoid - Relative paths from deep nesting
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
```

## Error Handling

### Try-Catch Blocks
```typescript
// ✅ Good - Proper error handling
const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profile);
      
    if (error) throw error;
    
    toast({
      title: "Profile saved successfully",
      variant: "default"
    });
  } catch (error) {
    console.error('Failed to save profile:', error);
    toast({
      title: "Failed to save profile",
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: "destructive"
    });
  }
};
```

### Error Boundaries
```typescript
// ✅ Good - Error boundary implementation
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Database Operations

### Supabase Query Patterns
```typescript
// ✅ Good - Proper query structure
const fetchUserSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      programs (
        id,
        name,
        duration_days
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Query error:', error);
    throw new Error('Failed to fetch subscriptions');
  }

  return data;
};
```

### RLS Policy Adherence
```typescript
// ✅ Good - User-scoped queries
const getUserData = async () => {
  // RLS automatically filters to current user
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .single(); // Current user only due to RLS
    
  return { data, error };
};
```

## CSS and Styling

### Tailwind Class Organization
```typescript
// ✅ Good - Organized class names
const className = [
  // Layout
  'flex items-center justify-between',
  // Spacing
  'p-4 mb-6',
  // Colors
  'bg-white text-slate-900',
  // Effects
  'rounded-lg shadow-md hover:shadow-lg',
  // Responsive
  'md:p-6 lg:p-8'
].join(' ');
```

### Custom CSS Classes
```css
/* ✅ Good - BEM-like naming */
.user-card {
  @apply bg-white rounded-lg shadow-md;
}

.user-card__title {
  @apply text-lg font-semibold text-slate-900;
}

.user-card__content {
  @apply text-sm text-slate-600;
}

.user-card--highlighted {
  @apply border-2 border-blue-500;
}
```

## Comments and Documentation

### Function Documentation
```typescript
/**
 * Formats a user's full name from first and last name components
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param includeMiddle - Whether to include middle name if available
 * @returns Formatted full name string
 */
const formatFullName = (
  firstName: string, 
  lastName: string, 
  includeMiddle: boolean = false
): string => {
  // Implementation
};
```

### Complex Logic Comments
```typescript
// Calculate subscription end date based on program duration
// Add duration to start date, accounting for weekends and holidays
const calculateEndDate = (startDate: Date, durationDays: number): Date => {
  // Business logic explanation
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  
  // Adjust for weekends (move to next Monday if ends on weekend)
  if (endDate.getDay() === 0) { // Sunday
    endDate.setDate(endDate.getDate() + 1);
  } else if (endDate.getDay() === 6) { // Saturday
    endDate.setDate(endDate.getDate() + 2);
  }
  
  return endDate;
};
```

## Performance Best Practices

### React Optimization
```typescript
// ✅ Good - Memoization for expensive operations
const ExpensiveComponent = React.memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return expensiveDataProcessing(data);
  }, [data]);

  const handleClick = useCallback((id: string) => {
    // Handle click logic
  }, []);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

### Code Splitting
```typescript
// ✅ Good - Lazy loading for routes
const LazyProfilePage = lazy(() => import('@/pages/Profile'));
const LazySettingsPage = lazy(() => import('@/pages/Settings'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/profile" element={<LazyProfilePage />} />
      <Route path="/settings" element={<LazySettingsPage />} />
    </Routes>
  </Suspense>
);
```

## Testing Guidelines

### Component Testing
```typescript
// ✅ Good - Component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '@/components/UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  const mockOnEdit = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
  });

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

## Git Commit Standards

### Commit Message Format
```bash
# ✅ Good - Conventional commits
feat: add user profile photo upload functionality
fix: resolve payment gateway timeout issue
docs: update API documentation for recipes endpoint
style: improve button hover states and transitions
refactor: extract payment logic into custom hook
test: add unit tests for user authentication flow

# ❌ Avoid - Unclear messages
update stuff
fix bug
changes
```

### Branch Naming
```bash
# ✅ Good - Descriptive branch names
feature/user-profile-photo-upload
fix/payment-gateway-timeout
docs/api-documentation-update
refactor/payment-logic-extraction

# ❌ Avoid - Unclear branch names
fix-stuff
update
feature-branch
```

Following these code style guidelines ensures consistent, maintainable, and high-quality code across the Yogi AI project.
