require('dotenv').config();
const nodemailer = require('nodemailer');

// Parse the JSON payload from the first argument
let employee = {};
try {
  employee = JSON.parse(process.argv[2] || '{}');
} catch (e) {
  console.error('Invalid JSON payload:', e);
  process.exit(1);
}

if (!employee.email || !employee.loginUrl) {
  console.error('Usage: node send_employee_email.js <employee_json>');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: employee.email,
  subject: 'Your Employee Account Details',
  html: `
    <h2>Welcome to Admin Bridge!</h2>
    <p>Hello ${employee.firstName || ''} ${employee.lastName || ''},</p>
    <p>Your account has been created as a <b>${employee.role || ''}</b>${employee.branch ? ' for branch ' + employee.branch : ''}.</p>
    <ul>
      <li><b>Email:</b> ${employee.email}</li>
      <li><b>Password:</b> Nepal@123</li>
      <li><b>Login URL:</b> <a href="${employee.loginUrl}">${employee.loginUrl}</a></li>
    </ul>
    <p>Please log in and change your password after your first login.</p>
  `
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.log('Email sent: ' + info.response);
    process.exit(0);
  }
}); 