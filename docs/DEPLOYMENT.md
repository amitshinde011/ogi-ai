
# Deployment Guide

## Lovable Platform Deployment

### Automatic Deployment
Your Yogi AI application is automatically deployed on the Lovable platform with every code change.

**Deployment URL:** https://lovable.dev/projects/d058b66d-4dd6-438c-a799-b62e81c5c371

### Publishing Your App

1. **Navigate to Your Project**
   - Open your Lovable project
   - Click the "Share" button in the top navigation

2. **Publish to Production**
   - Click "Publish" to deploy your app
   - Your app will be available at a Lovable subdomain

3. **Custom Domain Setup**
   - Go to Project → Settings → Domains
   - Click "Connect Domain"
   - Enter your custom domain (e.g., yogiai.in)
   - Follow DNS configuration instructions

## Supabase Configuration

### Project Setup
**Project ID:** `mxigbftmmkqnhmocyeeo`
**URL:** `https://mxigbftmmkqnhmocyeeo.supabase.co`

### Environment Variables
Configure the following secrets in your Supabase project:

#### Required Secrets
```bash
# Supabase Configuration
SUPABASE_URL=https://mxigbftmmkqnhmocyeeo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Payment Gateways
BRAINTREE_MERCHANT_ID=<your-merchant-id>
BRAINTREE_PUBLIC_KEY=<your-public-key>
BRAINTREE_PRIVATE_KEY=<your-private-key>
BRAINTREE_ENVIRONMENT=sandbox # or production

RAZORPAY_KEY_ID=<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>

# Video Streaming (Optional)
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_API_TOKEN=<your-api-token>
CLOUDFLARE_SIGNING_KEY_ID=<your-signing-key-id>
CLOUDFLARE_SIGNING_KEY=<your-signing-key>
```

### Setting Secrets in Supabase

1. **Navigate to Edge Functions Settings**
   ```
   https://supabase.com/dashboard/project/mxigbftmmkqnhmocyeeo/settings/functions
   ```

2. **Add Each Secret**
   - Click "Add Secret"
   - Enter secret name and value
   - Save changes

### Database Migrations

All database migrations are automatically applied. Current migrations include:
- User authentication and profiles
- Program and subscription management
- Payment processing
- Community features
- Recipe management

## Google OAuth Configuration

### Console Setup
1. **Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project

2. **OAuth Consent Screen**
   - Navigate to "APIs & Services" → "OAuth consent screen"
   - Set application name to "yogai.in" or "Yogi AI"
   - Add authorized domains

3. **OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs

### Supabase Auth Configuration
1. **Enable Google Provider**
   ```
   https://supabase.com/dashboard/project/mxigbftmmkqnhmocyeeo/auth/providers
   ```

2. **Configure OAuth Settings**
   - Add Google Client ID
   - Add Google Client Secret
   - Set redirect URL

## Payment Gateway Setup

### Braintree Configuration
1. **Sandbox Account**
   - Create account at [sandbox.braintreegateway.com](https://sandbox.braintreegateway.com)
   - Get merchant credentials

2. **Production Setup**
   - Apply for production account
   - Update environment variable to "production"

### Razorpay Configuration
1. **Test Mode**
   - Create account at [razorpay.com](https://razorpay.com)
   - Get test API keys

2. **Live Mode**
   - Complete KYC verification
   - Generate live API keys

## SSL and Security

### HTTPS
- Automatic SSL certificates via Lovable platform
- Custom domains include SSL setup

### Security Headers
Configured automatically by Lovable:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

## Performance Optimization

### CDN
- Static assets served via CDN
- Automatic image optimization
- Gzip compression enabled

### Caching
- Browser caching for static assets
- Database query caching via React Query
- Edge function response caching

## Monitoring and Logging

### Supabase Monitoring
1. **Database Metrics**
   ```
   https://supabase.com/dashboard/project/mxigbftmmkqnhmocyeeo/settings/database
   ```

2. **Edge Function Logs**
   ```
   https://supabase.com/dashboard/project/mxigbftmmkqnhmocyeeo/functions/process-payment/logs
   ```

### Error Tracking
- Console errors logged automatically
- Supabase error reporting
- Custom error boundaries in React

## Backup and Recovery

### Database Backups
- Automatic daily backups via Supabase
- Point-in-time recovery available
- Manual backup export options

### Code Repository
- Code stored in Git repository
- Automatic version history
- Rollback capabilities via Lovable

## Production Checklist

### Pre-deployment
- [ ] All secrets configured in Supabase
- [ ] Google OAuth consent screen approved
- [ ] Payment gateways in production mode
- [ ] Custom domain DNS configured
- [ ] SSL certificates verified

### Post-deployment
- [ ] Test user registration flow
- [ ] Verify payment processing
- [ ] Check video content delivery
- [ ] Monitor error logs
- [ ] Validate analytics tracking

### Ongoing Maintenance
- [ ] Monitor database performance
- [ ] Review error logs weekly
- [ ] Update dependencies regularly
- [ ] Backup configuration settings
- [ ] Track user feedback and metrics

## Troubleshooting

### Common Issues
1. **OAuth Errors**
   - Verify redirect URIs match exactly
   - Check domain authorization
   - Confirm client credentials

2. **Payment Failures**
   - Validate gateway credentials
   - Check webhook configurations
   - Review transaction logs

3. **Database Errors**
   - Monitor RLS policies
   - Check connection limits
   - Review query performance

### Support Resources
- Lovable documentation: [docs.lovable.dev](https://docs.lovable.dev)
- Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Discord community support
