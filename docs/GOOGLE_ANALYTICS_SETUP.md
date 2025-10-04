# Google Analytics 4 (GA4) Setup Guide

This guide explains how to set up and validate Google Analytics 4 for the SSAT Math Prep website.

## Prerequisites

You need a Google Analytics account with a GA4 property created for your website.

## Setup Steps

### 1. Create GA4 Property (if not exists)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" in the bottom left corner
3. Click "Create Property"
4. Fill in the property details:
   - Property name: "SSAT Math Prep" (or your preferred name)
   - Time zone: Select your timezone
   - Currency: Select your currency
5. Click "Next" and complete the setup wizard
6. After creation, you'll receive a **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variable

1. Copy the Measurement ID from GA4
2. Add it to your production environment variables:
   - For Vercel: Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
3. For local development (optional):
   - Create a `.env.local` file in the project root
   - Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
   - Note: GA will only load in production by default

### 3. Deploy Changes

1. The Google Analytics integration is already added to the codebase
2. Push your changes to trigger a deployment on Vercel
3. Make sure the environment variable is set in production

## Validation

### Method 1: GA4 DebugView (Recommended)

1. **Enable Debug Mode** in your browser:
   - Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
   - OR add `?debug_mode=true` to your URL

2. **Open DebugView**:
   - Go to Google Analytics → Admin → DebugView
   - Visit your production website: https://www.midssat.com
   - You should see real-time events appearing in DebugView

3. **Verify Events**:
   - Look for `page_view` events
   - Check that the `page_location` and `page_path` are correct
   - Navigate to different pages and verify tracking

### Method 2: Real-time Reports

1. Go to Google Analytics → Reports → Realtime
2. Visit your production website
3. Within 30 seconds, you should see:
   - Active users count increases
   - Page views appear in the realtime report
   - Geographic and device data

### Method 3: Browser Developer Tools

1. Open your production website
2. Open Chrome DevTools (F12) → Network tab
3. Filter by "gtag" or "google-analytics"
4. You should see requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - `https://www.google-analytics.com/g/collect`

## Implementation Details

### Files Modified

- `components/google-analytics.tsx` - GA4 integration component
- `app/layout.tsx` - Added GoogleAnalytics component
- `.env.example` - Added NEXT_PUBLIC_GA_MEASUREMENT_ID

### How It Works

1. The `GoogleAnalytics` component loads only in production (`NODE_ENV === 'production'`)
2. It uses Next.js `Script` component with `afterInteractive` strategy for optimal performance
3. gtag.js is loaded from Google's CDN
4. Page views are automatically tracked on initial load and route changes

### Privacy Considerations

- GA4 is configured to respect user privacy
- Only loads in production environment
- Uses standard GA4 tracking without additional user identification
- Consider adding a cookie consent banner for GDPR/CCPA compliance if needed

## Troubleshooting

### GA4 Not Tracking

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in production
2. **Verify Measurement ID**: Confirm it starts with `G-` (not `UA-` which is Universal Analytics)
3. **Check Browser Console**: Look for any JavaScript errors
4. **Ad Blockers**: Disable ad blockers when testing
5. **Production Only**: Remember GA only loads in production mode

### Events Not Appearing

- Wait 24-48 hours for full data processing
- Use DebugView for immediate validation
- Check that the website is deployed to production

## Additional Resources

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GA4 DebugView Documentation](https://support.google.com/analytics/answer/7201382)
- [Next.js Analytics Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
