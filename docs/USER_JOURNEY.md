
# User Journey Documentation

## Overview
This document outlines the complete user experience flow through the Yogi AI wellness platform, from initial signup to program completion.

## 1. Authentication & Signup

### Entry Points
- **Route:** `/login`
- **Purpose:** User authentication and account creation

### Flow
1. **Landing Page**
   - Welcome message and platform introduction
   - Google OAuth login button
   - Testimonials carousel
   - Wellness benefits showcase

2. **Google OAuth Process**
   - Redirect to Google authentication
   - Permission consent for basic profile info
   - Return to application with authenticated session

3. **Post-Authentication**
   - Automatic user record creation in Supabase
   - Onboarding state initialization
   - Redirect to profile setup

### Key Components
- `GoogleLoginButton` - OAuth integration
- `LoginHeader` - Branding and messaging
- `TestimonialsCarousel` - Social proof
- `WellnessCarousel` - Feature highlights

## 2. Profile Setup

### Entry Points
- **Route:** `/profile-setup`
- **Purpose:** Collect user information for personalization

### Data Collection
1. **Basic Information**
   - Full name
   - Date of birth
   - Gender
   - Height and weight

2. **Physical Activity**
   - Current activity level (1-5 scale)
   - Exercise preferences
   - Fitness goals

3. **Health Information**
   - Current health issues
   - Dietary restrictions
   - Wellness objectives

4. **Profile Image**
   - Optional photo upload
   - Image preview and crop functionality

### Validation
- Required field validation
- Age calculations
- BMI calculations
- Health condition formatting

### Key Components
- `ProfileImageUpload` - Photo management
- `BasicInfoFields` - Personal data
- `PhysicalActivitySection` - Activity assessment
- `HealthIssuesField` - Health information

## 3. Program Selection

### Entry Points
- **Route:** `/subscriptions`
- **Purpose:** Choose wellness program subscription

### Program Display
1. **Available Programs**
   - Program cards with features
   - Duration and pricing information
   - Benefits and descriptions

2. **Pricing Calculation**
   - Location-based currency (USD/INR)
   - Discount applications
   - Tax calculations
   - Coupon code support

3. **Special Offers**
   - Seasonal discounts
   - First-time user promotions
   - 100% discount coupons for free access

### Selection Process
1. **Program Comparison**
   - Feature comparison grid
   - Duration and price analysis
   - Benefit breakdowns

2. **Coupon Application**
   - Coupon code input
   - Discount validation
   - Price recalculation

3. **Subscription Confirmation**
   - Final price display
   - Terms and conditions
   - Payment gateway selection

### Key Components
- `SubscriptionCard` - Program display
- `PricingBreakdown` - Cost calculation
- `CouponCodeInput` - Discount codes
- `SubscriptionGrid` - Program layout

## 4. Payment Processing

### Entry Points
- **Route:** `/payment`
- **Purpose:** Secure payment processing

### Gateway Selection
- **India Users:** Razorpay (INR)
- **International Users:** Braintree (USD)
- **Location Detection:** IP-based geolocation

### Payment Flow
1. **Payment Summary**
   - Program details confirmation
   - Final pricing breakdown
   - Tax and discount summary

2. **Gateway Processing**
   - Secure payment session creation
   - Gateway-specific UI integration
   - Transaction processing

3. **Verification & Confirmation**
   - Payment verification
   - Order record creation
   - Subscription activation

### Free Access Handling
- 100% discount detection
- Bypass payment flow
- Direct subscription creation
- Free access notification

### Key Components
- `PaymentButton` - Transaction initiation
- `ProgramDetailsCard` - Order summary
- `LocationGatewayInfo` - Gateway selection
- Payment gateway utilities

## 5. Content Introduction

### Entry Points
- **Route:** `/intro-video`
- **Purpose:** Platform orientation and program introduction

### Video Experience
1. **Welcome Content**
   - Platform introduction video
   - Program overview
   - Wellness journey explanation

2. **Video Controls**
   - Play/pause functionality
   - Quality selection (1080p, 720p, 480p)
   - Progress tracking
   - Fullscreen support

3. **Completion Tracking**
   - Video watch progress
   - Automatic advancement
   - Onboarding state update

### Key Components
- `VideoPlayer` - Main video component
- `VideoPlayerControls` - Playback controls
- `VideoInstructions` - Guidance text

## 6. Before Assessment

### Entry Points
- **Route:** `/before-assessment`
- **Purpose:** Baseline wellness assessment

### Assessment Categories
1. **Health Conditions**
   - Current symptoms
   - Severity ratings
   - Frequency assessments

2. **Comfort Levels**
   - Physical comfort (1-10 scale)
   - Mental wellness indicators
   - Sleep quality metrics

3. **Lifestyle Factors**
   - Daily routine analysis
   - Stress level evaluation
   - Activity patterns

### Data Capture
- Multi-question format
- Slider-based ratings
- Checkbox selections
- Progress indicators

### Key Components
- `ComfortQuestionsSection` - Rating scales
- `HealthConditionsSection` - Condition tracking
- `ComfortSlider` - Interactive ratings

## 7. Journey Start

### Entry Points
- **Route:** `/journey-start`
- **Purpose:** Program initiation and goal setting

### Content
1. **Program Introduction**
   - Personalized welcome message
   - Program structure overview
   - Expectations setting

2. **Goal Setting**
   - Personal objectives
   - Timeline establishment
   - Success metrics

3. **Motivation Content**
   - Inspirational messaging
   - Success stories
   - Community introduction

## 8. Daily Wellness Hub

### Entry Points
- **Route:** `/home`
- **Purpose:** Daily activities and progress tracking

### Dashboard Features
1. **Daily Progress**
   - Current day tracking
   - Activity completion
   - Streak maintenance

2. **Quick Actions**
   - Meal photo upload
   - Progress check-in
   - Recipe access
   - Community participation

3. **Content Sections**
   - Today's recommendations
   - Video content
   - Recipe suggestions
   - Community highlights

### Progress Tracking
- Daily activity logging
- Wellness metrics
- Achievement badges
- Streak counters

### Key Components
- `DailyProgressCard` - Progress display
- `QuickActions` - Activity shortcuts
- `TodayMeals` - Meal tracking
- `WeeklyStreak` - Progress streaks

## 9. Recipe Management

### Entry Points
- **Route:** `/recipes`
- **Purpose:** Curated recipe access and management

### Features
1. **Recipe Discovery**
   - Program-specific recipes
   - Category filtering
   - Search functionality
   - Quality ratings

2. **Recipe Details**
   - Ingredients list
   - Step-by-step instructions
   - Nutritional information
   - Cooking tips

3. **Personal Collection**
   - Save favorite recipes
   - Personal recipe library
   - Quick access shortcuts

### Key Components
- `RecipeCard` - Recipe display
- `CategoryFilter` - Content filtering
- `SavedRecipesCard` - Collection management
- Recipe search and suggestions

## 10. Community Platform

### Entry Points
- **Route:** `/community`
- **Purpose:** User interaction and sharing

### Community Features
1. **Content Creation**
   - Post creation with images
   - Category selection
   - Rich text content

2. **Social Interaction**
   - Like and comment system
   - User profiles
   - Content sharing

3. **Community Guidelines**
   - Wellness-focused content
   - Supportive environment
   - Moderation features

### Key Components
- `PostCard` - Content display
- `CreatePostDialog` - Content creation
- `CommentsSection` - User interaction

## 11. Progress Tracking

### Entry Points
- **Route:** `/progress`
- **Purpose:** Journey progress visualization

### Tracking Features
1. **Program Progress**
   - Completion percentage
   - Milestone achievements
   - Timeline visualization

2. **Wellness Metrics**
   - Health improvements
   - Activity trends
   - Goal achievement

3. **Historical Data**
   - Progress charts
   - Comparison metrics
   - Achievement history

### Key Components
- `CurrentProgramCard` - Active program status
- `ProgramHistorySection` - Historical data
- Progress charts and analytics

## 12. Program Completion

### Entry Points
- **Route:** `/program-complete`
- **Purpose:** Program completion and assessment

### Completion Process
1. **Final Assessment**
   - Post-program evaluation
   - Progress comparison
   - Improvement metrics

2. **Achievement Recognition**
   - Completion certificates
   - Achievement badges
   - Success celebration

3. **Next Steps**
   - Program renewal options
   - Advanced programs
   - Community continuation

## User State Management

### Onboarding Tracking
```typescript
interface OnboardingState {
  profile_completed: boolean;
  subscription_selected: boolean;
  intro_video_watched: boolean;
  before_assessment_completed: boolean;
  journey_started: boolean;
}
```

### Progression Logic
- Sequential flow enforcement
- State persistence
- Automatic redirection
- Progress validation

### Route Protection
- Authentication requirements
- Onboarding completion checks
- Subscription validation
- Content access control

## Error Handling & Recovery

### Common Scenarios
1. **Authentication Issues**
   - Session expiration
   - OAuth failures
   - Account conflicts

2. **Payment Problems**
   - Gateway failures
   - Incomplete transactions
   - Refund processing

3. **Content Access**
   - Subscription expiry
   - Content loading errors
   - Network issues

### Recovery Mechanisms
- Automatic retry logic
- Graceful error messages
- Alternative pathways
- Support contact options

## Analytics & Tracking

### User Journey Metrics
- Conversion funnel tracking
- Drop-off point identification
- Feature usage analytics
- User engagement metrics

### Key Performance Indicators
- Registration completion rate
- Payment success rate
- Content engagement time
- Community participation
- Program completion rate

This comprehensive user journey ensures a smooth, engaging experience from initial signup through program completion and beyond.
