# Email Setup Guide

The contact form uses Resend to send emails. Follow these steps to set it up:

## 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your API Key

1. Go to your Resend dashboard
2. Navigate to "API Keys" section
3. Create a new API key
4. Copy the API key (it starts with `re_`)

## 3. Add API Key to Environment Variables

Create or update your `.env.local` file in the project root:

```bash
RESEND_API_KEY=re_your_api_key_here
```

## 4. Configure Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `midssat.com`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually 5-10 minutes)

Once verified, update the `from` field in `app/api/contact/route.ts`:

```typescript
from: 'SSAT Prep Contact Form <noreply@midssat.com>',
```

## 5. Test the Contact Form

1. Start your dev server: `npm run dev`
2. Navigate to `/contact`
3. Fill out and submit the form
4. Check your email inbox for the message

## Current Behavior

- **Without API Key**: Messages are logged to console only
- **With API Key**: Emails are sent to support@midssat.com or sales@midssat.com
- **Reply-To**: Set to the user's email for easy responses

## Email Template

The email includes:
- Sender's name and email
- Department (Support or Sales)
- Subject line
- Full message content
- Timestamp
- Reply-to functionality

## Resend Pricing

- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Pro Tier**: $20/month for 50,000 emails/month
- See [resend.com/pricing](https://resend.com/pricing) for details

## Alternative Email Services

If you prefer a different service, the API route can be adapted for:
- SendGrid
- AWS SES
- Mailgun
- Postmark
- Nodemailer with SMTP

Just replace the Resend implementation in `app/api/contact/route.ts`.
