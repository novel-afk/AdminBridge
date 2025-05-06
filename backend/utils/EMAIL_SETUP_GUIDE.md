# AdminBridge Email Setup Guide

This guide will help you set up email notifications for your AdminBridge application. The system uses Gmail to send email notifications when new employees are created in the system.

## Step 1: Update Email Configuration

First, open the file `backend/utils/emailConfig.js` and update it with your Gmail credentials:

```javascript
module.exports = {
  // REPLACE WITH YOUR ACTUAL CREDENTIALS
  EMAIL_USER: 'your.gmail.account@gmail.com',  // Your Gmail address
  EMAIL_PASSWORD: 'your-app-password',         // Your App Password (not your regular password)
  
  // Application URLs - Update with your actual URL
  FRONTEND_URL: 'http://localhost:5173',       // Your frontend URL
  
  // Other settings - usually don't need to change these
  TEST_RECIPIENT: 'damdilip2@gmail.com',       // For testing
  RETRY_INTERVAL: 5,                           // Minutes between retry attempts
  MAX_RETRIES: 3                               // Maximum number of retry attempts
};
```

## Step 2: Create a Gmail App Password

For security reasons, Gmail requires that you use an "App Password" instead of your regular password:

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Make sure 2-Step Verification is enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Other (Custom name)" → Enter "AdminBridge"
5. Click "Generate" and copy the 16-character password
6. Paste this password in your `emailConfig.js` file (without spaces)

## Step 3: Test Your Email Configuration

After updating your configuration, you can test it by running:

```bash
cd backend
node test_email.js
```

If successful, you'll see a confirmation message and the test recipient will receive an email.

## Troubleshooting

### Email Not Sending

If emails are not being sent, check these common issues:

1. **Incorrect Credentials**: Make sure your email and app password are correct
2. **App Password Not Set Up**: Follow Step 2 above to create an App Password
3. **Less Secure Apps**: If you don't want to use 2FA and App Passwords, enable "Less secure app access" in your Google Account, though this is not recommended
4. **Network Issues**: Make sure your server has internet access

### Testing

You can test the email functionality at any time by running:
- `node backend/test_email.js` - Tests the email system directly
- `node backend/utils/testEmail.js` - More detailed email testing

### Connection Problems

Check the logs for error messages. Common Gmail SMTP errors include:

- **Authentication failed**: Incorrect username or password
- **Invalid login**: Check credentials or try creating a new App Password
- **Timeout**: Network issues or firewall blocking SMTP port 587

## Email for New Employees

When a new employee is created in the system, they will receive an email with:

1. Their login information (email and default password)
2. A link to the login page
3. Instructions to change their password after first login

This happens automatically when the employee's account is created through the API.

## Manual Email Sending

To manually send an email to an employee, you can use the `sendEmail.js` script:

```javascript
const { queueNewEmployeeEmail } = require('./utils/emailService');

// Employee data
const employee = {
  email: 'employee@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'Counsellor',
  branch: 'Main Office'
};

// Send the email
queueNewEmployeeEmail(employee)
  .then(() => console.log('Email sent or queued'))
  .catch(err => console.error('Error:', err));
```

For any further assistance, please contact your system administrator. 