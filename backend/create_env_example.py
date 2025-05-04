#!/usr/bin/env python
import os
import sys

"""
This script creates a .env example file with default settings for AdminBridge.
"""

ENV_FILE = '.env.example'

env_content = """# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-default-key-change-me

# Database Settings
DB_NAME=adminbridge
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_HOST=localhost
DB_PORT=5432

# Email Settings
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
"""

def create_env_file():
    """Create the .env file with default settings"""
    try:
        with open(ENV_FILE, 'w') as f:
            f.write(env_content)
        print(f"Created {ENV_FILE} file with default settings")
        print("Please update the email settings with your own Gmail account details")
        print("For Gmail, you'll need to create an App Password: https://myaccount.google.com/apppasswords")
    except Exception as e:
        print(f"Error creating .env file: {e}")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(create_env_file()) 