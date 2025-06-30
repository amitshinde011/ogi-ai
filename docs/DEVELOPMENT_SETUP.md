
# Development Setup Guide

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version for version control
- **VS Code**: Recommended editor with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "supabase.supabase"
  ]
}
```

## Project Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd yogi-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Environment Configuration
The project uses Supabase for all configuration. No local `.env` file is needed as all secrets are managed through Supabase Edge Functions.

### 3. Supabase Setup
1. **Project Connection**
   - Project ID: `mxigbftmmkqnhmocyeeo`
   - URL: `https://mxigbftmmkqnhmocyeeo.supabase.co`

2. **Required Secrets** (Set in Supabase Dashboard):
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   BRAINTREE_MERCHANT_ID
   BRAINTREE_PUBLIC_KEY
   BRAINTREE_PRIVATE_KEY
   BRAINTREE_ENVIRONMENT
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
   ```

## Development Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks for quality checks

### Testing Guidelines
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

## Architecture Guidelines

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── payment/        # Payment components
│   └── recipes/        # Recipe components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── integrations/       # External integrations
```

### Component Guidelines
1. **Small and Focused**: Keep components under 200 lines
2. **Single Responsibility**: One component, one purpose
3. **TypeScript First**: Always use proper typing
4. **Custom Hooks**: Extract reusable logic

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserProfile.ts`)

## Database Development

### Schema Changes
All database changes should be made through Supabase SQL Editor:

1. Navigate to SQL Editor in Supabase Dashboard
2. Write migration SQL
3. Test thoroughly in staging
4. Apply to production with care

### RLS Policies
Always implement Row Level Security:
```sql
-- Example RLS policy
CREATE POLICY "Users can view own data" 
ON table_name 
FOR SELECT 
USING (auth.uid() = user_id);
```

## Payment Integration Testing

### Braintree Sandbox
```javascript
// Test card numbers
const testCards = {
  visa: '4111111111111111',
  mastercard: '5555555555554444',
  amex: '378282246310005'
};
```

### Razorpay Test Mode
```javascript
// Test credentials format
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
```

## Common Development Tasks

### Adding New Routes
1. Create page component in `src/pages/`
2. Add route to `src/App.tsx`
3. Update navigation if needed
4. Test authentication requirements

### Creating New Components
1. Create component file with proper TypeScript
2. Export from appropriate index file
3. Add to Storybook if applicable
4. Write tests for complex logic

### Database Operations
1. Use Supabase client consistently
2. Implement proper error handling
3. Add loading states
4. Test with RLS policies

## Performance Guidelines

### Bundle Optimization
- Use dynamic imports for code splitting
- Optimize images and assets
- Minimize third-party dependencies
- Monitor bundle size regularly

### React Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid inline functions in render
- Use useCallback and useMemo appropriately

## Debugging Tools

### Browser DevTools
- React Developer Tools extension
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console for error tracking

### Supabase Debugging
- SQL Editor for query testing
- Logs section for Edge Function debugging
- Real-time section for subscription testing
- Auth section for user management

## Deployment Process

### Development Deployment
- Automatic deployment on Lovable platform
- Preview URLs for testing
- Environment variable management

### Production Deployment
1. Test thoroughly in staging
2. Verify all secrets are configured
3. Check payment gateway settings
4. Monitor deployment logs
5. Perform smoke tests

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check Supabase Auth configuration
2. **Payment Failures**: Verify gateway credentials
3. **Database Errors**: Check RLS policies
4. **Build Failures**: Verify TypeScript errors

### Getting Help
- Check documentation in `/docs` folder
- Review console errors and logs
- Use Supabase dashboard for debugging
- Contact team for complex issues

This setup guide ensures consistent development practices across the team.
