# WWW to Non-WWW Redirect Implementation (Nginx)

## Overview
This document describes the Nginx-based implementation of 301 permanent redirects from www subdomain to non-www domain for SEO consistency and to prevent duplicate content issues.

## Why This Matters for SEO
- **Duplicate Content**: Search engines may treat `www.jobslly.com` and `jobslly.com` as separate sites
- **Link Equity Split**: Backlinks may be divided between both versions, diluting SEO value
- **Canonical URL**: Establishes a single, authoritative version of your domain
- **301 Redirect**: Passes ~90-99% of link equity to the canonical version

## Implementation Layers

### 1. **Nginx Server (Primary - RECOMMENDED)** ✅
**File**: `/etc/nginx/sites-available/jobslly`

**Implementation**:
```nginx
# WWW to Non-WWW Redirect (301 Permanent)
server {
    listen 80;
    listen [::]:80;
    
    # Match www subdomain explicitly
    server_name ~^www\.(.+)$;
    
    # 301 Permanent Redirect to non-www
    if ($host ~* ^www\.(.+)$) {
        return 301 $scheme://$1$request_uri;
    }
}

# Main server block for non-www
server {
    listen 80;
    listen [::]:80;
    
    server_name jobslly.com medical-careers-1.preview.emergentagent.com;
    
    # ... rest of configuration
}
```

**Benefits**:
- **Fastest**: Handled at web server level before reaching application
- **Most efficient**: No application processing needed
- **Industry standard**: Nginx designed for this purpose
- **True 301**: Proper HTTP status code recognized by all crawlers
- **Preserves everything**: Query params, paths, fragments maintained

**Testing**:
```bash
curl -I -H "Host: www.jobslly.com" http://localhost
# Returns: HTTP/1.1 301 Moved Permanently
# Location: http://jobslly.com/
```

### 2. Backend Middleware (FastAPI) ✅ (Backup Layer)
**File**: `/app/backend/server.py`

**Implementation**:
```python
class WWWRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to redirect www subdomain to non-www for SEO consistency.
    Returns 301 Permanent Redirect for all www requests.
    """
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        
        if host.startswith("www."):
            new_host = host[4:]  # Remove 'www.'
            new_url = f"{request.url.scheme}://{new_host}{request.url.path}"
            if request.url.query:
                new_url += f"?{request.url.query}"
            
            return RedirectResponse(url=new_url, status_code=301)
        
        response = await call_next(request)
        return response
```

**Benefits**:
- Server-side 301 redirect (proper HTTP status code)
- Handles all API requests
- Works at application level
- Preserves query parameters and paths

### 2. Frontend Component (React) ✅
**File**: `/app/frontend/src/components/TrailingSlashRedirect.js`

**Implementation**:
```javascript
useEffect(() => {
    // Check for www subdomain and redirect to non-www
    const hostname = window.location.hostname;
    if (hostname.startsWith('www.')) {
      const newHostname = hostname.substring(4);
      const newUrl = `${window.location.protocol}//${newHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(newUrl); // 301-like behavior
      return;
    }
}, []);
```

**Benefits**:
- Client-side fallback
- Handles direct frontend access
- Immediate redirect before React app loads

### 3. Static Redirects File ✅
**File**: `/app/frontend/public/_redirects`

**Content**:
```
# Redirect www to non-www with 301 (permanent redirect)
https://www.jobslly.com/* https://jobslly.com/:splat 301!
https://www.medical-careers-1.preview.emergentagent.com/* https://job-seo-overhaul.preview.emergentagent.com/:splat 301!

# Fallback for client-side routing (SPA)
/*    /index.html   200
```

**Benefits**:
- Works with many hosting platforms (Netlify, Vercel, etc.)
- Edge-level redirect (fastest)
- No server processing needed

## Testing

### Test WWW Redirect:
```bash
# Test with curl (backend)
curl -I -H "Host: www.jobslly.com" https://jobslly.com/api/jobs

# Expected response:
HTTP/1.1 301 Moved Permanently
Location: https://jobslly.com/api/jobs
```

### Test in Browser:
1. Visit: `https://www.jobslly.com`
2. Should automatically redirect to: `https://jobslly.com`
3. Check URL bar - should show non-www version
4. Check Network tab - should show 301 status

### Verify with SEO Tools:
- **Google Search Console**: Add only non-www version
- **Redirect Checker**: Use tools like redirect-checker.org
- **robots.txt**: Ensure sitemap URL uses non-www

## What's Covered

✅ **All Backend API Routes**: `/api/*`
✅ **All Frontend Pages**: Home, Jobs, Blogs, Contact, etc.
✅ **Query Parameters Preserved**: `?category=doctors` maintained
✅ **URL Paths Preserved**: `/jobs/doctor/` structure maintained
✅ **Hash Fragments Preserved**: `#section` maintained
✅ **HTTPS Protocol**: Maintains secure connection

## Configuration

### Update for Your Domain
When deploying to production (`jobslly.com`), ensure:

1. **robots.txt** uses non-www:
```
Sitemap: https://jobslly.com/sitemap.xml
```

2. **sitemap.xml** uses non-www:
```xml
<loc>https://jobslly.com/jobs/</loc>
```

3. **DNS Configuration**:
   - A record: `jobslly.com` → Your server IP
   - CNAME record: `www.jobslly.com` → `jobslly.com`

4. **SSL Certificate**: Covers both `jobslly.com` and `www.jobslly.com`

## Monitoring

### Check Redirect Status:
```bash
# Should return 301
curl -I https://www.jobslly.com

# Should return 200
curl -I https://jobslly.com
```

### Google Search Console:
- Only add non-www property
- Submit non-www sitemap
- Monitor crawl stats for www requests (should show 301s)

### Analytics Setup:
- Google Analytics: Use non-www domain
- Canonical tags: Point to non-www URLs

## Troubleshooting

### Issue: Both versions return 200
**Solution**: Check if middleware is added before other middleware
```python
# Must be first
app.add_middleware(WWWRedirectMiddleware)
# Then others
app.add_middleware(CORSMiddleware, ...)
```

### Issue: Redirect loop
**Solution**: Ensure www detection is correct
```python
if host.startswith("www."):  # Not "www" alone
```

### Issue: Query params lost
**Solution**: Already handled in implementation
```python
if request.url.query:
    new_url += f"?{request.url.query}"
```

## SEO Impact Timeline

- **Week 1-2**: Google starts recognizing redirects
- **Week 2-4**: Link equity begins consolidating
- **Month 1-3**: Full consolidation, improved rankings
- **Ongoing**: Single authoritative domain for all content

## Best Practices

1. ✅ **Choose One Version**: Consistently use non-www everywhere
2. ✅ **301 Redirects Only**: Never use 302 (temporary) redirects
3. ✅ **Update Internal Links**: Use non-www in all internal links
4. ✅ **Update External Links**: Request backlink updates to non-www
5. ✅ **Consistent Sitemaps**: All URLs in sitemap.xml use non-www
6. ✅ **Canonical Tags**: Point to non-www versions

## References

- [Google: Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [MDN: HTTP 301](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/301)
- [RFC 7231: 301 Moved Permanently](https://tools.ietf.org/html/rfc7231#section-6.4.2)
