#!/bin/bash

# Script to run the attendance scheduler as a background process

# Navigate to the project root directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "../.venv" ]; then
    source ../.venv/bin/activate
fi

# Make sure we're using the correct Python
PYTHON=$(which python)
echo "Using Python: $PYTHON"

# Check if we should run in test mode
TEST_MODE=""
if [ "$1" == "--test" ]; then
    TEST_MODE="--test"
    echo "Running in TEST mode (more frequent updates)"
fi

# Create log directory if it doesn't exist
mkdir -p logs

# Run the attendance scheduler in the background
echo "Starting attendance scheduler in background mode..."
nohup $PYTHON manage.py attendance_scheduler $TEST_MODE > logs/attendance_scheduler.out 2>&1 &

# Save the process ID
echo $! > .attendance_scheduler.pid
echo "Attendance scheduler started with PID $(cat .attendance_scheduler.pid)"
echo "Check logs/attendance_scheduler.out for output"

# Instructions for stopping
echo ""
echo "To stop the scheduler, run:"
echo "kill \$(cat .attendance_scheduler.pid)"
echo "" 