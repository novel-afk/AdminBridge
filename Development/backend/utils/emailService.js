const cron = require('node-cron');
const { sendNewEmployeeCredentials } = require('./emailNotifier');
const config = require('./emailConfig');

// Queue for storing pending email notifications
const emailQueue = [];
const emailSentHistory = new Set(); // Track already sent emails to avoid duplicates

// Process for any failed emails - retry based on configured interval
cron.schedule(`*/${config.RETRY_INTERVAL || 5} * * * *`, async () => {
  console.log('Running email queue processor...');
  
  if (emailQueue.length === 0) {
    console.log('No pending emails in queue.');
    return;
  }
  
  console.log(`Processing ${emailQueue.length} pending emails...`);
  
  // Process each email in the queue
  const emailsToRetry = [];
  
  for (const emailData of emailQueue) {
    try {
      // Skip if already successfully sent
      if (emailSentHistory.has(emailData.email)) {
        console.log(`Email to ${emailData.email} already sent successfully. Skipping.`);
        continue;
      }
      
      // Check retry count
      if (emailData.retryCount && emailData.retryCount > (config.MAX_RETRIES || 3)) {
        console.log(`Maximum retry count exceeded for ${emailData.email}. Removing from queue.`);
        continue;
      }
      
      await sendNewEmployeeCredentials(emailData);
      console.log(`Successfully sent email to ${emailData.email}`);
      
      // Mark as successfully sent
      emailSentHistory.add(emailData.email);
    } catch (error) {
      console.error(`Failed to send email to ${emailData.email}:`, error.message);
      // Increment retry count
      emailData.retryCount = (emailData.retryCount || 0) + 1;
      // If there's still an error, keep it in the queue for the next retry
      emailsToRetry.push(emailData);
    }
  }
  
  // Update the queue with emails that failed to send
  emailQueue.length = 0;
  emailQueue.push(...emailsToRetry);
  
  console.log(`Email queue processed. ${emailsToRetry.length} emails pending for retry.`);
});

/**
 * Queue a new employee email notification
 * @param {Object} employee - Employee data
 * @returns {Promise} - Promise that resolves when email is sent or queued
 */
const queueNewEmployeeEmail = (employee) => {
  return new Promise((resolve, reject) => {
    // Skip if already in queue or successfully sent
    if (emailSentHistory.has(employee.email)) {
      console.log(`Email to ${employee.email} already sent successfully. Skipping.`);
      return resolve(); // Resolve immediately, no need to send again
    }
    
    if (emailQueue.some(item => item.email === employee.email)) {
      console.log(`Email to ${employee.email} already in queue. Skipping.`);
      return resolve(); // Resolve immediately, already queued
    }
    
    // Validate the config before attempting to send
    if (!config.EMAIL_USER || config.EMAIL_USER === 'your.email@gmail.com' ||
        !config.EMAIL_PASSWORD || config.EMAIL_PASSWORD === 'your-app-password') {
      console.error('Email configuration not set! Update emailConfig.js with valid credentials.');
      return reject(new Error('Email configuration not set'));
    }
    
    // Attempt to send immediately
    sendNewEmployeeCredentials(employee)
      .then((info) => {
        console.log(`Email sent successfully to ${employee.email}`);
        emailSentHistory.add(employee.email);
        resolve(info);
      })
      .catch((error) => {
        console.error(`Failed to send email to ${employee.email}, adding to retry queue:`, error.message);
        // Add to queue for retry
        employee.retryCount = 1;
        emailQueue.push(employee);
        
        // Still resolve the promise since we've queued it for retry
        resolve();
      });
  });
};

// Export all functions
module.exports = {
  queueNewEmployeeEmail,
}; 