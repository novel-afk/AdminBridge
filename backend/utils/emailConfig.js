/**
 * Email configuration for AdminBridge
 * 
 * IMPORTANT: You need to update this file with your actual Gmail credentials to send emails!
 * 
 * NOTE TO ADMIN: To send emails to damdilip2@gmail.com as requested, you need to:
 * 1. Use your own Gmail account in EMAIL_USER (not the recipient's email)
 * 2. Generate an App Password for your Gmail account
 * 3. Update both EMAIL_USER and EMAIL_PASSWORD below
 * 
 * STEP 1: Enter your Gmail address in EMAIL_USER
 *   - Example: 'your.name@gmail.com'
 * 
 * STEP 2: Create an App Password for Gmail
 *   a. Go to: https://myaccount.google.com/security
 *   b. Enable 2-Step Verification if not already enabled
 *   c. Go to: https://myaccount.google.com/apppasswords
 *   d. Select "Mail" and "Other (Custom name)" -> "AdminBridge"
 *   e. Click "Generate" and copy the 16-character password
 *   f. Enter this password in EMAIL_PASSWORD (remove spaces)
 *      Example: 'abcdefghijklmnop'
 * 
 * STEP 3: Update FRONTEND_URL with your actual frontend URL
 *   - Example: 'http://localhost:5173' or 'https://your-domain.com'
 * 
 * To test if your email configuration works:
 * 1. Save this file with your updates
 * 2. Run 'node testEmail.js' in this directory
 */

module.exports = {
  // REPLACE WITH YOUR ACTUAL CREDENTIALS
  EMAIL_USER: 'novel.koirala@gmail.com',  // Enter your Gmail address here
  EMAIL_PASSWORD: 'atvwlbjjzcynmixf',  // Updated App Password (no spaces)
  
  // Application URLs - Update with your actual URL
  FRONTEND_URL: 'http://localhost:5173',
  
  // Recipient for test email - Already set to the requested address
  TEST_RECIPIENT: 'dilipshrestha503@gmail.com',
  
  // Email sending configuration (usually don't need to change)
  RETRY_INTERVAL: 5,  // Minutes between retry attempts
  MAX_RETRIES: 3      // Maximum number of retry attempts
}; 