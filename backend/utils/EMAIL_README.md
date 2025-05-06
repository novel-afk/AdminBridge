# Employee Email Notification System

This system automatically sends login credentials to new employees when they are created in the AdminBridge system.

## How It Works

1. When a new employee is created via the API (`EmployeeViewSet.create`), the Python function `send_employee_credentials_email` is called
2. This function calls a Node.js script (`sendEmail.js`) with the employee data
3. The Node.js script uses nodemailer to send an email with login credentials
4. If sending fails, it queues the email for retry using node-cron

## Setup Instructions

### 1. Configure Email Settings

Edit the `emailConfig.js` file in the `utils` directory to set up your email credentials:

```javascript
module.exports = {
  EMAIL_USER: 'your-email@gmail.com',      // Your Gmail address
  EMAIL_PASSWORD: 'your-app-password',     // Your Gmail app password
  FRONTEND_URL: 'http://localhost:5173',   // Your frontend URL
};
```

### 2. Setting Up Gmail App Password

1. **Enable 2-Step Verification**:
   - Go to your Google Account at https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to App Passwords at https://myaccount.google.com/apppasswords
   - Select "Mail" and your device, then click "Generate"
   - Use the generated 16-character password as your `EMAIL_PASSWORD`

### 3. Install Node Dependencies

Run the following command in the `backend` directory:

```bash
npm install node-cron nodemailer
```

### 4. Make Scripts Executable

Make sure the Node.js scripts are executable:

```bash
chmod +x utils/sendEmail.js
```

## Testing the Email Functionality

You can test the email sending functionality with the following command:

```bash
cd backend/utils
node sendEmail.js '{"email":"test@example.com","firstName":"Test","lastName":"User","role":"Receptionist","branch":"Main Office"}'
```

## Troubleshooting

- **Authentication Error**: Make sure you've created an App Password correctly and updated the `emailConfig.js` file
- **Log Files**: Check the server logs for any error messages
- **Gmail Security**: Make sure your Gmail account has "Less secure app access" enabled if you're not using App Passwords
- **Firewall Issues**: Ensure your server can connect to Gmail's SMTP servers (port 465/587)

## Email Content

The email sent to new employees includes:
- A welcome message
- Their role and branch (if applicable)
- Their email address
- The default password (Nepal@123)
- A link to the login page 