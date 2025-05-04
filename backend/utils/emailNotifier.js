const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const dotenvPath = path.resolve(__dirname, '..', '.env');
let emailUser = 'your-email@gmail.com';
let emailPassword = 'your-app-password';
let frontendUrl = 'http://localhost:5173';

if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      acc[key.trim()] = valueParts.join('=').trim();
      return acc;
    }, {});

  emailUser = envConfig.EMAIL_USER || emailUser;
  emailPassword = envConfig.EMAIL_PASSWORD || emailPassword;
  frontendUrl = envConfig.FRONTEND_URL || frontendUrl;
}

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

/**
 * Send email notification to new employee with login credentials
 * @param {Object} employee - Employee data including email, name, and role
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendNewEmployeeCredentials = async (employee) => {
  try {
    const { email, firstName, lastName, role } = employee;
    
    // Email content
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: 'Your AdminBridge Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1A3A64;">Welcome to AdminBridge</h1>
          </div>
          <p>Hello ${firstName} ${lastName},</p>
          <p>Your account has been created in the AdminBridge system as a <strong>${role}</strong>.</p>
          <p>Please use the following credentials to log in:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> Nepal@123</p>
          </div>
          <p>Please login and change your password immediately for security reasons.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/login" 
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
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendNewEmployeeCredentials,
}; 