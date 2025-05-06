#!/usr/bin/env node

/**
 * Test script for sending emails
 * Usage: node testEmail.js
 */

const nodemailer = require('nodemailer');
const config = require('./emailConfig');

// Create a transporter with your credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD
  }
});

// Email recipient (as requested by the user)
const recipientEmail = 'damdilip2@gmail.com';

// Create email content
const mailOptions = {
  from: config.EMAIL_USER,
  to: recipientEmail,
  subject: 'AdminBridge Test Email',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1A3A64;">AdminBridge Test Email</h1>
      </div>
      <p>This is a test email from the AdminBridge system.</p>
      <p>If you're receiving this email, it means the email functionality is working correctly.</p>
      <p>An employee would receive their login credentials here:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> employee@example.com</p>
        <p><strong>Password:</strong> Nepal@123</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${config.FRONTEND_URL}/login" 
          style="background-color: #1A3A64; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #777;">
        This is a test email. No action is required.
      </p>
    </div>
  `
};

// Send the email
console.log(`Attempting to send test email to ${recipientEmail}...`);
transporter.sendMail(mailOptions)
  .then(info => {
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  })
  .catch(error => {
    console.error('Error sending email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication Error:');
      console.error('- Make sure you have entered the correct Gmail address in emailConfig.js');
      console.error('- Make sure you have created an App Password for your Gmail account');
      console.error('- Follow the instructions in the emailConfig.js file\n');
    }
  }); 