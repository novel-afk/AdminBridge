const nodemailer = require('nodemailer');
const path = require('path');
const config = require('./emailConfig');

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

/**
 * Send email notification to new employee with login credentials
 * @param {Object} employee - Employee data including email, name, and role
 * @param {boolean} [testMode=false] - If true, sends to TEST_RECIPIENT instead
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendNewEmployeeCredentials = async (employee, testMode = false) => {
  try {
    const { email, firstName, lastName, role, branch } = employee;
    const branchInfo = branch ? ` for the ${branch} branch` : '';
    
    // Use test recipient if in test mode
    const recipientEmail = testMode ? (config.TEST_RECIPIENT || 'damdilip2@gmail.com') : email;
    
    // Add test mode indicator to subject if in test mode
    const subjectPrefix = testMode ? '[TEST] ' : '';
    
    // Email content
    const mailOptions = {
      from: config.EMAIL_USER,
      to: recipientEmail,
      subject: `${subjectPrefix}Your AdminBridge Account Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1A3A64;">Welcome to AdminBridge</h1>
          </div>
          ${testMode ? '<p><strong>THIS IS A TEST EMAIL</strong></p>' : ''}
          <p>Hello ${firstName} ${lastName},</p>
          <p>Your account has been created in the AdminBridge system as a <strong>${role}</strong>${branchInfo}.</p>
          <p>Please use the following credentials to log in:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> Nepal@123</p>
          </div>
          <p>Please login and change your password immediately for security reasons.</p>
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
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${recipientEmail}${testMode ? ' (TEST MODE)' : ''}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a test email to verify the email functionality
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendTestEmail = async () => {
  const testData = {
    email: 'employee@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'Employee',
    branch: 'Main Office'
  };
  
  console.log(`Sending test email to ${config.TEST_RECIPIENT || 'damdilip2@gmail.com'}...`);
  return sendNewEmployeeCredentials(testData, true);
};

module.exports = {
  sendNewEmployeeCredentials,
  sendTestEmail
}; 