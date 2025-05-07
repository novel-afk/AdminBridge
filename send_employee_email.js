const nodemailer = require('nodemailer');

const [,, toEmail, loginUrl] = process.argv;

if (!toEmail || !loginUrl) {
  console.error('Usage: node send_employee_email.js <toEmail> <loginUrl>');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'novel.koirala@gmail.com',
    pass: 'wmep tois aysw wjde'.replace(/\s/g, '') // Remove spaces for app password
  }
});

const mailOptions = {
  from: 'novel.koirala@gmail.com',
  to: toEmail,
  subject: 'Your Employee Account Details',
  html: `
    <h2>Welcome to Admin Bridge!</h2>
    <p>Your account has been created. Here are your login details:</p>
    <ul>
      <li><b>Email:</b> ${toEmail}</li>
      <li><b>Password:</b> Nepal@123</li>
      <li><b>Login URL:</b> <a href="${loginUrl}">${loginUrl}</a></li>
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