#!/usr/bin/env node

/**
 * Simple test script for the employee email functionality
 * 
 * This script sends a test email to the TEST_RECIPIENT configured in emailConfig.js
 * 
 * Usage: node testEmployeeEmail.js
 */

const { sendTestEmail } = require('./emailNotifier');
const config = require('./emailConfig');

console.log('AdminBridge Email Test');
console.log('=====================');
console.log(`Sender: ${config.EMAIL_USER}`);
console.log(`Recipient: ${config.TEST_RECIPIENT || 'damdilip2@gmail.com'}`);
console.log('');
console.log('IMPORTANT: Before this will work, you must update emailConfig.js with your actual Gmail credentials.');
console.log('');

// Send test email
sendTestEmail()
  .then(() => {
    console.log('');
    console.log('Test completed successfully! Check the recipient\'s inbox.');
    console.log('');
    console.log('Now when you create new employees through the AdminBridge system,');
    console.log('they will automatically receive their login credentials by email.');
  })
  .catch(error => {
    console.error('\nTest failed with error:');
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication Error:');
      console.error('- Check that you have entered the correct Gmail address in emailConfig.js');
      console.error('- Make sure you\'ve created an App Password for your Gmail account');
      console.error('- Follow the instructions in EMAIL_SETUP_GUIDE.md\n');
    } else {
      console.error(error);
    }
  }); 