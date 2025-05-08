from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a superadmin user'

    def handle(self, *args, **kwargs):
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
            self.stdout.write(self.style.SUCCESS('Superadmin user created successfully!'))
        else:
            user = User.objects.get(email='superadmin@adminbridge.com')
            user.set_password('Nepal@123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Superadmin password updated successfully!')) 