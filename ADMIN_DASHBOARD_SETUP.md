# Admin Dashboard Setup Guide

## Overview
The admin dashboard tracks user engagement, tab clicks, and feature usage with real-time analytics.

## Database Migration

Run the migration to create the analytics tables:

```bash
# If using Supabase CLI locally
supabase migration up

# Or apply the migration manually in Supabase dashboard
# File: supabase/migrations/010_analytics_tracking.sql
```

## Setting Up Admin Access

To grant a user admin privileges, run this SQL in Supabase:

```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'your-admin@email.com';
```

## Installing Dependencies

Install the new dependency:

```bash
npm install @radix-ui/react-tabs
```

## Features Implemented

### 1. Database Schema
- `analytics_events` table - Stores all user events
- `user_sessions` table - Tracks user sessions
- `is_admin` field added to `profiles` table

### 2. Client-Side Tracking
- `hooks/useAnalytics.ts` - Analytics hook for tracking events
- `components/TrackedTab.tsx` - Component for tracking tab clicks
- Navigation updated to use `TrackedTab` component

### 3. API Endpoints
- `POST /api/admin/analytics/events` - Receives analytics events
- `GET /api/admin/analytics/summary` - Dashboard summary data
- `GET /api/admin/analytics/tabs` - Tab click analytics
- `GET /api/admin/analytics/activity-feed` - Recent activity feed

### 4. Admin Dashboard
- Located at `/admin/dashboard`
- Protected by admin authentication
- Features:
  - Summary cards (Total Users, Active Users, New Signups, Conversion Rate)
  - Tab click analytics table with filters
  - User breakdown (Registered vs Guest)
  - Live activity feed
  - Tab clicks chart

### 5. UI Components
- `components/ui/table.tsx` - Table component
- `components/ui/badge.tsx` - Badge component
- `components/ui/tabs.tsx` - Tabs component

## Usage

### Accessing the Dashboard
1. Set a user as admin (see above)
2. Log in as that user
3. Navigate to `/admin/dashboard`

### Tracking Events
The analytics system automatically tracks:
- Tab clicks (via `TrackedTab` component)
- Page views (can be added manually)
- Feature usage (can be added manually)

To track custom events:
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleAction = () => {
    trackEvent('custom_event', {
      action: 'button_click',
      feature: 'my_feature',
    });
  };
}
```

## Security

- Admin routes are protected by `app/admin/layout.tsx`
- Only users with `is_admin = true` can access admin endpoints
- RLS policies ensure only admins can view analytics data

## Performance

- Events are batched and flushed every 30 seconds
- Uses `navigator.sendBeacon` for page unload events
- Database indexes created for optimal query performance

## Next Steps

1. Run the migration
2. Set yourself as admin
3. Install dependencies: `npm install`
4. Access `/admin/dashboard`
5. Start tracking user behavior!
