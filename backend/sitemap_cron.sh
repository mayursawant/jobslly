#!/bin/bash
# Sitemap auto-update cron job
# Runs every hour to keep sitemap fresh

cd /app/backend
python3 update_sitemap.py >> /var/log/sitemap_cron.log 2>&1
echo "$(date): Sitemap updated" >> /var/log/sitemap_cron.log
