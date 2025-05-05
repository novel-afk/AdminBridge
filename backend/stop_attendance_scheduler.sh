#!/bin/bash

# Script to stop the attendance scheduler process

# Navigate to the project root directory
cd "$(dirname "$0")"

# Check if the PID file exists
if [ -f .attendance_scheduler.pid ]; then
    PID=$(cat .attendance_scheduler.pid)
    
    # Check if the process is running
    if ps -p $PID > /dev/null; then
        echo "Stopping attendance scheduler process (PID: $PID)..."
        kill $PID
        
        # Wait for the process to terminate
        sleep 2
        
        # Check if it's still running and force kill if necessary
        if ps -p $PID > /dev/null; then
            echo "Process still running, forcing termination..."
            kill -9 $PID
        fi
        
        echo "Attendance scheduler stopped."
    else
        echo "Attendance scheduler is not running (PID: $PID)."
    fi
    
    # Remove the PID file
    rm .attendance_scheduler.pid
    echo "Removed PID file."
else
    echo "No attendance scheduler PID file found. Scheduler may not be running."
    
    # Try to find and kill the process by its command line
    PIDS=$(ps -ef | grep "attendance_scheduler" | grep -v grep | awk '{print $2}')
    
    if [ -n "$PIDS" ]; then
        echo "Found attendance scheduler processes by name: $PIDS"
        echo "Attempting to terminate them..."
        
        for P in $PIDS; do
            kill $P 2>/dev/null
            echo "Sent termination signal to PID $P"
        done
    else
        echo "No attendance scheduler processes found running."
    fi
fi

echo "Done." 