import os
import sys
import time
import logging
import importlib
from django.core.management.base import BaseCommand
from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('attendance_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import our daily push module
script_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'scripts')
sys.path.append(script_dir)
try:
    # First try to import as a direct module
    import daily_attendance_push
except ImportError:
    # If that fails, try to import from scripts package
    daily_attendance_push = importlib.import_module('scripts.daily_attendance_push')

class Command(BaseCommand):
    help = 'Runs the attendance scheduler to automatically push attendance data at 9 PM Nepal time'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test',
            action='store_true',
            help='Run in test mode with more frequent updates',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting attendance scheduler...'))
        
        scheduler = BackgroundScheduler()
        
        # Schedule main job to run at 9:00 PM Nepal time (UTC+5:45)
        scheduler.add_job(
            self.run_attendance_push,
            CronTrigger(hour=21, minute=0, timezone=pytz.timezone('Asia/Kathmandu')),
            id='attendance_push_job',
            name='Daily Attendance Push at 9 PM',
            replace_existing=True
        )
        
        # Add test job if in test mode
        if options['test']:
            self.stdout.write(self.style.WARNING('Running in TEST mode with additional hourly updates'))
            scheduler.add_job(
                self.run_attendance_push,
                'interval',
                minutes=60,
                id='attendance_push_test',
                name='Hourly Attendance Push (TEST)'
            )
        
        # Run once immediately to verify everything is working
        scheduler.add_job(
            self.run_attendance_push,
            'date',
            run_date=timezone.now() + timezone.timedelta(seconds=10),
            id='attendance_push_initial',
            name='Initial Attendance Push'
        )
        
        # Start the scheduler
        scheduler.start()
        self.stdout.write(self.style.SUCCESS('Scheduler started.'))
        self.stdout.write('Press Ctrl+C to exit')
        
        try:
            # Keep the command running
            while True:
                time.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            self.stdout.write(self.style.WARNING('Scheduler shutting down...'))
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS('Scheduler shut down successfully'))
    
    def run_attendance_push(self):
        """Run the attendance push job"""
        self.stdout.write(self.style.SUCCESS('Running scheduled attendance push'))
        try:
            # Call the main function from our script
            daily_attendance_push.main()
            self.stdout.write(self.style.SUCCESS('Attendance push completed successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error running attendance push: {str(e)}'))
            logger.error(f"Error running scheduled attendance push: {str(e)}") 