import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component to handle SEO redirects:
 * 1. WWW to non-WWW redirect (301 permanent)
 * 2. Trailing slash consistency
 * Excludes: root path (/), file extensions, and API routes
 */
const TrailingSlashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for www subdomain and redirect to non-www
    const hostname = window.location.hostname;
    if (hostname.startsWith('www.')) {
      const newHostname = hostname.substring(4); // Remove 'www.'
      const newUrl = `${window.location.protocol}//${newHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(newUrl); // 301-like behavior
      return;
    }

    // Handle trailing slash redirect
    const { pathname, search, hash } = location;
    
    // Skip if:
    // - Already has trailing slash
    // - Is root path
    // - Has file extension (e.g., .xml, .txt, .json)
    // - Is an API route
    if (
      pathname === '/' ||
      pathname.endsWith('/') ||
      pathname.includes('.') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    // Add trailing slash and redirect with 301 behavior
    const newPath = `${pathname}/${search}${hash}`;
    navigate(newPath, { replace: true });
  }, [location, navigate]);

  return null;
};

export default TrailingSlashRedirect;
