#!/usr/bin/env python
import os
import sys
import time
import logging
import importlib
from datetime import datetime, timedelta
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

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

# Import our daily push script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
daily_push_module = importlib.import_module('scripts.daily_attendance_push')

def run_attendance_push():
    """Run the attendance push job"""
    logger.info("Scheduled job: Running attendance push")
    try:
        # Call the main function in the daily_attendance_push module
        daily_push_module.main()
    except Exception as e:
        logger.error(f"Error running scheduled attendance push: {str(e)}")

def main():
    """
    Set up scheduler to run the attendance push job at 9:00 PM Nepal time every day.
    This is intended to be run as a daemon process.
    """
    logger.info("Starting attendance scheduler")
    
    scheduler = BackgroundScheduler()
    
    # Schedule the job to run at 9:00 PM Nepal time (UTC+5:45)
    scheduler.add_job(
        run_attendance_push,
        CronTrigger(hour=21, minute=0, timezone=pytz.timezone('Asia/Kathmandu')),
        id='attendance_push_job',
        name='Daily Attendance Push',
        replace_existing=True
    )
    
    # Also run every hour for testing (comment out in production)
    # scheduler.add_job(
    #     run_attendance_push,
    #     'interval',
    #     minutes=60,  # Run every hour for testing
    #     id='attendance_push_test',
    #     name='Hourly Attendance Push Test'
    # )
    
    # Add a one-time job that runs soon after startup (for testing)
    nepal_tz = pytz.timezone('Asia/Kathmandu')
    current_time = datetime.now(nepal_tz)
    run_time = current_time + timedelta(minutes=1)
    
    scheduler.add_job(
        run_attendance_push,
        'date',
        run_date=run_time,
        id='attendance_push_initial',
        name='Initial Attendance Push'
    )
    
    # Start the scheduler
    scheduler.start()
    logger.info("Scheduler started. Press Ctrl+C to exit.")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler shutting down...")
        scheduler.shutdown()
        logger.info("Scheduler shut down successfully")

if __name__ == "__main__":
    main() 