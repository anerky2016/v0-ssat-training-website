# SMTP Email Configuration

## Current Status
The feedback form now gracefully handles SMTP authentication failures by logging feedback to the console instead of throwing errors.

## How to Fix SMTP Authentication

The error "535 Authentication Failed" typically means:

### For Gmail:
1. **Enable 2-Factor Authentication** on your Google account
2. **Create an App Password**:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
   - Use this password (not your regular password) in `.env.local`

### Environment Variables (.env.local)

```bash
# For Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here  # Use App Password, not regular password
SMTP_FROM=your-email@gmail.com

# For other providers (e.g., SendGrid, Mailgun)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key-here
SMTP_FROM=noreply@midssat.com
```

### To Disable Email Sending (Development)

Simply remove or comment out the SMTP environment variables in `.env.local`:

```bash
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-password
```

Feedback will be logged to console instead.

### To Test Email Sending

1. Configure SMTP credentials in `.env.local`
2. Restart the dev server
3. Submit feedback through the form
4. Check console for either:
   - `✅ Feedback email sent: [message-id]` (success)
   - `⚠️ SMTP error, logging feedback instead: [error]` (fallback to logging)

## Recommended Providers

- **Gmail**: Good for testing, requires App Password
- **SendGrid**: 100 free emails/day, easy setup
- **Mailgun**: 5000 free emails/month
- **AWS SES**: Very cheap, requires verification
