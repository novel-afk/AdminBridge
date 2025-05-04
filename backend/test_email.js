#!/usr/bin/env node

const { queueNewEmployeeEmail } = require('./utils/emailService');

// Test employee data
const testEmployee = {
  email: 'novel.koirala@gmail.com', // Using your email for the test
  firstName: 'Test',
  lastName: 'User',
  role: 'BranchManager',
  branch: 'Test Branch'
};

console.log('Sending test email to:', testEmployee.email);

// Queue the email sending
queueNewEmployeeEmail(testEmployee);

// Keep the process alive for a moment to allow the email to be sent
setTimeout(() => {
  console.log('Test completed. Check your email inbox.');
  process.exit(0);
}, 10000); // 10 seconds 