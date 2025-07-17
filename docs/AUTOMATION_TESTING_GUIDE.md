# Automation System Testing Guide

## Overview
This guide provides comprehensive testing procedures for the programmatic user automation system.

## Quick Start Testing

### 1. Access Admin Interface
Navigate to `/automation-admin` in your app to access the testing dashboard.

### 2. Initial Setup
1. Click "Setup Automation System" to create users and content
2. Wait 2-3 minutes for initialization to complete
3. Refresh the page to see updated statistics

### 3. Manual Testing
Use the testing panel to trigger individual functions:
- **Posting Bot**: Creates new posts with generated images
- **Engagement Bot**: Adds likes and comments to existing posts
- **Cleanup**: Removes old activity and manages system health

## Automated Testing Schedule

### GitHub Actions Workflows
The system runs automatically via GitHub Actions:

| Workflow | Schedule | Purpose |
|----------|----------|---------|
| `posting-bot.yml` | Every 2 hours | Creates new posts |
| `engagement-bot.yml` | Every 3 hours | Adds engagement |
| `cleanup-bot.yml` | Daily at 2 AM | Maintains system health |
| `community-feed-refresh.yml` | Every 5 minutes | Updates community feed |
| `automation-monitor.yml` | Weekly | System health checks |

### Database Cron Jobs
Additional automation runs via database cron:
- **Posting Bot**: Every 15 minutes
- **Engagement Bot**: Every 10 minutes  
- **Cleanup**: Daily at 2 AM UTC

## Testing Checklist

### ✅ System Health
- [ ] At least 3 active automation users
- [ ] Recent activity in last 24 hours
- [ ] Content library populated (>10 items)
- [ ] Posts being created regularly

### ✅ Functionality Tests
- [ ] Manual posting bot trigger works
- [ ] Images are generated and uploaded correctly
- [ ] Engagement bot adds likes/comments
- [ ] Cleanup removes old data appropriately
- [ ] Community feed updates properly

### ✅ Performance Tests
- [ ] Posts per day rate is reasonable (2-8 posts/day)
- [ ] Engagement rates look natural (1-5 likes/post)
- [ ] No error spikes in logs
- [ ] System responds within expected timeframes

## Monitoring

### Real-time Monitoring
1. **Admin Dashboard**: `/automation-admin`
2. **Supabase Logs**: Check edge function logs
3. **GitHub Actions**: Monitor workflow runs
4. **Database Activity**: Query `automation_activity_log`

### Key Metrics to Watch
- **Active Users**: Should remain at 3-5 users
- **Daily Posts**: Target 2-8 posts per day
- **Engagement Rate**: 1-5 interactions per post
- **Error Rate**: Should be <5%

### Health Checks
The system includes automated health monitoring:
- Access via `automation-health-check` edge function
- Generates overall health status (healthy/warning/error)
- Provides detailed breakdown of system components

## Troubleshooting

### No Posts Being Created
1. Check automation users exist and are active
2. Verify content library is populated
3. Check edge function logs for errors
4. Manually trigger posting bot

### No Engagement Activity
1. Ensure posts exist to engage with
2. Check engagement bot logs
3. Verify automation users can access posts
4. Test manual engagement trigger

### System Performance Issues
1. Check database performance metrics
2. Review edge function execution times
3. Monitor GitHub Actions workflow times
4. Check for rate limiting issues

### Image Generation Problems
1. Verify R2 storage configuration
2. Check image upload edge function logs
3. Test manual image generation
4. Review Canvas API availability

## Best Practices

### Testing Schedule
- **Daily**: Check admin dashboard stats
- **Weekly**: Review performance metrics  
- **Monthly**: Analyze engagement trends
- **Quarterly**: System health audit

### Maintenance Tasks
- Monitor storage usage for generated images
- Review and update content templates
- Check for spam/inappropriate content
- Update automation user personas

### Security Considerations
- Automation users should not have admin privileges
- Content should be family-friendly and appropriate
- Monitor for abuse or gaming of the system
- Regular security audits of automation functions

## API Endpoints

### Health Check
```bash
curl -X POST https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-health-check
```

### Metrics
```bash
curl -X POST https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-metrics
```

### Manual Triggers
```bash
# Posting Bot
curl -X POST https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-posting-bot

# Engagement Bot  
curl -X POST https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-engagement-bot

# Cleanup
curl -X POST https://mxigbftmmkqnhmocyeeo.supabase.co/functions/v1/automation-cleanup
```

## Support

For issues or questions:
1. Check the admin dashboard first
2. Review edge function logs in Supabase
3. Check GitHub Actions workflow status
4. Monitor database activity logs

## Version History

- **v1.0** - Initial automation system
- **v1.1** - Added image generation
- **v1.2** - Enhanced monitoring and testing tools