#!/usr/bin/env node

const { queueNewEmployeeEmail } = require('./emailService');

// Parse command line arguments
try {
  // Check if we have any arguments
  if (process.argv.length < 3) {
    console.error('Missing employee data argument');
    process.exit(1);
  }
  
  const employeeData = JSON.parse(process.argv[2] || '{}');

  // Validate required data
  if (!employeeData.email || !employeeData.firstName || !employeeData.lastName || !employeeData.role) {
    console.error('Missing required employee data. Required fields: email, firstName, lastName, role');
    console.error('Received:', JSON.stringify(employeeData));
    process.exit(1);
  }

  console.log(`Sending email to new employee: ${employeeData.firstName} ${employeeData.lastName} (${employeeData.email})`);
  console.log(`Employee role: ${employeeData.role}`);
  
  if (employeeData.branch) {
    console.log(`Branch: ${employeeData.branch}`);
  }

  // Queue email with a promise to handle completion
  queueNewEmployeeEmail(employeeData)
    .then(() => {
      console.log(`Email successfully queued for ${employeeData.email}`);
      // Exit after success
      setTimeout(() => {
        console.log('Email process completed.');
        process.exit(0);
      }, 5000); // Allow 5 seconds for the email to be sent
    })
    .catch(error => {
      console.error(`Error queuing email for ${employeeData.email}:`, error);
      // Exit with error
      process.exit(1);
    });

  // Keep process running for a short time to allow email to be sent
  setTimeout(() => {
    console.log('Email process timed out. Check logs for success or failure.');
    process.exit(0);
  }, 15000); // Allow 15 seconds as a safety timeout
} catch (error) {
  console.error('Error processing employee data:', error);
  process.exit(1);
} 