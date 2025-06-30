
# Project Structure Documentation

## Overview
This document provides a comprehensive guide to the Yogi AI project structure, explaining the purpose and organization of each directory and file.

## Root Directory Structure

```
yogi-ai/
├── docs/                    # Project documentation
├── public/                  # Static assets
├── src/                     # Source code
├── supabase/               # Supabase configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # Project overview
```

## Documentation (`/docs`)

### Core Documentation Files
- `PROJECT_OVERVIEW.md` - Complete project architecture and mission
- `DEVELOPMENT_SETUP.md` - Developer onboarding guide
- `API_DOCUMENTATION.md` - Complete API reference
- `PROJECT_STRUCTURE.md` - This file - project organization
- `DEPLOYMENT.md` - Deployment and hosting guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `USER_JOURNEY.md` - Complete user experience flow
- `COMMUNITY_FEATURES.md` - Community system documentation
- `HOOKS_REFERENCE.md` - Custom hooks documentation

### Legacy Documentation
- `API_REFERENCE.md` - Original API documentation (deprecated)

## Source Code (`/src`)

### Main Application Files
```
src/
├── App.tsx                 # Main application component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles import
```

### Components (`/src/components`)

#### UI Components (`/src/components/ui`)
Reusable UI components from shadcn/ui library:
- `button.tsx` - Button component with variants
- `card.tsx` - Card container components
- `input.tsx` - Form input components
- `toast.tsx` - Notification components
- `dialog.tsx` - Modal dialog components
- And many more shadcn/ui components

#### Feature Components

**Authentication (`/src/components/auth`)**
- `GoogleLoginButton.tsx` - Google OAuth integration
- `LoginForm.tsx` - Email/password login form
- `LoginHeader.tsx` - Login page header with branding
- `TestimonialsCarousel.tsx` - User testimonials slider
- `WellnessCarousel.tsx` - Feature highlights carousel

**Legal Components (`/src/components/legal`)**
- `LegalHeader.tsx` - Shared header for legal pages
- `LegalLayout.tsx` - Common layout for legal documents
- `LegalSection.tsx` - Reusable section component
- `ContactInfo.tsx` - Contact information display

**Payment Components (`/src/components/payment`)**
- `PaymentForm.tsx` - Payment processing form
- `PricingCard.tsx` - Program pricing display
- `PaymentGateway.tsx` - Gateway selection logic

**Recipe Components (`/src/components/recipes`)**
- `RecipeGrid.tsx` - Recipe listing grid
- `RecipeCard.tsx` - Individual recipe display
- `RecipeFilters.tsx` - Recipe filtering controls

**Subscription Components (`/src/components/subscription`)**
- `ProgramCard.tsx` - Program selection card
- `SubscriptionStatus.tsx` - Current subscription display

### Pages (`/src/pages`)

#### Authentication Pages
- `Index.tsx` - Landing/welcome page
- `Login.tsx` - User authentication page
- `Signup.tsx` - User registration page

#### Core Application Pages
- `Home.tsx` - Main dashboard after login
- `Profile.tsx` - User profile display
- `ProfileSetup.tsx` - Initial profile configuration
- `ProfileEdit.tsx` - Profile editing interface
- `Settings.tsx` - Application settings

#### Content Pages
- `Recipes.tsx` - Recipe browsing and management
- `RecipeDetail.tsx` - Individual recipe view
- `SavedRecipes.tsx` - User's saved recipes

#### Community Pages
- `Community.tsx` - Community posts feed
- `PostDetail.tsx` - Individual post view
- `Discover.tsx` - Content discovery page
- `Upload.tsx` - Content upload interface

#### Communication Pages
- `Messages.tsx` - Message inbox
- `Chat.tsx` - Individual conversation
- `Notifications.tsx` - Notification center

#### Subscription & Payment Pages
- `Subscriptions.tsx` - Program selection
- `Payment.tsx` - Payment processing
- `ProgramComplete.tsx` - Program completion

#### Journey & Assessment Pages
- `IntroVideo.tsx` - Welcome video
- `BeforeAssessment.tsx` - Initial assessment
- `JourneyStart.tsx` - Journey beginning
- `FinalAssessment.tsx` - Completion assessment
- `Comparison.tsx` - Before/after comparison
- `Progress.tsx` - Progress tracking

#### Legal Pages
- `PrivacyPolicy.tsx` - Privacy policy document
- `TermsAndConditions.tsx` - Terms of service
- `CancellationsRefunds.tsx` - Refund policy

#### Utility Pages
- `NotFound.tsx` - 404 error page

### Custom Hooks (`/src/hooks`)

#### Authentication Hooks
- `useAuth.ts` - Authentication state management
- `useUserProfile.ts` - User profile data

#### Data Management Hooks
- `useRecipes.ts` - Recipe data fetching
- `useSubscription.ts` - Subscription management
- `usePrograms.ts` - Program data

#### Community Hooks
- `useCommunityPosts.ts` - Community posts management
- `usePostLikes.ts` - Post like functionality
- `useComments.ts` - Comment system
- `useCommentActions.ts` - Comment operations
- `usePostComments.ts` - Comment count tracking
- `usePostOperations.ts` - Post CRUD operations

#### Utility Hooks
- `useAnalytics.ts` - Analytics tracking
- `useLocalStorage.ts` - Local storage management

### Utilities (`/src/utils`)
- `auth.ts` - Authentication utilities
- `validation.ts` - Form validation helpers
- `formatters.ts` - Data formatting functions
- `constants.ts` - Application constants

### Types (`/src/types`)
- `auth.ts` - Authentication type definitions
- `database.ts` - Database schema types
- `api.ts` - API response types

### Integrations (`/src/integrations`)

**Supabase (`/src/integrations/supabase`)**
- `client.ts` - Supabase client configuration
- `types.ts` - Database type definitions

### Styles (`/src/styles`)

#### Main Style Files
- `base.css` - Base styles and CSS variables
- `components.css` - Component-specific styles
- `utilities.css` - Main utilities file (imports modular files)

#### Modular Style Files
- `animations.css` - Animation utilities
- `gradients.css` - Gradient and glass effects
- `navigation.css` - Navigation-specific styles
- `yellow-removal.css` - Yellow color override utilities
- `text-colors.css` - Text color utilities

## Configuration Files

### Build Configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS customization

### Package Management
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependency versions

## Supabase Configuration (`/supabase`)

### Edge Functions (`/supabase/functions`)
- `process-payment/` - Payment processing function

### Database Migrations (`/supabase/migrations`)
- Various SQL migration files for database schema

## File Naming Conventions

### Components
- **React Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserProfile.ts`)

### Directories
- **kebab-case**: For multi-word directories (`legal-components/`)
- **camelCase**: For single concept directories (`auth/`)

### Files
- **Components**: PascalCase matching component name
- **Utilities**: camelCase describing function
- **Types**: PascalCase or camelCase based on content
- **Styles**: kebab-case (`.css` files)

## Import/Export Patterns

### Component Exports
```typescript
// Default export for main component
export default ComponentName;

// Named exports for utilities
export { utilityFunction, HelperClass };
```

### Import Organization
```typescript
// 1. React and external libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal utilities and hooks
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// 3. UI components
import { Button } from '@/components/ui/button';

// 4. Feature components
import UserProfile from '@/components/UserProfile';
```

## Code Organization Principles

### Component Structure
1. **Small and Focused**: Components under 200 lines
2. **Single Responsibility**: One clear purpose per component
3. **Proper TypeScript**: Always use type definitions
4. **Custom Hooks**: Extract reusable logic

### File Organization
1. **Feature-Based**: Group related functionality
2. **Reusable Components**: Separate UI from business logic
3. **Clear Separation**: Pages, components, hooks, utilities
4. **Modular Styles**: Break large CSS files into focused modules

### Dependency Management
1. **Minimal Dependencies**: Only necessary packages
2. **Type Safety**: TypeScript throughout
3. **Performance**: Code splitting and lazy loading
4. **Security**: Environment variable management

This structure ensures maintainable, scalable, and well-organized code that follows React and TypeScript best practices.
