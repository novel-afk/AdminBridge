#!/bin/bash

# Load virtual environment
source venv/bin/activate

# Set script path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SCRIPT_PATH="$SCRIPT_DIR/scripts/daily_attendance_push.py"

# Ensure script is executable
chmod +x "$SCRIPT_PATH"

# Kill any existing processes
pkill -f "python.*daily_attendance_push.py" || true

# Define the log file
LOG_FILE="$SCRIPT_DIR/attendance_scheduler.log"

# Start the process
echo "$(date): Starting attendance scheduler" >> "$LOG_FILE"

# Run attendance push script immediately to ensure it works
python "$SCRIPT_PATH" >> "$LOG_FILE" 2>&1

# Set up cron job
(crontab -l 2>/dev/null | grep -v "daily_attendance_push.py" ; echo "15 15 * * * cd $SCRIPT_DIR && python $SCRIPT_PATH >> $LOG_FILE 2>&1") | crontab -

echo "Attendance scheduler has been started and cron job installed." 
echo "Script will run daily at 9:00 PM Nepal time (15:15 UTC)"
echo "Logs are being written to $LOG_FILE" 