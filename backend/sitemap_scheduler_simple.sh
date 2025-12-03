#!/bin/bash
# Simple sitemap scheduler - runs update every hour

echo "[$(date)] Starting sitemap scheduler..."

while true; do
    echo "[$(date)] Updating sitemap..."
    cd /app/backend
    python3 update_sitemap.py
    echo "[$(date)] Sitemap updated. Sleeping for 1 hour..."
    sleep 3600
done
