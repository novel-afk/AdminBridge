# Email Notification System

This system sends email notifications to new employees and students when their accounts are created in AdminBridge.

## Setup Instructions

1. Create a `.env` file in the `backend` directory with the following settings:
   ```
   # Email Settings
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=http://localhost:5173
   ```

2. For Gmail, you need to create an App Password:
   - Go to your Google Account settings: https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled
   - Go to App Passwords: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app and "Other (Custom name)" as the device
   - Name it "AdminBridge" and click "Generate"
   - Use the generated 16-character password as your `EMAIL_PASSWORD`

3. Make sure Node.js is installed on your server

4. Install required Node.js packages:
   ```
   cd backend
   npm install nodemailer node-cron
   ```

## How it Works

1. When a new employee (Branch Manager, Counsellor, or Receptionist) or student is created through the API, the system automatically sends an email notification with login credentials.

2. Default login credentials are:
   - Email: The user's email address
   - Password: Nepal@123

3. The email includes a login link and instructions to change the password for security reasons.

4. If email sending fails, the system will retry every 5 minutes.

## Customization

- To change the email template, edit `emailNotifier.js`
- To change the retry interval, edit the cron schedule in `emailService.js` 