from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class Command(BaseCommand):
    help = 'Resets passwords for all users except SuperAdmin to a default value'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default='Nepal@123',
            help='Default password to set for users'
        )
        
        parser.add_argument(
            '--all',
            action='store_true',
            help='Reset passwords for all users including SuperAdmin'
        )

    def handle(self, *args, **options):
        default_password = options['password']
        reset_all = options['all']
        
        # Filter users
        if reset_all:
            users = User.objects.all()
            self.stdout.write('Resetting passwords for ALL users')
        else:
            users = User.objects.filter(~Q(role="SuperAdmin"))
            self.stdout.write('Resetting passwords for all non-SuperAdmin users')
        
        count = 0
        for user in users:
            user.set_password(default_password)
            user.save()
            count += 1
            self.stdout.write(f'Reset password for {user.email} ({user.role})')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully reset passwords for {count} users'))
        self.stdout.write(self.style.SUCCESS(f'Default password: {default_password}')) 