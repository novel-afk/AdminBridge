# Attendance Push System

The Attendance Push System automatically saves attendance data to the database at 9 PM Nepal time every day. This system ensures that all employee and student attendance records are properly tracked and persisted.

## Features

1. **Daily Automatic Push**: Records are automatically saved at 9 PM Nepal time
2. **Default Records**: Creates default 'Present' records for students/employees with no existing record for the day
3. **Time Tracking**: Sets default check-in (9:00 AM) and check-out (5:00 PM) times for new records
4. **Updates Existing Records**: Updates time-out field for existing records if missing

## Running the Scheduler

There are three ways to run the attendance push scheduler:

### 1. Using Django Management Command (Recommended)

```bash
# Run in normal mode - push at 9 PM Nepal time
python manage.py attendance_scheduler

# Run in test mode - push hourly and at 9 PM Nepal time
python manage.py attendance_scheduler --test
```

This command will start the scheduler as a foreground process. You can run it in a terminal screen session or use a process manager like Supervisor to keep it running.

### 2. Using the Standalone Scheduler Script

```bash
# Navigate to the project root and run:
python backend/scripts/schedule_attendance_push.py
```

### 3. Manual Push (For Testing)

To manually trigger an attendance push (for testing or to fix missing data):

```bash
# Navigate to the project root and run:
python backend/scripts/daily_attendance_push.py
```

## Running as a Service

For production environments, you should run the scheduler as a background service.

### Using Systemd (Linux)

1. Create a service file:

```bash
sudo nano /etc/systemd/system/attendance-push.service
```

2. Add the following content (update the paths to match your installation):

```
[Unit]
Description=AdminBridge Attendance Push Service
After=network.target

[Service]
User=your_username
Group=your_group
WorkingDirectory=/path/to/your/project
ExecStart=/path/to/your/python /path/to/your/project/manage.py attendance_scheduler
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable attendance-push
sudo systemctl start attendance-push
```

4. Check the status:

```bash
sudo systemctl status attendance-push
```

### Using Process Managers

You can also use process managers like Supervisor, PM2, or Docker to keep the service running.

## Logs

The attendance push system generates logs in the following files:

- `attendance_push.log`: Logs from the daily push script
- `attendance_scheduler.log`: Logs from the scheduler

Check these logs for any issues or to verify that the system is working correctly.

## Development Notes

- The attendance push happens at exactly 9 PM Nepal time (UTC+5:45)
- For any student or employee without an attendance record for the day, a default 'Present' record is created
- Default check-in time is set to 9:00 AM and check-out time to 5:00 PM
- Records are created with the first SuperAdmin user found in the system
- If a SuperAdmin doesn't exist, the push will fail and log an error 