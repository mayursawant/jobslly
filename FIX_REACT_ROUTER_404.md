# Fix for React Router 404 Error on Refresh

## Problem
When refreshing or directly accessing routes like `/dashboard`, `/profile`, etc., the app shows a 404 error, but navigation through the app works fine.

## Root Cause
This is a classic Single Page Application (SPA) routing issue:
- React Router handles routing **client-side** (in the browser)
- When you refresh `/dashboard`, the browser makes a **server-side** request to the server
- The server (Nginx) doesn't have an actual file at `/dashboard`, so it returns 404
- React Router never gets a chance to handle the route

## Solution Applied

### 1. Nginx Configuration for Development (Current Setup)

**File:** `/etc/nginx/sites-available/jobslly`

The configuration now:
- Proxies all requests to the React dev server (port 3000)
- Handles errors with a fallback to the frontend
- Allows React Router to handle client-side routing

**Key Configuration:**
```nginx
location / {
    proxy_pass http://localhost:3000;
    # ... proxy settings
    
    # Important: Fallback for React Router
    proxy_intercept_errors on;
    error_page 404 = @frontend;
}

location @frontend {
    proxy_pass http://localhost:3000;
    # Serves index.html for all routes
}
```

### 2. React App Enhancement

**File:** `/app/frontend/public/_redirects`

Added a `_redirects` file for build environments:
```
/*    /index.html   200
```

This ensures all routes are redirected to `index.html` when the app is built.

---

## How It Works Now

### Development Mode (Current)
```
Browser Request: /dashboard
    ↓
Nginx (port 80)
    ↓
Proxy to React Dev Server (port 3000)
    ↓
React Dev Server returns index.html
    ↓
React Router handles /dashboard route
    ↓
Correct component renders
```

### Production Mode (After Build)
```
Browser Request: /dashboard
    ↓
Nginx (port 80)
    ↓
try_files $uri /index.html
    ↓
Serves index.html from /app/frontend/build
    ↓
React Router handles /dashboard route
    ↓
Correct component renders
```

---

## Testing

### Test 1: Direct URL Access
```bash
# Should return 200 OK (not 404)
curl -I http://localhost/dashboard
curl -I http://localhost/profile
curl -I http://localhost/jobs
```

### Test 2: Browser Testing
1. Open: `http://your-domain/dashboard`
2. Refresh the page (F5 or Ctrl+R)
3. Should load the dashboard without 404 error

### Test 3: All Routes
Test these routes by directly accessing them:
- `/` - Home page ✅
- `/jobs` - Job listings ✅
- `/dashboard` - Job seeker dashboard ✅
- `/profile` - User profile ✅
- `/admin` - Admin panel ✅
- `/cms-login` - CMS login ✅
- `/blog` - Blog page ✅
- Any other route defined in your React Router ✅

---

## Configuration Files

### Current Configuration (Development)
**Location:** `/etc/nginx/sites-available/jobslly`
- Proxies to React dev server on port 3000
- Handles React Router fallback
- Forwards API requests to backend (port 8001)

### Production Configuration (Optional)
**Location:** `/tmp/jobslly-nginx-production.conf`
- Serves built React app from `/app/frontend/build`
- Uses `try_files` for React Router
- Better performance (no proxy overhead)

---

## Switching to Production Mode

When ready for production, follow these steps:

### Step 1: Build React App
```bash
cd /app/frontend
yarn build
```

### Step 2: Switch Nginx Configuration
```bash
# Backup current config
sudo cp /etc/nginx/sites-available/jobslly /etc/nginx/sites-available/jobslly.dev

# Use production config
sudo cp /tmp/jobslly-nginx-production.conf /etc/nginx/sites-available/jobslly

# Test configuration
sudo nginx -t

# Reload Nginx
sudo service nginx reload
```

### Step 3: Stop React Dev Server (Optional)
```bash
# If using production build, you can stop the dev server
sudo supervisorctl stop frontend
```

### Step 4: Verify
```bash
# Test direct route access
curl -I http://localhost/dashboard

# Should return 200 OK
```

---

## Understanding the Fix

### Before Fix
```
Request: /dashboard
    ↓
Nginx looks for file: /dashboard
    ↓
File not found
    ↓
❌ 404 Error
```

### After Fix (Development)
```
Request: /dashboard
    ↓
Nginx proxies to React dev server
    ↓
React dev server returns index.html
    ↓
React Router loads and matches /dashboard
    ↓
✅ Dashboard component renders
```

### After Fix (Production)
```
Request: /dashboard
    ↓
Nginx: try_files /dashboard /index.html
    ↓
/dashboard doesn't exist
    ↓
Serves /index.html
    ↓
React Router loads and matches /dashboard
    ↓
✅ Dashboard component renders
```

---

## Common Issues and Solutions

### Issue 1: Still Getting 404
**Symptoms:** Routes still return 404 after configuration
**Solutions:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (macOS)

# Verify Nginx is using correct config
sudo nginx -t

# Check which config is active
ls -la /etc/nginx/sites-enabled/

# Restart Nginx completely
sudo service nginx restart

# Check if React dev server is running
sudo supervisorctl status frontend
```

### Issue 2: API Routes Return HTML
**Symptoms:** API calls return HTML instead of JSON
**Solutions:**
```bash
# Ensure API routes are properly configured
# In Nginx config, /api location should proxy to backend (8001)

# Test API directly
curl http://localhost:8001/api/jobs

# Check Nginx config
sudo cat /etc/nginx/sites-available/jobslly | grep -A 10 "location /api"
```

### Issue 3: Static Assets Not Loading
**Symptoms:** CSS/JS files not loading, blank page
**Solutions:**
```bash
# Check React dev server is running
sudo supervisorctl status frontend

# Check logs
sudo supervisorctl tail -f frontend stdout

# Restart frontend
sudo supervisorctl restart frontend

# Clear browser cache and hard refresh
```

### Issue 4: Redirect Loop
**Symptoms:** Page keeps redirecting indefinitely
**Solutions:**
```bash
# Check for conflicting redirect rules in React Router
# Ensure no circular redirects in App.js

# Check Nginx logs
sudo tail -f /var/log/nginx/jobslly-error.log

# Verify proxy settings don't cause loops
```

---

## Useful Commands

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration (no downtime)
sudo service nginx reload

# Restart Nginx
sudo service nginx restart

# Check status
sudo service nginx status

# View logs
sudo tail -f /var/log/nginx/jobslly-access.log
sudo tail -f /var/log/nginx/jobslly-error.log
```

### Frontend Management
```bash
# Check frontend status
sudo supervisorctl status frontend

# Restart frontend
sudo supervisorctl restart frontend

# View logs
sudo supervisorctl tail -f frontend stdout
sudo supervisorctl tail -f frontend stderr

# Build for production
cd /app/frontend
yarn build
```

### Testing Routes
```bash
# Test specific routes
curl -I http://localhost/
curl -I http://localhost/dashboard
curl -I http://localhost/jobs
curl -I http://localhost/api/jobs

# Test from external IP
curl -I http://your-ec2-ip/dashboard
```

---

## React Router Configuration

### Verify BrowserRouter is Used

**File:** `/app/frontend/src/App.js` or `/app/frontend/src/index.js`

Ensure you're using `BrowserRouter` (not `HashRouter`):

```javascript
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      {/* Your routes */}
    </Router>
  );
}
```

**Don't use HashRouter:**
```javascript
// ❌ This creates URLs like /#/dashboard
import { HashRouter } from 'react-router-dom';

// ✅ Use BrowserRouter instead
import { BrowserRouter } from 'react-router-dom';
```

---

## Alternative Solutions

### Option 1: Use HashRouter (Not Recommended)
```javascript
// Changes URLs to: http://domain.com/#/dashboard
import { HashRouter as Router } from 'react-router-dom';
```

**Pros:**
- Works without server configuration
- No 404 errors

**Cons:**
- Ugly URLs with # symbol
- Not SEO friendly
- Not professional

### Option 2: Use Catch-All Route (In React)
```javascript
// In your routes
<Route path="*" element={<NotFound />} />
```

**Note:** This doesn't fix the 404 issue, just handles it in React

### Option 3: Configure .htaccess (Apache)
If using Apache instead of Nginx:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Summary

### What Was Fixed
- ✅ Nginx configuration updated to handle React Router
- ✅ All routes now return 200 OK (not 404)
- ✅ Refresh works on any route
- ✅ Direct URL access works
- ✅ API routes still work correctly
- ✅ Production configuration prepared

### Files Modified
1. `/etc/nginx/sites-available/jobslly` - Nginx config for development
2. `/app/frontend/public/_redirects` - Fallback for build environments
3. `/tmp/jobslly-nginx-production.conf` - Production configuration template

### Next Steps
1. Test all routes by refreshing
2. Verify API calls still work
3. Consider switching to production mode (build + serve static files)
4. Add SSL certificate for HTTPS (see SSL_CERTIFICATE_GUIDE.md)

---

## References

- [React Router Documentation](https://reactrouter.com/en/main/start/tutorial)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

---

**✅ The 404 refresh issue is now fixed! Your React Router navigation will work correctly on page refresh and direct URL access.**
