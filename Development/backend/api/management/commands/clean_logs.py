from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import ActivityLog

class Command(BaseCommand):
    help = 'Clean activity logs older than 1 day'

    def handle(self, *args, **kwargs):
        # Calculate the cutoff date (1 day ago)
        cutoff_date = timezone.now() - timedelta(days=1)
        
        # Delete logs older than cutoff date
        deleted_count = ActivityLog.objects.filter(created_at__lt=cutoff_date).delete()[0]
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted_count} old activity logs')
        )
