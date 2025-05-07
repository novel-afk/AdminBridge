import subprocess
import json
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def send_employee_credentials_email(user_data, employee_data=None):
    """
    Send email with login credentials to a newly created employee
    
    Args:
        user_data (dict): User data with email, first_name, last_name, and role
        employee_data (dict, optional): Additional employee data
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        email = user_data.get('email')
        login_url = 'https://yourwebsite.com/login'  # TODO: Replace with your actual login URL
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, '../../'))
        send_email_script = os.path.join(project_root, 'send_employee_email.js')

        # Log the email data and command
        logger.info(f"Sending employee credentials email to {email} using {send_email_script}")

        process = subprocess.run(
            ['node', send_email_script, email, login_url],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if process.stdout:
            logger.info(f"Email script stdout: {process.stdout}")
        if process.stderr:
            logger.warning(f"Email script stderr: {process.stderr}")

        if process.returncode != 0:
            logger.error(f"Email script exited with code {process.returncode}")
            return False

        logger.info(f"Successfully queued email to {email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False 