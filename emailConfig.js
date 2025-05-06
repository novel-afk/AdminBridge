/**
 * Email Configuration for AdminBridge
 * 
 * UPDATE THESE VALUES WITH YOUR GMAIL CREDENTIALS:
 */
module.exports = {
  // Your Gmail account
  EMAIL_USER: 'novel.koirala@gmail.com',
  
  // Your Gmail password or App Password (if 2FA is enabled)
  EMAIL_PASSWORD: 'fsewtfrvcgusjzsp',
  
  // Frontend URL
  FRONTEND_URL: 'http://localhost:5173',
  
  // Default password for new employees
  DEFAULT_PASSWORD: 'Nepal@123',
  
  // Test recipient for email verification
  TEST_RECIPIENT: 'damdilip2@gmail.com',
  
  // Email retry settings
  RETRY_INTERVAL: 5,  // Minutes between retry attempts
  MAX_RETRIES: 3      // Maximum number of retry attempts
}; 