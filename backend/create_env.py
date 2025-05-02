#!/usr/bin/env python
"""
Script to create a .env file for the Django project.
"""

import os

env_content = """# Django settings
DEBUG=True
SECRET_KEY=django-insecure-!&*sm_33vku*lfh(j4p9sgls-3q*)9*=x441ow#wx=d9d5nq+x
ALLOWED_HOSTS=localhost,127.0.0.1,railway.app

# Database settings for Railway
DATABASE_URL=postgresql://postgres:xBSeueCXFXnKhVsDvRRRCZReSvPWJknU@railway:5432/railway

# CORS settings
CORS_ALLOW_ALL_ORIGINS=True
"""

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Create the .env file
env_file_path = os.path.join(current_dir, '.env')

with open(env_file_path, 'w') as env_file:
    env_file.write(env_content)

print(f".env file created at {env_file_path}")
print("Content:")
print(env_content) 