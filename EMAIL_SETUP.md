# Email Setup Guide - PurelyMail

The contact form uses PurelyMail's SMTP service to send emails. Follow these steps to set it up:

## 1. Set Up PurelyMail

If you don't have PurelyMail yet:
1. Go to [purelymail.com](https://purelymail.com)
2. Sign up for an account
3. Add your domain (midssat.com)
4. Configure DNS records as instructed by PurelyMail

## 2. Create Email Accounts

Create the email accounts you need:
- `support@midssat.com` - for general support inquiries
- `sales@midssat.com` - for sales and partnership inquiries
- `noreply@midssat.com` - for sending contact form emails (optional)

## 3. Get SMTP Credentials

1. Log in to your PurelyMail dashboard
2. Go to **Settings** → **SMTP Credentials**
3. Note down your SMTP settings:
   - **Host**: `smtp.purelymail.com`
   - **Port**: `587` (recommended) or `465` (SSL)
   - **Username**: Your full email address (e.g., `support@midssat.com`)
   - **Password**: Your email password or app-specific password

## 4. Add Credentials to Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# PurelyMail SMTP Configuration
SMTP_HOST=smtp.purelymail.com
SMTP_PORT=587
SMTP_USER=support@midssat.com
SMTP_PASS=your-email-password-here
SMTP_FROM=noreply@midssat.com
```

**Important**:
- Use the full email address for `SMTP_USER`
- `SMTP_FROM` should be an email you own on your domain
- Never commit `.env.local` to git (it's in .gitignore)

## 5. SMTP Port Options

Choose the appropriate port:
- **Port 587** (STARTTLS): Recommended, most compatible
- **Port 465** (SSL/TLS): More secure, but some hosts block it

The code automatically detects which encryption to use based on the port.

## 6. Test the Contact Form

1. Restart your dev server: `npm run dev`
2. Navigate to `/contact`
3. Fill out and submit the form
4. Check the recipient's inbox (support@midssat.com or sales@midssat.com)

## Current Behavior

- **Without SMTP credentials**: Messages are logged to console only
- **With SMTP credentials**: Emails are sent to support@ or sales@ based on department selection
- **Reply-To**: Automatically set to the user's email for easy responses

## Email Template

Each email includes:
- Sender's name and email
- Department selected (Support or Sales)
- Subject line prefixed with "Contact Form:"
- Full message content with formatting
- Timestamp
- Reply-to functionality (responds directly to user)

## PurelyMail Pricing

- **Free Trial**: 30 days
- **Paid Plans**: Starting at $10/year per domain
- Unlimited email addresses per domain
- See [purelymail.com/pricing](https://purelymail.com/pricing) for details

## Troubleshooting

### Authentication Failed
- Verify your email address and password are correct
- Check if you need an app-specific password
- Ensure your PurelyMail account is active

### Connection Timeout
- Check if your hosting provider blocks SMTP ports
- Try port 465 instead of 587 (and vice versa)
- Verify `smtp.purelymail.com` is accessible from your server

### Emails Not Arriving
- Check spam/junk folders
- Verify the recipient email exists in PurelyMail
- Check PurelyMail's sending logs in the dashboard
- Ensure DNS records (SPF, DKIM) are properly configured

### Using a Different Email Account
You can use any email account on your PurelyMail domain:
1. Update `SMTP_USER` to the email you want to send from
2. Update `SMTP_PASS` with that email's password
3. Restart your server

## Alternative Configuration

If you want to use a different SMTP provider, just update the environment variables:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=from@example.com
```

The code works with any standard SMTP service (Gmail, Outlook, etc.).
