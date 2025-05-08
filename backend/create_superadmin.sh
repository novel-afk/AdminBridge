#!/bin/bash

# Create a temporary Python script
cat > temp_script.py << EOL
from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(email='superadmin@adminbridge.com').exists():
    User.objects.create_user(
        email='superadmin@adminbridge.com',
        password='Nepal@123',
        first_name='Super',
        last_name='Admin',
        role='SuperAdmin',
        is_staff=True,
        is_superuser=True
    )
    print('Superadmin user created successfully!')
else:
    user = User.objects.get(email='superadmin@adminbridge.com')
    user.set_password('Nepal@123')
    user.save()
    print('Superadmin password updated successfully!')
EOL

# Run the script using Django shell
python manage.py shell < temp_script.py

# Clean up
rm temp_script.py 