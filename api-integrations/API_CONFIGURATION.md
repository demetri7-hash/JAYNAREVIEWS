# 🔐 API Integration Environment Configuration

## Required Environment Variables

Add these environment variables to your `.env.local` file in the root of THE PASS project:

```bash
# ===============================================
# TOAST POS API Configuration
# ===============================================

# Your TOAST API authentication token
# Get this from TOAST Developer Portal: https://developer.toasttab.com/
TOAST_API_KEY=your_toast_api_key_here

# Your restaurant's external ID in TOAST system
# Found in TOAST Dashboard > Settings > API > Restaurant ID
TOAST_RESTAURANT_ID=your_restaurant_external_id_here

# TOAST API Base URL (leave as default unless using sandbox)
TOAST_BASE_URL=https://api.toasttab.com

# Optional: TOAST API timeout in milliseconds (default: 30000)
TOAST_API_TIMEOUT=30000

# ===============================================
# Homebase Scheduling API Configuration
# ===============================================

# Your Homebase API authentication token
# Get this from Homebase Account Settings > Integrations > API Access
HOMEBASE_API_KEY=your_homebase_api_key_here

# Your company ID in Homebase
# Found in Homebase Dashboard > Company Settings > Company ID
HOMEBASE_COMPANY_ID=your_company_id_here

# Homebase API Base URL (leave as default unless using sandbox)
HOMEBASE_BASE_URL=https://api.joinhomebase.com

# Optional: Homebase API timeout in milliseconds (default: 30000)
HOMEBASE_API_TIMEOUT=30000

# ===============================================
# Integration Feature Flags
# ===============================================

# Enable/disable specific integration features
ENABLE_TOAST_INTEGRATION=true
ENABLE_HOMEBASE_INTEGRATION=true
ENABLE_SMART_PREP_LISTS=true
ENABLE_INTELLIGENT_TASK_ASSIGNMENT=true
ENABLE_RUSH_PERIOD_DETECTION=true
ENABLE_AUTOMATED_WORKFLOWS=true

# ===============================================
# Integration Sync Settings
# ===============================================

# How often to sync data (in minutes)
TOAST_SYNC_INTERVAL=15
HOMEBASE_SYNC_INTERVAL=30

# Data retention settings (in days)
INTEGRATION_LOG_RETENTION_DAYS=30
SYNC_ERROR_RETENTION_DAYS=7

# ===============================================
# Smart Features Configuration
# ===============================================

# Rush period detection threshold (orders per hour)
RUSH_PERIOD_THRESHOLD=50

# Prep list confidence threshold (0.0 to 1.0)
PREP_CONFIDENCE_THRESHOLD=0.7

# Task assignment workload balance factor
WORKLOAD_BALANCE_FACTOR=0.8

# ===============================================
# Error Handling & Monitoring
# ===============================================

# Enable detailed API logging (development only)
ENABLE_API_DEBUG_LOGGING=false

# Webhook URL for integration alerts (optional)
INTEGRATION_WEBHOOK_URL=

# Email for critical integration errors (optional)
INTEGRATION_ALERT_EMAIL=manager@jaynagyro.com
```

## 🚀 Getting Started

### 1. **Get TOAST API Credentials**

1. Log into your TOAST Dashboard
2. Go to **Settings** → **Integrations** → **API Access**
3. Generate a new API token
4. Copy your **Restaurant External ID**
5. Add both to your `.env.local` file

### 2. **Get Homebase API Credentials**

1. Log into your Homebase account
2. Go to **Account Settings** → **Integrations**
3. Enable **API Access** and generate token
4. Copy your **Company ID** from Company Settings
5. Add both to your `.env.local` file

### 3. **Configure Integration Features**

Choose which features to enable by setting the feature flags:

- `ENABLE_SMART_PREP_LISTS` - Auto-generate prep tasks based on sales data
- `ENABLE_INTELLIGENT_TASK_ASSIGNMENT` - Assign tasks to scheduled employees
- `ENABLE_RUSH_PERIOD_DETECTION` - Auto-create tasks during busy periods
- `ENABLE_AUTOMATED_WORKFLOWS` - Full automation suite

### 4. **Test Your Configuration**

Run the connection test utility:

```bash
npm run test:integrations
```

## 📊 Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TOAST POS     │    │   THE PASS      │    │   HOMEBASE      │
│                 │    │                 │    │                 │
│ • Sales Data    │────│ • Task Engine   │────│ • Schedules     │
│ • Inventory     │    │ • Smart Logic   │    │ • Time Clock    │
│ • Menu Items    │    │ • Automation    │    │ • Labor Costs   │
│ • Orders        │    │ • Dashboard     │    │ • Employee Data │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Security Notes

- **Never commit** `.env.local` files to version control
- **Rotate API keys** regularly (monthly recommended)
- **Monitor API usage** to detect unauthorized access
- **Use environment-specific** keys (dev/staging/production)
- **Enable webhook signatures** when available for secure callbacks

## 📞 API Support Contacts

### TOAST Support
- **Documentation**: https://developer.toasttab.com/
- **Support Email**: developers@toasttab.com
- **Status Page**: https://status.toasttab.com/

### Homebase Support
- **Documentation**: https://developers.joinhomebase.com/
- **Support Email**: api-support@joinhomebase.com
- **Status Page**: https://status.joinhomebase.com/

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify key is correctly copied with no extra spaces
   - Check if key has expired or been revoked
   - Ensure proper environment variable name

2. **"Restaurant/Company Not Found" Error**
   - Verify Restaurant ID / Company ID is correct
   - Check if account has API access enabled
   - Confirm you're using the external ID, not internal ID

3. **"Rate Limit Exceeded" Error**
   - Reduce sync frequency in configuration
   - Implement exponential backoff in error handling
   - Contact API provider to increase limits

4. **Connection Timeout Errors**
   - Increase timeout values in environment variables
   - Check network connectivity and firewall settings
   - Verify API endpoints are accessible

### Debug Mode

Enable debug logging by setting:
```bash
ENABLE_API_DEBUG_LOGGING=true
```

This will log all API requests/responses for troubleshooting.

---

*🎯 Ready to connect THE PASS with your restaurant's ecosystem!*