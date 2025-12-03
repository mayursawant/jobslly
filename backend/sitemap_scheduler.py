#!/usr/bin/env python3
"""
Sitemap Auto-Update Scheduler
Runs continuously and updates sitemap every hour
"""
import time
import subprocess
from datetime import datetime

def update_sitemap():
    """Run sitemap update script"""
    try:
        print(f"[{datetime.now()}] Starting sitemap update...")
        result = subprocess.run(
            ['python3', '/app/backend/update_sitemap.py'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print(f"[{datetime.now()}] ✓ Sitemap updated successfully")
            print(result.stdout)
        else:
            print(f"[{datetime.now()}] ❌ Sitemap update failed")
            print(result.stderr)
    except Exception as e:
        print(f"[{datetime.now()}] ❌ Error updating sitemap: {e}")

if __name__ == "__main__":
    print(f"[{datetime.now()}] Starting sitemap scheduler...", flush=True)
    print("Will update sitemap every hour", flush=True)
    
    # Update immediately on start
    update_sitemap()
    
    while True:
        try:
            # Wait 1 hour (3600 seconds)
            print(f"[{datetime.now()}] Sleeping for 1 hour...", flush=True)
            time.sleep(3600)
            
            # Then update again
            update_sitemap()
        except KeyboardInterrupt:
            print(f"\n[{datetime.now()}] Sitemap scheduler stopped")
            break
        except Exception as e:
            print(f"[{datetime.now()}] ❌ Scheduler error: {e}")
            # Wait 5 minutes before retrying on error
            time.sleep(300)
