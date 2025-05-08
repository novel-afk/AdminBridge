#!/usr/bin/env node

/**
 * AdminBridge Email Testing Script
 * 
 * This script tests the email functionality by sending a test email.
 * 
 * Usage:
 *   node test_email.js
 */

const { sendTestEmail } = require('./utils/emailNotifier');
const config = require('./utils/emailConfig');

console.log('AdminBridge Email Test');
console.log('=====================');
console.log(`Using email: ${config.EMAIL_USER}`);
console.log(`Frontend URL: ${config.FRONTEND_URL}`);
console.log(`Test recipient: ${config.TEST_RECIPIENT || 'damdilip2@gmail.com'}`);
console.log('=====================');

if (config.EMAIL_USER === 'your.email@gmail.com' || 
    config.EMAIL_PASSWORD === 'your-app-password') {
  console.error('\nERROR: Email configuration is not set!');
  console.error('Please update utils/emailConfig.js with your Gmail credentials.');
  console.error('See utils/EMAIL_SETUP_GUIDE.md for detailed instructions.');
  process.exit(1);
}

console.log('\nSending test email...');

sendTestEmail()
  .then(info => {
    console.log('\nSUCCESS: Test email sent!');
    console.log(`Message ID: ${info.messageId}`);
    console.log('\nIf you don\'t receive the email:');
    console.log('1. Check your spam folder');
    console.log('2. Verify your Gmail credentials in utils/emailConfig.js');
    console.log('3. Make sure you\'ve enabled "Less secure app access" or created an App Password');
  })
  .catch(error => {
    console.error('\nERROR: Failed to send test email!');
    console.error(error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure your Gmail credentials are correct in utils/emailConfig.js');
    console.error('2. Enable "Less secure app access" or create an App Password');
    console.error('   See: https://myaccount.google.com/apppasswords');
    console.error('3. Check your internet connection');
  }); 