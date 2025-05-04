const cron = require('node-cron');
const { sendNewEmployeeCredentials } = require('./emailNotifier');

// Queue for storing pending email notifications
const emailQueue = [];

// Process for any failed emails - retry every 5 minutes
cron.schedule('*/5 * * * *', async () => {
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
      await sendNewEmployeeCredentials(emailData);
      console.log(`Successfully sent email to ${emailData.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${emailData.email}:`, error.message);
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
 */
const queueNewEmployeeEmail = (employee) => {
  // Attempt to send immediately
  sendNewEmployeeCredentials(employee)
    .then(() => {
      console.log(`Email sent successfully to ${employee.email}`);
    })
    .catch((error) => {
      console.error(`Failed to send email to ${employee.email}, adding to retry queue:`, error.message);
      // Add to queue for retry
      emailQueue.push(employee);
    });
};

module.exports = {
  queueNewEmployeeEmail,
}; 