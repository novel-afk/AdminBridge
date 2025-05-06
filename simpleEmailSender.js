/**
 * Simple Email Sender for AdminBridge
 * 
 * This file provides a straightforward function to send emails to new employees.
 */

const nodemailer = require('nodemailer');
const config = require('./emailConfig');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD
  }
});

/**
 * Send welcome email to a new employee with login credentials
 * 
 * @param {Object} employee - Employee data (email, firstName, lastName, role, branch)
 * @returns {Promise} - Resolves when email is sent
 */
function sendCredentialEmail(employee) {
  return new Promise((resolve, reject) => {
    const { email, firstName, lastName, role, branch } = employee;
    
    // Create email content
    const mailOptions = {
      from: config.EMAIL_USER,
      to: email,
      subject: 'Your AdminBridge Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1A3A64;">Welcome to AdminBridge</h1>
          </div>
          <p>Hello ${firstName} ${lastName},</p>
          <p>Your account has been created in the AdminBridge system as a <strong>${role}</strong>${branch ? ` for the ${branch} branch` : ''}.</p>
          <p>Please use the following credentials to log in:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${config.DEFAULT_PASSWORD}</p>
          </div>
          <p style="color: #d00000;"><strong>Important:</strong> Please change your password immediately after login.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.FRONTEND_URL}/login" 
               style="background-color: #1A3A64; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Login Now
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            If you have any questions, please contact your administrator.
          </p>
        </div>
      `
    };
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent successfully to', email);
        resolve(info);
      }
    });
  });
}

/**
 * Send a test email to verify configuration
 * 
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise} - Resolves when email is sent
 */
function sendTestEmail(testEmail) {
  const testEmployee = {
    email: testEmail,
    firstName: 'Test',
    lastName: 'User',
    role: 'Employee',
    branch: 'Test Branch'
  };
  
  return sendCredentialEmail(testEmployee);
}

module.exports = {
  sendCredentialEmail,
  sendTestEmail
}; 