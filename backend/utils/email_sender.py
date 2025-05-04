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
        # Create the email data object
        email_data = {
            'email': user_data.get('email'),
            'firstName': user_data.get('first_name'),
            'lastName': user_data.get('last_name'),
            'role': user_data.get('role')
        }
        
        # Add branch information if available
        if employee_data and 'branch' in employee_data:
            from api.models import Branch
            try:
                branch = Branch.objects.get(id=employee_data.get('branch'))
                email_data['branch'] = branch.name
            except Branch.DoesNotExist:
                logger.warning(f"Branch with ID {employee_data.get('branch')} not found")
        
        # Convert the data to JSON string
        email_json = json.dumps(email_data)
        
        # Get the path to the Node.js script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        send_email_script = os.path.join(script_dir, 'sendEmail.js')
        
        # Make sure the script is executable
        os.chmod(send_email_script, 0o755)
        
        # Call the Node.js script
        logger.info(f"Sending email to {email_data['email']} with role {email_data['role']}")
        subprocess.Popen(
            ['node', send_email_script, email_json],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False 