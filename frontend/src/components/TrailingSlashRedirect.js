import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component to handle trailing slash redirects for SEO consistency
 * Redirects URLs without trailing slashes to versions with trailing slashes
 * Excludes: root path (/), file extensions, and query parameters
 */
const TrailingSlashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
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
