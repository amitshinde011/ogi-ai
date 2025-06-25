
# Yogi AI - Wellness & Mindfulness Platform

A comprehensive wellness platform built with React, TypeScript, and Supabase that provides personalized wellness programs, meditation content, recipe management, and community features.

## 🌟 Features

### Core Functionality
- **User Authentication** - Google OAuth integration via Supabase Auth
- **Wellness Programs** - Subscription-based wellness programs with video content
- **Payment Processing** - Braintree and Razorpay integration for global payments
- **Recipe Management** - Curated recipes with save/unsave functionality
- **Community Platform** - User posts, comments, likes, and interactions
- **Progress Tracking** - Wellness journey tracking with assessments
- **Video Content** - Meditation and instruction videos with quality controls

### User Journey
1. **Profile Setup** - Personal information, health details, activity levels
2. **Program Selection** - Choose from available wellness programs
3. **Payment Processing** - Secure payments with location-based gateway selection
4. **Content Access** - Videos, recipes, and community features
5. **Progress Tracking** - Before/after assessments and journey completion

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Query** for data fetching and caching

### Backend & Services
- **Supabase** for database, auth, and edge functions
- **PostgreSQL** database with Row Level Security (RLS)
- **Braintree** for international payments
- **Razorpay** for Indian payments

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching and state management
- `lucide-react` - Icons
- `recharts` - Charts and analytics
- `react-hook-form` - Form handling
- `zod` - Schema validation

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── payment/         # Payment-related components
│   ├── recipes/         # Recipe management components
│   └── subscription/    # Subscription components
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── utils/               # Utility functions
├── integrations/        # External service integrations
└── types/               # TypeScript type definitions

supabase/
├── functions/           # Edge functions
└── migrations/          # Database migrations
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Payment gateway accounts (Braintree/Razorpay)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yogi-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Configuration

The project uses Supabase for configuration. Set up the following secrets in your Supabase project:

**Payment Gateway Secrets:**
- `BRAINTREE_MERCHANT_ID`
- `BRAINTREE_PUBLIC_KEY`
- `BRAINTREE_PRIVATE_KEY`
- `BRAINTREE_ENVIRONMENT`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

**Supabase Secrets:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🗄️ Database Schema

### Core Tables
- **users** - User profiles and authentication (Supabase Auth)
- **programs** - Wellness programs with pricing
- **user_subscriptions** - User program subscriptions
- **user_onboarding** - Onboarding progress tracking
- **orders** - Payment transactions
- **recipes** - Recipe content and metadata
- **community_posts** - User-generated content
- **final_assessments** - Program completion assessments

### Key Features
- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** via auth.uid()
- **Automatic timestamps** with triggers
- **Data validation** via database constraints

## 💳 Payment System

### Gateway Selection
- **India users** → Razorpay (INR)
- **International users** → Braintree (USD)
- **Location detection** via IP geolocation

### Payment Flow
1. User selects program and applies coupons
2. System calculates final price with taxes/discounts
3. Gateway-specific payment session created
4. Payment processed via selected gateway
5. Subscription activated upon successful payment

### Free Subscriptions
- **100% discount coupons** bypass payment flow
- Direct subscription creation for free access
- Proper handling in payment components

## 🎥 Video System

### Features
- **Multiple quality options** (1080p, 720p, 480p)
- **Adaptive quality detection** based on network
- **HLS streaming support** for optimal delivery
- **Progress tracking** and resume functionality

### Video Sources
- Configured via `src/constants/videoSources.ts`
- Quality-specific URLs for each video
- Fallback handling for unsupported formats

## 🔒 Security & Authentication

### Authentication
- **Google OAuth** integration
- **Session management** via Supabase Auth
- **Protected routes** with auth guards

### Data Security
- **Row Level Security** on all user data
- **User isolation** via auth.uid()
- **Secure payment processing** with tokenization
- **Input validation** and sanitization

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind CSS
- **Responsive breakpoints** for all screen sizes
- **Touch-friendly** interactions
- **Progressive enhancement** for modern browsers

## 🚀 Deployment

### Lovable Platform
The project is deployed on Lovable with automatic builds and deployments.

### Custom Domain Setup
1. Configure custom domain in Lovable project settings
2. Update DNS records as instructed
3. SSL certificates handled automatically

## 🔧 API Reference

### Supabase Edge Functions

#### `/process-payment`
Handles payment session creation and verification.

**Create Payment Session:**
```typescript
POST /process-payment
{
  "action": "create_payment_session",
  "programId": "uuid",
  "gateway": "braintree" | "razorpay",
  "amount": number,
  "currency": "USD" | "INR"
}
```

**Verify Payment:**
```typescript
POST /process-payment
{
  "action": "verify_payment",
  "orderId": "uuid",
  "transactionId": "string",
  "gateway": "braintree" | "razorpay"
}
```

## 🧪 Testing

### Payment Testing
- **Braintree Sandbox** for international payments
- **Razorpay Test Mode** for Indian payments
- Test cards and credentials available in respective documentation

### User Journey Testing
1. Complete profile setup
2. Select and purchase program
3. Watch intro video
4. Complete assessments
5. Access content and community features

## 📊 Analytics

### Tracking Events
- **User registration** and onboarding completion
- **Payment flows** and conversion rates
- **Content engagement** (videos, recipes, posts)
- **Feature usage** analytics

### Implementation
- Google Analytics integration via `useAnalytics` hook
- Custom event tracking throughout the application
- Performance monitoring and error tracking

## 🤝 Contributing

### Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Component-based** architecture

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Submit pull request
4. Code review and merge

## 📞 Support

For technical support or questions:
- Check the troubleshooting documentation
- Review console logs for errors
- Contact development team

## 📄 License

This project is proprietary software. All rights reserved.
