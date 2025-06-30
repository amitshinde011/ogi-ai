
# Yogi AI - Complete Project Overview

## 🎯 Project Mission
Yogi AI is a comprehensive wellness and mindfulness platform that provides personalized wellness programs, meditation content, recipe management, and community features to help users achieve their health and wellness goals.

## 🏗️ Architecture Overview

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router v6 for client-side navigation

### Backend Architecture
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with Google OAuth
- **API**: Supabase Edge Functions (Deno runtime)
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Cloudflare R2 for media files

### Key Integrations
- **Payment Processing**: Braintree (International) + Razorpay (India)
- **Video Streaming**: Custom HLS implementation with quality controls
- **Analytics**: Google Analytics integration
- **Email**: Supabase Auth email templates

## 📊 Database Schema Overview

### Core Tables
1. **Authentication & Users**
   - `auth.users` (Supabase managed)
   - `user_profiles` - Extended user information
   - `user_onboarding` - Onboarding progress tracking

2. **Subscription System**
   - `programs` - Available wellness programs
   - `user_subscriptions` - User program subscriptions
   - `orders` - Payment transactions
   - `coupon_codes` - Discount codes

3. **Content Management**
   - `recipes` - Recipe content with nutrition data
   - `user_saved_recipes` - User's saved recipes

4. **Community Features**
   - `community_posts` - User-generated content
   - `community_post_likes` - Like system
   - `community_post_comments` - Comment system
   - `followers` - User following relationships

5. **Progress Tracking**
   - `journey_assessments` - Before journey assessments
   - `final_assessments` - After journey assessments
   - `assessment_comparisons` - Progress comparisons
   - `daily_wellness` - Daily activity tracking
   - `meal_tracking` - Meal logging
   - `steps_tracking` - Step counter data

6. **Communication**
   - `conversations` - Chat conversations
   - `conversation_participants` - Chat participants
   - `messages` - Chat messages
   - `notifications` - System notifications

## 🔐 Security Implementation

### Authentication Flow
1. Google OAuth via Supabase Auth
2. JWT token management with automatic refresh
3. Protected routes with auth guards
4. Session persistence across browser sessions

### Authorization
- Row Level Security (RLS) on all user data tables
- User isolation via `auth.uid()` policies
- Service role key for admin operations
- API key rotation and environment variable security

### Data Protection
- Input validation and sanitization
- XSS prevention in user-generated content
- SQL injection prevention via Supabase client
- Secure payment processing with tokenization

## 💳 Payment System Architecture

### Gateway Selection Logic
```typescript
// Location-based gateway selection
if (userLocation === 'India') {
  gateway = 'razorpay';
  currency = 'INR';
} else {
  gateway = 'braintree';
  currency = 'USD';
}
```

### Payment Flow
1. Program selection and coupon application
2. Tax calculation and final price computation
3. Gateway-specific payment session creation
4. Secure payment processing
5. Subscription activation upon success
6. Webhook verification and order completion

### Free Subscription Handling
- 100% discount coupons bypass payment flow
- Direct subscription creation for free access
- Proper validation and user notification

## 🎥 Video System Architecture

### Video Quality Management
- Multiple quality options (1080p, 720p, 480p)
- Adaptive quality selection based on network
- HLS streaming support for optimal delivery
- Progress tracking and resume functionality

### Content Delivery
- CDN-optimized video delivery
- Lazy loading for better performance
- Quality switching without interruption
- Mobile-optimized playback controls

## 🏘️ Community Features

### Real-time Interactions
- Live like count updates
- Real-time comment threading
- Instant notification delivery
- User presence indicators

### Content Management
- Rich text post creation
- Image upload with optimization
- Comment threading and replies
- User profile integration

## 📱 Mobile Experience

### Responsive Design
- Mobile-first Tailwind CSS approach
- Touch-friendly interaction targets
- Optimized navigation for mobile
- Progressive Web App capabilities

### Performance Optimization
- Code splitting for faster loads
- Image lazy loading and optimization
- Service worker for offline functionality
- Minimal bundle size with tree shaking

## 🔄 Real-time Features

### Supabase Realtime Integration
```typescript
// Real-time subscription pattern
const channel = supabase
  .channel('unique-channel-name')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name'
  }, handleChange)
  .subscribe();
```

### Live Updates
- Community post interactions
- Comment count synchronization
- Like count real-time updates
- Notification delivery

## 📈 Analytics & Monitoring

### User Analytics
- Google Analytics 4 integration
- Custom event tracking
- User journey analysis
- Conversion funnel monitoring

### Performance Monitoring
- Core Web Vitals tracking
- Error boundary implementation
- Console error logging
- Performance metrics collection

## 🚀 Deployment Architecture

### Hosting
- Lovable platform for automatic deployment
- Custom domain support with SSL
- CDN integration for static assets
- Environment-based configuration

### CI/CD Pipeline
- Automatic builds on code changes
- Environment variable management
- Database migration handling
- Rollback capabilities

## 🧪 Testing Strategy

### Testing Pyramid
- Unit tests for utility functions
- Integration tests for API calls
- End-to-end tests for user flows
- Visual regression testing

### Quality Assurance
- TypeScript for compile-time checks
- ESLint for code quality
- Prettier for consistent formatting
- Pre-commit hooks for validation

## 📚 Development Guidelines

### Code Organization
- Feature-based folder structure
- Separation of concerns
- Custom hooks for reusable logic
- Component composition patterns

### Best Practices
- TypeScript strict mode
- Error boundary implementation
- Accessibility compliance
- Performance optimization

## 🔧 Configuration Management

### Environment Variables
- Supabase configuration
- Payment gateway credentials
- Third-party API keys
- Feature flags

### Secrets Management
- Supabase secrets for sensitive data
- Environment-specific configurations
- API key rotation procedures
- Security audit trails

This overview provides a comprehensive understanding of the Yogi AI platform's architecture, features, and implementation details.
