# Auto-Renewal Functional Requirements Document (FRD)

## Document Information
- **Document Version**: 1.0
- **Created**: January 2025
- **Project**: Yogi AI Platform Auto-Renewal Implementation
- **Scope**: Web and Android Platforms Only (iOS Unchanged)

## 1. Executive Summary

### 1.1 Purpose
This document outlines the functional requirements for implementing auto-renewal subscription functionality for the Yogi AI platform, specifically targeting web and Android users while maintaining the existing iOS IAP implementation.

### 1.2 Scope
- **In Scope**: Auto-renewal subscriptions for web and Android platforms using Razorpay
- **Out of Scope**: Changes to existing iOS IAP implementation
- **Platform Coverage**: Web browsers, Android devices via Capacitor

### 1.3 Business Objectives
- Increase user retention through automated subscription renewals
- Reduce subscription churn from manual renewal friction
- Maintain revenue continuity for active users
- Provide user control over subscription management

## 2. Functional Requirements

### 2.1 Core Auto-Renewal Features

#### FR-001: Auto-Renewal Option Selection
- **Description**: Users must be able to choose between one-time payment and auto-renewal subscription
- **Priority**: High
- **Acceptance Criteria**:
  - During subscription flow, users see clear options for payment types
  - Auto-renewal option displays subscription terms and next billing date
  - One-time payment option maintains current functionality
  - Default selection should be one-time payment for backward compatibility

#### FR-002: Razorpay Subscription Creation
- **Description**: System must create Razorpay subscription plans and handle recurring billing
- **Priority**: High
- **Acceptance Criteria**:
  - System creates Razorpay subscription for each program duration (30, 60, 90 days)
  - Subscription includes proper billing intervals and amounts
  - First payment processes immediately upon subscription creation
  - Subscription ID stored in user_subscriptions table

#### FR-003: Automatic Renewal Processing
- **Description**: System automatically processes subscription renewals without user intervention
- **Priority**: High
- **Acceptance Criteria**:
  - Renewals process 1 day before expiration
  - Successful renewals extend subscription end_date automatically
  - Failed renewals trigger grace period (7 days)
  - Multiple renewal attempts with exponential backoff

#### FR-004: Webhook Event Handling
- **Description**: System must handle real-time Razorpay webhook events for subscription updates
- **Priority**: High
- **Acceptance Criteria**:
  - Webhook signature verification for security
  - Handle subscription.charged events (successful renewal)
  - Handle subscription.halted events (failed renewal)
  - Handle subscription.cancelled events (user cancellation)
  - Handle subscription.completed events (subscription ended)

### 2.2 User Management Features

#### FR-005: Subscription Status Dashboard
- **Description**: Users can view and manage their subscription status
- **Priority**: Medium
- **Acceptance Criteria**:
  - Display current subscription status (active, cancelled, grace period)
  - Show next billing date for auto-renewal subscriptions
  - Display billing history with renewal events
  - Clear indication of payment method and subscription source

#### FR-006: Auto-Renewal Control
- **Description**: Users can enable/disable auto-renewal for their subscriptions
- **Priority**: Medium
- **Acceptance Criteria**:
  - Toggle control to enable/disable auto-renewal
  - Immediate effect on next billing cycle
  - Clear messaging about subscription changes
  - Confirmation dialog for subscription cancellation

#### FR-007: Grace Period Handling
- **Description**: System provides grace period for failed renewal payments
- **Priority**: Medium
- **Acceptance Criteria**:
  - 7-day grace period after failed renewal
  - User retains access during grace period
  - Clear notifications about payment failure and grace period
  - Ability to update payment method during grace period

### 2.3 Notification Features

#### FR-008: Renewal Notifications
- **Description**: System sends notifications for renewal events
- **Priority**: Medium
- **Acceptance Criteria**:
  - Email notification 7 days before renewal
  - Email notification 1 day before renewal
  - Immediate notification for successful renewal
  - Immediate notification for failed renewal
  - In-app notification badges for subscription events

#### FR-009: Payment Failure Notifications
- **Description**: System notifies users of payment failures and required actions
- **Priority**: High
- **Acceptance Criteria**:
  - Immediate email notification for payment failure
  - In-app notification with action buttons
  - Daily reminders during grace period
  - Clear instructions for payment method updates

### 2.4 Platform Integration Features

#### FR-010: Platform Detection
- **Description**: System must detect user platform and route to appropriate payment method
- **Priority**: High
- **Acceptance Criteria**:
  - iOS users continue using existing IAP (no changes)
  - Web users get auto-renewal options via Razorpay
  - Android users get auto-renewal options via Razorpay
  - Platform detection works in Capacitor environment

#### FR-011: Backward Compatibility
- **Description**: Existing one-time payment users continue normal functionality
- **Priority**: High
- **Acceptance Criteria**:
  - Existing subscriptions remain unaffected
  - One-time payment option still available
  - Migration path for existing users to auto-renewal (optional)
  - No breaking changes to current payment flow

## 3. Technical Requirements

### 3.1 Database Schema Changes

#### TR-001: user_subscriptions Table Enhancement
```sql
ALTER TABLE user_subscriptions ADD COLUMN:
- source text CHECK (source IN ('apple_iap', 'razorpay', 'manual')) DEFAULT 'manual'
- auto_renewal_enabled boolean DEFAULT false
- next_billing_date date
- razorpay_subscription_id text
- renewal_attempts integer DEFAULT 0
- last_renewal_date date
- grace_period_start date
- grace_period_end date
```

#### TR-002: Subscription Events Logging
```sql
CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES user_subscriptions(id),
  event_type text NOT NULL,
  event_data jsonb,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
```

### 3.2 API Requirements

#### TR-003: Razorpay Subscription Plans API
- Create subscription plans for each program duration
- Plan IDs stored in configuration
- Dynamic pricing based on location (INR/USD)

#### TR-004: Webhook Endpoint
- New edge function: `razorpay-webhook`
- Signature verification using Razorpay webhook secret
- Event processing with proper error handling
- Idempotent event processing

#### TR-005: Renewal Processing Service
- New edge function: `process-renewals`
- Scheduled execution (daily)
- Batch processing of upcoming renewals
- Notification triggering

### 3.3 Integration Requirements

#### TR-006: Razorpay Subscription Integration
- Subscription creation API calls
- Subscription management (cancel, pause, resume)
- Payment link generation for failed renewals
- Subscription status polling

#### TR-007: Email Service Integration
- Renewal reminder emails
- Payment failure notifications
- Subscription cancellation confirmations
- Grace period warnings

## 4. User Stories

### 4.1 New User Auto-Renewal Flow
```
As a new user selecting a subscription plan,
I want to choose between one-time payment and auto-renewal,
So that I can have control over my billing preferences.

Acceptance Criteria:
- I see clear options for payment types during checkout
- Auto-renewal option shows next billing date and terms
- I can change my selection before payment
- Payment processes according to my selection
```

### 4.2 Auto-Renewal Management
```
As an existing user with auto-renewal enabled,
I want to manage my subscription settings,
So that I can control my billing and subscription status.

Acceptance Criteria:
- I can view my next billing date in my profile
- I can disable auto-renewal with confirmation
- I can see my billing history
- I receive notifications before renewals
```

### 4.3 Failed Payment Recovery
```
As a user whose auto-renewal payment failed,
I want to update my payment method during the grace period,
So that I can maintain my subscription without interruption.

Acceptance Criteria:
- I receive immediate notification of payment failure
- I have 7 days grace period with continued access
- I can update payment method easily
- System retries payment after method update
```

### 4.4 Platform-Specific Experience
```
As a user on different platforms,
I want consistent subscription experience,
So that my payment method works reliably on my device.

Acceptance Criteria:
- iOS users continue using App Store (no change)
- Web users get Razorpay auto-renewal options
- Android users get Razorpay auto-renewal options
- Platform detection is transparent to user
```

## 5. API Specifications

### 5.1 Subscription Creation Endpoint
```typescript
POST /functions/v1/process-payment
{
  "action": "create_subscription",
  "program_id": "uuid",
  "auto_renewal_enabled": boolean,
  "payment_gateway": "razorpay"
}

Response:
{
  "success": true,
  "subscription_id": "razorpay_sub_xxx",
  "first_payment_url": "https://...",
  "next_billing_date": "2025-02-15"
}
```

### 5.2 Subscription Management Endpoints
```typescript
// Cancel auto-renewal
PUT /functions/v1/manage-subscription
{
  "action": "cancel_auto_renewal",
  "subscription_id": "uuid"
}

// Update payment method
PUT /functions/v1/manage-subscription
{
  "action": "update_payment_method",
  "subscription_id": "uuid",
  "payment_token": "string"
}
```

### 5.3 Webhook Event Structure
```typescript
POST /functions/v1/razorpay-webhook
{
  "event": "subscription.charged",
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_xxx",
        "status": "active",
        "current_start": 1640995200,
        "current_end": 1643673600
      }
    }
  }
}
```

## 6. User Interface Requirements

### 6.1 Subscription Selection UI
- **Component**: Enhanced subscription cards
- **Location**: Subscription page
- **Features**:
  - Radio buttons for payment type selection
  - Clear pricing for one-time vs recurring
  - Terms and conditions display
  - Next billing date preview

### 6.2 Subscription Management Dashboard
- **Component**: New subscription management section
- **Location**: User profile/settings
- **Features**:
  - Current subscription status
  - Next billing date countdown
  - Auto-renewal toggle
  - Billing history table
  - Cancel subscription button

### 6.3 Notification Components
- **Component**: Subscription notification banners
- **Location**: App header/dashboard
- **Features**:
  - Renewal reminders
  - Payment failure alerts
  - Grace period warnings
  - Success confirmations

## 7. Security Requirements

### 7.1 Webhook Security
- **Requirement**: Verify all webhook signatures
- **Implementation**: Use Razorpay webhook secret for HMAC verification
- **Fallback**: Reject unverified webhooks

### 7.2 Payment Data Security
- **Requirement**: Never store sensitive payment data
- **Implementation**: Use Razorpay tokens and subscription IDs only
- **Compliance**: Maintain PCI DSS compliance

### 7.3 User Authorization
- **Requirement**: Users can only manage their own subscriptions
- **Implementation**: RLS policies on subscription tables
- **Validation**: Server-side user ID validation

## 8. Performance Requirements

### 8.1 Webhook Processing
- **Requirement**: Process webhooks within 30 seconds
- **Target**: 99.9% success rate for webhook processing
- **Monitoring**: Track webhook processing times and failures

### 8.2 Renewal Processing
- **Requirement**: Daily renewal processing completes within 1 hour
- **Target**: Process 10,000+ subscriptions efficiently
- **Optimization**: Batch processing with pagination

### 8.3 User Interface Performance
- **Requirement**: Subscription dashboard loads within 2 seconds
- **Target**: 95% of page loads under 2 seconds
- **Optimization**: Cached subscription data with real-time updates

## 9. Testing Requirements

### 9.1 Unit Testing
- Webhook event processing functions
- Subscription creation/management functions
- Database operations and RLS policies
- Payment gateway integration

### 9.2 Integration Testing
- End-to-end subscription creation flow
- Webhook event handling
- Email notification delivery
- Platform detection logic

### 9.3 User Acceptance Testing
- Complete user subscription journey
- Auto-renewal flow testing
- Payment failure and recovery
- Cross-platform functionality

### 9.4 Security Testing
- Webhook signature verification
- SQL injection prevention
- Authorization boundary testing
- Payment data handling

## 10. Implementation Phases

### Phase 1: Foundation (Week 1)
- Database schema updates
- Basic subscription creation
- Razorpay plan setup
- Platform detection logic

### Phase 2: Core Functionality (Week 2)
- Webhook implementation
- Auto-renewal processing
- Grace period handling
- Basic UI updates

### Phase 3: User Experience (Week 3)
- Subscription management dashboard
- Notification system
- Email templates
- Enhanced UI components

### Phase 4: Testing & Optimization (Week 4)
- Comprehensive testing
- Performance optimization
- Security hardening
- Documentation completion

## 11. Success Criteria

### 11.1 Technical Success Metrics
- 99.9% webhook processing success rate
- < 2 second subscription dashboard load time
- Zero security vulnerabilities
- 100% backward compatibility

### 11.2 Business Success Metrics
- 15% increase in subscription retention
- 25% reduction in manual renewal churn
- 90% user satisfaction with auto-renewal experience
- 95% successful auto-renewal rate

### 11.3 User Experience Metrics
- < 3 clicks to enable auto-renewal
- Clear understanding of billing terms (user survey)
- Effective notification delivery (95% read rate)
- Smooth payment failure recovery (80% success rate)

## 12. Risks and Mitigation

### 12.1 Technical Risks
- **Risk**: Webhook delivery failures
- **Mitigation**: Implement webhook retry mechanism and fallback polling

- **Risk**: Payment gateway downtime
- **Mitigation**: Graceful degradation to manual payment options

- **Risk**: Database performance with increased subscription events
- **Mitigation**: Proper indexing and archival strategy

### 12.2 Business Risks
- **Risk**: User confusion about auto-renewal
- **Mitigation**: Clear UI messaging and confirmation flows

- **Risk**: Increased support requests
- **Mitigation**: Comprehensive self-service options and documentation

### 12.3 Security Risks
- **Risk**: Webhook spoofing attacks
- **Mitigation**: Strict signature verification and rate limiting

- **Risk**: Unauthorized subscription modifications
- **Mitigation**: Strong authentication and authorization checks

## 13. Dependencies

### 13.1 External Dependencies
- Razorpay Subscription API availability
- Email service (Resend) functionality
- Supabase Edge Functions platform

### 13.2 Internal Dependencies
- Existing payment infrastructure
- User authentication system
- Notification system

### 13.3 Team Dependencies
- Frontend development for UI updates
- Backend development for API implementation
- QA testing for comprehensive validation

## 14. Conclusion

This FRD provides a comprehensive blueprint for implementing auto-renewal functionality for web and Android platforms while maintaining the existing iOS IAP system. The phased approach ensures minimal disruption to current users while providing enhanced subscription management capabilities.

The implementation focuses on user control, security, and reliability while maintaining backward compatibility with existing payment flows. Success will be measured through technical performance metrics, business retention improvements, and user experience satisfaction.