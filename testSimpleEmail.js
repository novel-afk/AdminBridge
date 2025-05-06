#!/usr/bin/env node

/**
 * AdminBridge Simple Email Test
 * 
 * Run this script to test if email credentials are working.
 * It will attempt to send an email using the credentials in emailConfig.js.
 */

const nodemailer = require('nodemailer');
const config = require('./emailConfig');

console.log('📧 AdminBridge Email Test');
console.log('========================');
console.log(`Using email: ${config.EMAIL_USER}`);
console.log(`Testing to: ${config.TEST_RECIPIENT || 'damdilip2@gmail.com'}`);
console.log('========================');

// Check configuration
if (config.EMAIL_USER === 'your.email@gmail.com' || 
    config.EMAIL_PASSWORD === 'your-app-password') {
  console.error('\n❌ ERROR: Email configuration not set!');
  console.error('Please update emailConfig.js with your Gmail credentials.');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD
  }
});

// Send test email
console.log('\nSending test email...');

transporter.sendMail({
  from: config.EMAIL_USER,
  to: config.TEST_RECIPIENT || 'damdilip2@gmail.com',
  subject: 'AdminBridge Email Test',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #1A3A64;">AdminBridge Email Test</h1>
      <p>This is a test email from AdminBridge.</p>
      <p>If you're receiving this, your email configuration is working correctly!</p>
    </div>
  `
})
.then(info => {
  console.log('\n✅ SUCCESS: Test email sent!');
  console.log(`Message ID: ${info.messageId}`);
  process.exit(0);
})
.catch(error => {
  console.error('\n❌ ERROR: Failed to send test email!');
  console.error(error);
  process.exit(1);
}); 