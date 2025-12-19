#!/bin/bash
# Setup cron job to auto-archive expired jobs daily at midnight

CRON_JOB="0 0 * * * cd /app/backend && /root/.venv/bin/python3 /app/backend/archive_expired_jobs.py >> /var/log/archive_expired_jobs.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "archive_expired_jobs.py"; then
    echo "✅ Cron job already exists"
else
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron job added successfully"
    echo "   Runs daily at midnight (00:00)"
fi

# Display current crontab
echo ""
echo "Current crontab:"
crontab -l | grep "archive_expired_jobs.py"
