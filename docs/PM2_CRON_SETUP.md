# PM2 Cron Job Setup for Vocabulary Review Notifications

This guide explains how to set up vocabulary review notifications using PM2 cron on your Ubuntu server.

---

## 🎯 Why PM2 Cron?

**Advantages over external services:**
- ✅ Full control over your infrastructure
- ✅ No external dependencies
- ✅ Faster execution (local network)
- ✅ Better logging and monitoring
- ✅ Free (no service limits)
- ✅ Can run other background tasks

**vs. Server-Based Crons:**
- ✅ Survives server restarts (PM2 auto-restart)
- ✅ Better process management
- ✅ Built-in logging
- ✅ Easy monitoring with PM2 commands

---

## 📋 Prerequisites

- Ubuntu server with PM2 installed
- Node.js installed (v18 or higher recommended)
- Your application deployed and accessible
- Environment variables configured

---

## 🔧 Step 1: Install PM2 (if not already installed)

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Set up PM2 to start on system boot
pm2 startup systemd
# Follow the instructions it prints

# Save current PM2 process list
pm2 save
```

---

## 📝 Step 2: Create Cron Script

Create a Node.js script that will call your API endpoint.

**Location:** `/root/ssat-cron/vocabulary-review-cron.js`

```javascript
#!/usr/bin/env node

/**
 * Vocabulary Review Push Notification Cron Job
 * Calls the API endpoint to send push notifications to all active devices
 */

const https = require('https');
const url = require('url');

// Configuration
const API_URL = process.env.API_URL || 'https://midssat.com';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error('❌ Error: CRON_SECRET environment variable not set');
  process.exit(1);
}

const endpoint = `${API_URL}/api/cron/vocabulary-review`;
const parsedUrl = url.parse(endpoint);

console.log(`🔔 [${new Date().toISOString()}] Starting vocabulary review notification cron...`);
console.log(`📍 Endpoint: ${endpoint}`);

// Make HTTPS request with Authorization header
const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 443,
  path: parsedUrl.path,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}`);

    try {
      const result = JSON.parse(data);
      console.log(`✅ Response:`, JSON.stringify(result, null, 2));

      if (result.success) {
        console.log(`🎉 Successfully sent notifications!`);
        console.log(`📱 Total devices: ${result.stats?.totalDevices || 0}`);
        console.log(`✅ Success: ${result.stats?.successCount || 0}`);
        console.log(`❌ Failed: ${result.stats?.failureCount || 0}`);
        process.exit(0);
      } else {
        console.error('❌ API returned error:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

// Timeout after 30 seconds
req.setTimeout(30000, () => {
  console.error('⏰ Request timeout after 30 seconds');
  req.destroy();
  process.exit(1);
});

req.end();
```

**Make it executable:**
```bash
chmod +x /root/ssat-cron/vocabulary-review-cron.js
```

---

## 🎯 Step 3: Create PM2 Ecosystem File

Create a PM2 ecosystem configuration file for better management.

**Location:** `/root/ssat-cron/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'vocabulary-review-cron',
      script: './vocabulary-review-cron.js',
      cron_restart: '0 18 * * *',  // Every day at 6:00 PM (18:00)
      watch: false,
      autorestart: false,  // Don't restart on exit (cron will restart)
      env: {
        NODE_ENV: 'production',
        API_URL: 'https://midssat.com',
        CRON_SECRET: '1c313f85f340141b6081eaf0de5df30f24e4faefb1a8fdf3275eb85c644a8edf',
        TZ: 'America/New_York'  // Set your timezone
      },
      error_file: './logs/vocabulary-cron-error.log',
      out_file: './logs/vocabulary-cron-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '200M'
    }
  ]
};
```

---

## 🚀 Step 4: Start the Cron Job with PM2

```bash
# Navigate to cron directory
cd /root/ssat-cron

# Create logs directory
mkdir -p logs

# Start the cron job
pm2 start ecosystem.config.js

# Verify it's running
pm2 list

# View logs
pm2 logs vocabulary-review-cron

# Save PM2 configuration
pm2 save
```

---

## 📊 Step 5: Monitor and Manage

### View Status
```bash
# List all PM2 processes
pm2 list

# View detailed info
pm2 info vocabulary-review-cron

# View logs (live tail)
pm2 logs vocabulary-review-cron

# View last 100 lines
pm2 logs vocabulary-review-cron --lines 100

# View only errors
pm2 logs vocabulary-review-cron --err
```

### Manual Trigger (for testing)
```bash
# Restart the cron job immediately (will execute once)
pm2 restart vocabulary-review-cron

# Or run the script directly
node /root/ssat-cron/vocabulary-review-cron.js
```

### Stop/Start
```bash
# Stop the cron
pm2 stop vocabulary-review-cron

# Start the cron
pm2 start vocabulary-review-cron

# Delete from PM2
pm2 delete vocabulary-review-cron
```

---

## 🕐 Cron Schedule Examples

Edit `ecosystem.config.js` and change the `cron_restart` value:

```javascript
// Every day at 8:00 AM
cron_restart: '0 8 * * *'

// Every day at 8:00 AM and 8:00 PM
cron_restart: '0 8,20 * * *'

// Every 15 minutes (for critical alerts)
cron_restart: '*/15 * * * *'

// Every hour
cron_restart: '0 * * * *'

// Every day at 8:00 AM on weekdays only
cron_restart: '0 8 * * 1-5'

// Every Sunday at 7:00 PM (weekly report)
cron_restart: '0 19 * * 0'
```

**Cron Format:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

---

## 🔐 Security Best Practices

### 1. Use Environment Variables

**Never hardcode secrets!** Use PM2's env config or a `.env` file:

```bash
# Create .env file
cat > /root/ssat-cron/.env << EOF
API_URL=https://midssat.com
CRON_SECRET=1c313f85f340141b6081eaf0de5df30f24e4faefb1a8fdf3275eb85c644a8edf
TZ=America/New_York
EOF

# Restrict permissions
chmod 600 /root/ssat-cron/.env
```

Update `ecosystem.config.js`:
```javascript
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apps: [{
    name: 'vocabulary-review-cron',
    script: './vocabulary-review-cron.js',
    cron_restart: '0 18 * * *',  // 6:00 PM daily
    autorestart: false,
    env: {
      NODE_ENV: 'production',
      API_URL: process.env.API_URL,
      CRON_SECRET: process.env.CRON_SECRET,
      TZ: process.env.TZ || 'America/New_York'
    }
  }]
};
```

### 2. Secure the Cron Directory

```bash
# Set ownership
sudo chown -R root:root /root/ssat-cron

# Set permissions
chmod 700 /root/ssat-cron
chmod 600 /root/ssat-cron/.env
chmod 600 /root/ssat-cron/ecosystem.config.js
chmod 755 /root/ssat-cron/vocabulary-review-cron.js
```

---

## 📧 Email Notifications on Failure

### Option 1: PM2 Plus (Monitoring Service)

```bash
# Link PM2 to PM2 Plus (formerly Keymetrics)
pm2 link <secret_key> <public_key>

# Enable notifications in PM2 Plus dashboard
# Get alerts via email when cron fails
```

### Option 2: Custom Email Script

Add email notification to `vocabulary-review-cron.js`:

```javascript
const { exec } = require('child_process');

function sendEmail(subject, body) {
  const command = `echo "${body}" | mail -s "${subject}" admin@yourdomain.com`;
  exec(command, (error) => {
    if (error) {
      console.error('Failed to send email:', error);
    }
  });
}

// On failure
process.on('exit', (code) => {
  if (code !== 0) {
    sendEmail(
      '❌ Vocabulary Cron Failed',
      `Cron job failed with exit code ${code} at ${new Date().toISOString()}`
    );
  }
});
```

---

## 🔄 Multiple Cron Jobs

You can run multiple cron jobs for different purposes:

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'daily-review-summary',
      script: './vocabulary-review-cron.js',
      cron_restart: '0 8 * * *',  // 8:00 AM daily
      autorestart: false,
      env: {
        API_URL: 'https://midssat.com',
        CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
        TZ: 'America/New_York'
      }
    },
    {
      name: 'critical-alerts',
      script: './vocabulary-review-cron.js',
      cron_restart: '*/15 * * * *',  // Every 15 minutes
      autorestart: false,
      env: {
        API_URL: 'https://midssat.com',
        CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
        TZ: 'America/New_York'
      }
    },
    {
      name: 'weekly-report',
      script: './weekly-report-cron.js',
      cron_restart: '0 19 * * 0',  // Sunday 7:00 PM
      autorestart: false,
      env: {
        API_URL: 'https://midssat.com',
        CRON_SECRET_TOKEN: process.env.CRON_SECRET_TOKEN,
        TZ: 'America/New_York'
      }
    }
  ]
};
```

Start all:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🧪 Testing

### Test the Script Locally

```bash
# Set environment variables
export API_URL="https://midssat.com"
export CRON_SECRET_TOKEN="your-secret-token"

# Run the script
node vocabulary-review-cron.js

# Expected output:
🔔 [2025-01-09T...] Starting vocabulary review notification cron...
📊 Status: 200
✅ Response: {
  "success": true,
  "wordsDue": 0,
  "notificationsSent": 0
}
🎉 Successfully sent 0 notifications
```

### Test the PM2 Cron

```bash
# Start the cron with a short interval for testing
pm2 start ecosystem.config.js

# Restart manually to trigger immediately
pm2 restart vocabulary-review-cron

# Watch logs in real-time
pm2 logs vocabulary-review-cron --lines 50

# Check if it executed successfully
pm2 info vocabulary-review-cron
```

---

## 🐛 Troubleshooting

### Cron Not Running

**Check PM2 status:**
```bash
pm2 list
pm2 info vocabulary-review-cron
```

**Check logs:**
```bash
pm2 logs vocabulary-review-cron --lines 100
```

**Verify cron syntax:**
```bash
# Test cron expression online: https://crontab.guru/
```

### Authentication Errors

**Error:** `401 Unauthorized`

**Solution:**
1. Verify `CRON_SECRET_TOKEN` matches server environment variable
2. Check for extra spaces or newlines in token
3. Ensure URL encoding is correct

### Network Errors

**Error:** `ECONNREFUSED` or `ETIMEDOUT`

**Solution:**
1. Check API_URL is correct and accessible
2. Verify firewall allows outbound HTTPS
3. Test with curl: `curl "https://midssat.com/api/cron/vocabulary-review-notifications?token=YOUR_TOKEN"`

### PM2 Not Persisting After Reboot

```bash
# Set up PM2 to start on boot
pm2 startup systemd

# Run the command it outputs (will require sudo)
# Then save the process list
pm2 save
```

---

## 📈 Monitoring Dashboard

### PM2 Monit (Built-in)

```bash
# Real-time monitoring
pm2 monit
```

Shows:
- CPU usage
- Memory usage
- Logs (live)
- Process status

### PM2 Web Dashboard

```bash
# Install PM2 web interface
npm install -g pm2-gui

# Start web GUI
pm2-gui start

# Access at http://your-server:8088
```

---

## 🔄 Updating the Cron Job

```bash
# Edit the ecosystem file
nano /root/ssat-cron/ecosystem.config.js

# Reload the configuration
pm2 reload ecosystem.config.js

# Or delete and restart
pm2 delete vocabulary-review-cron
pm2 start ecosystem.config.js

# Save the new configuration
pm2 save
```

---

## 📝 Quick Update Commands

If you already have the cron job running with the old endpoint, update it:

```bash
# Navigate to cron directory
cd /root/ssat-cron

# Update the script with the new code (copy from Step 2 above)
nano vocabulary-review-cron.js

# Update ecosystem.config.js with CRON_SECRET (instead of CRON_SECRET_TOKEN)
nano ecosystem.config.js

# Reload PM2
pm2 delete vocabulary-review-cron
pm2 start ecosystem.config.js
pm2 save

# Test it
pm2 restart vocabulary-review-cron
pm2 logs vocabulary-review-cron
```

---

## ✅ Verification Checklist

- [ ] PM2 installed and configured
- [ ] PM2 set to start on system boot (`pm2 startup`)
- [ ] Cron script created and executable
- [ ] Environment variables set correctly
- [ ] `.env` file created with secret token
- [ ] Ecosystem config created
- [ ] PM2 cron started (`pm2 start ecosystem.config.js`)
- [ ] PM2 config saved (`pm2 save`)
- [ ] Logs show successful execution
- [ ] Test manual trigger works
- [ ] Verified notifications sent

---

**Generated with Claude Code**
