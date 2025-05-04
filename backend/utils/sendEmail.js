#!/usr/bin/env node

const { queueNewEmployeeEmail } = require('./emailService');

// Parse command line arguments
const employeeData = JSON.parse(process.argv[2] || '{}');

// Validate required data
if (!employeeData.email || !employeeData.firstName || !employeeData.lastName || !employeeData.role) {
  console.error('Missing required employee data. Required fields: email, firstName, lastName, role');
  process.exit(1);
}

console.log(`Sending email to new employee: ${employeeData.firstName} ${employeeData.lastName} (${employeeData.email})`);

// Queue email
queueNewEmployeeEmail(employeeData);

// Keep process running for a short time to allow email to be sent
setTimeout(() => {
  console.log('Email process completed.');
  process.exit(0);
}, 10000); // Allow 10 seconds for the email to be sent 