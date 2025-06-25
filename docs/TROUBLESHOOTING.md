
# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Problems

#### Google OAuth Not Working
**Symptoms:**
- OAuth redirect fails
- "Invalid client" error
- Authentication loop

**Solutions:**
1. **Check Google Cloud Console Configuration**
   ```bash
   # Verify in Google Cloud Console:
   # - OAuth consent screen app name
   # - Authorized redirect URIs
   # - Client ID and secret
   ```

2. **Supabase Auth Settings**
   ```bash
   # Check Supabase Auth configuration:
   # - Google provider enabled
   # - Correct client credentials
   # - Redirect URL matches
   ```

3. **Clear Browser Data**
   ```bash
   # Clear cookies and local storage
   # Try incognito/private browsing
   # Check for ad blockers
   ```

#### Session Expiration
**Symptoms:**
- Sudden logouts
- "User not authenticated" errors
- Redirect to login page

**Solutions:**
```typescript
// Check session validity
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Handle re-authentication
  await supabase.auth.signInWithOAuth({ provider: 'google' });
}
```

### Payment Processing Issues

#### Braintree Sandbox Failures
**Symptoms:**
- Payment session creation fails
- "Payment method nonce is invalid" error
- Sandbox transactions not processing

**Solutions:**
1. **Verify Braintree Configuration**
   ```typescript
   // Check environment variables in Supabase
   BRAINTREE_ENVIRONMENT=sandbox
   BRAINTREE_MERCHANT_ID=your_sandbox_merchant_id
   BRAINTREE_PUBLIC_KEY=your_sandbox_public_key
   BRAINTREE_PRIVATE_KEY=your_sandbox_private_key
   ```

2. **Test with Braintree Test Cards**
   ```typescript
   // Use test card numbers:
   // Visa: 4111111111111111
   // MasterCard: 5555555555554444
   // CVV: 123, Expiry: any future date
   ```

3. **Check Network Configuration**
   ```bash
   # Ensure sandbox.braintreegateway.com is accessible
   # Check for firewall or proxy issues
   ```

#### Razorpay Integration Issues
**Symptoms:**
- Razorpay checkout not opening
- Payment verification failures
- Indian users unable to pay

**Solutions:**
1. **Verify Razorpay Keys**
   ```typescript
   // Test mode keys format:
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
   ```

2. **Check Script Loading**
   ```typescript
   // Ensure Razorpay script loads
   if (!window.Razorpay) {
     console.error('Razorpay script not loaded');
   }
   ```

#### Free Subscription Handling
**Symptoms:**
- 100% discount not creating subscription
- Payment flow triggered for free access
- Error with zero-amount transactions

**Solutions:**
```typescript
// Check coupon discount logic
if (couponDiscountPercentage === 100) {
  // Should bypass payment flow
  await createFreeSubscription(program);
  return;
}
```

### Video Player Problems

#### Videos Not Loading
**Symptoms:**
- Black screen or loading spinner
- "Video format not supported" error
- Quality switching failures

**Solutions:**
1. **Check Video Sources**
   ```typescript
   // Verify video URLs in videoSources.ts
   const videoConfig = videoSources[videoId];
   if (!videoConfig) {
     console.error('Video configuration not found');
   }
   ```

2. **Browser Compatibility**
   ```typescript
   // Check video format support
   const video = document.createElement('video');
   const canPlay = video.canPlayType('video/mp4');
   if (!canPlay) {
     // Fallback to different format
   }
   ```

3. **Network Issues**
   ```bash
   # Check CDN accessibility
   # Verify CORS headers
   # Test with different quality options
   ```

### Database Connection Issues

#### RLS Policy Violations
**Symptoms:**
- "Insufficient privileges" errors
- Data not loading for authenticated users
- Empty query results

**Solutions:**
1. **Verify User Authentication**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     console.error('User not authenticated');
     return;
   }
   ```

2. **Check RLS Policies**
   ```sql
   -- Verify policies exist and are correct
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. **Test with Service Role**
   ```typescript
   // Temporarily test with service role key
   // (Only for debugging, never in production)
   ```

#### Connection Timeouts
**Symptoms:**
- Queries hanging indefinitely
- "Connection timeout" errors
- Slow application response

**Solutions:**
```typescript
// Add timeout to queries
const { data, error } = await supabase
  .from('table')
  .select('*')
  .abortSignal(AbortSignal.timeout(5000));
```

### UI/UX Issues

#### Mobile Responsiveness
**Symptoms:**
- Layout breaking on mobile
- Touch interactions not working
- Text too small or large

**Solutions:**
1. **Check Tailwind Breakpoints**
   ```typescript
   // Use responsive classes
   className="text-sm md:text-base lg:text-lg"
   ```

2. **Test Touch Interactions**
   ```typescript
   // Ensure touch targets are at least 44px
   className="min-h-[44px] min-w-[44px]"
   ```

#### Loading States
**Symptoms:**
- Content flashing
- Loading spinners not showing
- User confusion during waits

**Solutions:**
```typescript
// Implement proper loading states
const [loading, setLoading] = useState(true);

// Show skeleton loaders
if (loading) {
  return <SkeletonLoader />;
}
```

### Performance Issues

#### Slow Page Loads
**Symptoms:**
- Long initial load times
- Blank screens
- Poor user experience

**Solutions:**
1. **Optimize Bundle Size**
   ```bash
   # Analyze bundle
   npm run build --analyze
   ```

2. **Implement Code Splitting**
   ```typescript
   // Lazy load components
   const LazyComponent = lazy(() => import('./Component'));
   ```

3. **Optimize Images**
   ```typescript
   // Use appropriate image formats and sizes
   // Implement lazy loading for images
   ```

#### Memory Leaks
**Symptoms:**
- Increasing memory usage
- Browser crashes
- Slow performance over time

**Solutions:**
```typescript
// Clean up subscriptions and timers
useEffect(() => {
  const subscription = supabase
    .channel('channel')
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Development Environment Issues

#### Build Failures
**Symptoms:**
- Compilation errors
- Type checking failures
- Bundle generation issues

**Solutions:**
1. **Clear Cache**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Check TypeScript Errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Update Dependencies**
   ```bash
   npm update
   ```

#### Hot Reload Not Working
**Symptoms:**
- Changes not reflecting
- Manual refresh required
- Development server issues

**Solutions:**
```bash
# Restart development server
npm run dev

# Check for file watching issues
# Verify port availability
```

## Debugging Tools

### Browser DevTools
1. **Console Logs**
   ```typescript
   console.log('Debug info:', data);
   console.error('Error occurred:', error);
   ```

2. **Network Tab**
   - Check API requests
   - Verify response codes
   - Monitor payload sizes

3. **Application Tab**
   - Check local storage
   - Verify session tokens
   - Clear cached data

### Supabase Dashboard
1. **SQL Editor**
   ```sql
   -- Test queries directly
   SELECT * FROM user_subscriptions WHERE user_id = 'uuid';
   ```

2. **Logs**
   - Edge function logs
   - Database logs
   - Auth logs

3. **Real-time**
   - Monitor table changes
   - Test subscriptions
   - Debug webhooks

### React Query DevTools
```typescript
// Add to development environment
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

## Error Logging

### Custom Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to external service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Analytics Error Tracking
```typescript
const { trackEvent } = useAnalytics();

try {
  // Risky operation
} catch (error) {
  trackEvent('error', 'Component', error.message);
  console.error('Operation failed:', error);
}
```

## Support Escalation

### When to Contact Support
- Persistent authentication issues
- Payment gateway configuration problems
- Database corruption or data loss
- Security vulnerabilities
- Performance degradation

### Information to Provide
1. **Error Details**
   - Exact error messages
   - Console logs
   - Network request details

2. **Environment Information**
   - Browser version
   - Device type
   - Network conditions

3. **Reproduction Steps**
   - Step-by-step process
   - Expected vs actual behavior
   - Screenshots or videos

### Emergency Procedures
1. **Service Outage**
   - Check Supabase status page
   - Verify DNS configuration
   - Contact hosting provider

2. **Security Incident**
   - Disable affected features
   - Revoke compromised keys
   - Contact security team

3. **Data Loss**
   - Stop write operations
   - Restore from backup
   - Contact database admin

## Prevention Best Practices

### Code Quality
- Use TypeScript for type safety
- Implement comprehensive error handling
- Add proper loading states
- Write unit and integration tests

### Monitoring
- Set up error tracking
- Monitor performance metrics
- Track user analytics
- Implement health checks

### Security
- Regular security audits
- Keep dependencies updated
- Use environment variables for secrets
- Implement proper authentication

This troubleshooting guide should help resolve most common issues encountered in the Yogi AI platform.
