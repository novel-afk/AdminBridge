# AdminBridge Email Setup Guide

## Overview

This guide will help you set up email notifications for AdminBridge. The system sends emails to new employees when their accounts are created, including their login credentials and password.

## Quick Start

1. Edit `emailConfig.js` with your Gmail credentials
2. Run `node testSimpleEmail.js` to verify your configuration
3. Create a new employee to test the full flow

## Detailed Setup Instructions

### 1. Configure Email Credentials

Open `emailConfig.js` in the root directory and update:

```javascript
module.exports = {
  // Your Gmail account
  EMAIL_USER: 'your.email@gmail.com',
  
  // Your Gmail password or App Password (if 2FA is enabled)
  EMAIL_PASSWORD: 'your-app-password',
  
  // Frontend URL (update to your actual URL)
  FRONTEND_URL: 'http://localhost:5173',
  
  // ...other settings...
};
```

### 2. Set Up Gmail App Password (Recommended)

For better security, create an App Password instead of using your regular Gmail password:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)" → "AdminBridge"
5. Click "Generate" and copy the 16-character password
6. Enter this password in `emailConfig.js` (without spaces)

### 3. Test Your Configuration

Run the test script to verify your email settings:

```bash
node testSimpleEmail.js
```

This will send a test email to the configured test recipient (default: damdilip2@gmail.com).

### 4. Install Dependencies

Make sure all required packages are installed:

```bash
npm install
cd backend && npm install
```

Or use the convenience script:

```bash
npm run install-deps
```

### 5. Test the Full Flow

Create a new employee through the AdminBridge interface or API. The system should automatically send an email with login credentials to the employee's email address.

## Troubleshooting

### Common Issues

- **Authentication Errors**: Check your email and password in `emailConfig.js`
- **Gmail Security Blocks**: Gmail may block "less secure apps" - use App Passwords instead
- **Node.js and Dependencies**: Make sure nodemailer and node-cron are installed

### Test Scripts

Several test scripts are available:

- `node testSimpleEmail.js` - Basic email test from root directory
- `node backend/test_email.js` - Test the backend email configuration
- `node backend/utils/testEmail.js` - Detailed backend email test

## How It Works

1. When a new employee is created via the API, the system triggers an email notification
2. The email contains the employee's login information and a link to the login page
3. Failed emails are automatically retried according to the configured retry settings

## Further Help

For detailed information about the email system implementation, see:

- `backend/utils/EMAIL_SETUP_GUIDE.md` - Detailed backend setup guide
- `backend/utils/emailService.js` - Email queue and retry implementation
- `backend/utils/emailNotifier.js` - Email template and sending logic 