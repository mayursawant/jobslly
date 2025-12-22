/**
 * Express server with meta tag injection middleware for SEO
 */
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://jobfix-complete.preview.emergentagent.com/api';

// Serve uploaded images from public/uploads (these are not part of the build)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve static files (JS, CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'build'), {
  index: false // Don't auto-serve index.html
}));

// Serve sitemap directly
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Meta tag injection middleware for ALL other routes
app.use(async (req, res) => {
  const requestPath = req.path;
  
  // Check if this is the homepage
  const isHomepage = requestPath === '/' || requestPath === '/index.html';
  
  let metaData = null;
  
  try {
    // Job detail pages
    if (requestPath.startsWith('/jobs/') && requestPath !== '/jobs' && requestPath !== '/jobs/') {
      const slug = requestPath.replace('/jobs/', '').replace(/\/$/, '');
      
      try {
        console.log(`Fetching job: ${slug}`);
        const jobResponse = await axios.get(`${BACKEND_URL}/jobs/${slug}`, { 
          timeout: 3000,
          headers: { 'Accept': 'application/json' }
        });
        const job = jobResponse.data;
        
        metaData = {
          title: escapeHtml(`${job.title} - ${job.company || 'Healthcare Jobs'} | Jobslly`),
          description: escapeHtml((job.description || '').substring(0, 160) + '...'),
          keywords: escapeHtml(`${job.title}, ${job.company || ''}, ${job.location || ''}, healthcare jobs, medical careers`),
          og_title: escapeHtml(job.title),
          og_description: escapeHtml((job.description || '').substring(0, 160))
        };
        console.log(`✓ Injected meta for job: ${job.title}`);
      } catch (err) {
        console.log(`Job not found: ${slug}`);
      }
    }
    
    // Blog detail pages (handle both /blog/ and /blogs/)
    else if ((requestPath.startsWith('/blog/') || requestPath.startsWith('/blogs/')) && 
             requestPath !== '/blog' && requestPath !== '/blog/' && 
             requestPath !== '/blogs' && requestPath !== '/blogs/') {
      const slug = requestPath.replace('/blogs/', '').replace('/blog/', '').replace(/\/$/, '');
      
      try {
        console.log(`Fetching blog: ${slug}`);
        const blogResponse = await axios.get(`${BACKEND_URL}/blog/${slug}`, { 
          timeout: 3000,
          headers: { 'Accept': 'application/json' }
        });
        const blog = blogResponse.data;
        
        metaData = {
          title: escapeHtml(blog.seo_title || `${blog.title} | Jobslly Health Hub`),
          description: escapeHtml(blog.seo_description || (blog.excerpt || '').substring(0, 160)),
          keywords: escapeHtml((blog.seo_keywords || []).join(', ')),
          og_title: escapeHtml(blog.title),
          og_description: escapeHtml(blog.excerpt || '')
        };
        console.log(`✓ Injected meta for blog: ${blog.title}`);
      } catch (err) {
        console.log(`Blog not found: ${slug}`);
      }
    }
  } catch (error) {
    console.error('Error fetching meta data:', error.message);
  }
  
  // Read index.html
  const indexPath = path.join(__dirname, 'build', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading page');
    }
    
    // Remove static homepage content from ALL non-homepage pages
    if (!isHomepage) {
      // Find the static content inside <div id="root"> and remove it
      const rootStart = html.indexOf('<div id="root">');
      const bodyEnd = html.indexOf('</body>');
      
      if (rootStart !== -1 && bodyEnd !== -1) {
        // Find the last </div> before </body> - this closes the root div
        const beforeBody = html.substring(0, bodyEnd);
        const lastDivClose = beforeBody.lastIndexOf('</div>');
        
        if (lastDivClose > rootStart) {
          // Keep everything before root div content and after root div close
          const beforeContent = html.substring(0, rootStart + '<div id="root">'.length);
          const afterContent = html.substring(lastDivClose);
          
          // Combine: before + empty root + after
          html = beforeContent + afterContent;
        }
      }
    }
    
    // Inject meta tags if we have data
    if (metaData) {
      // Replace title
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${metaData.title}</title>`
      );
      
      // Replace description (handle both /> and />)
      html = html.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${metaData.description}"/>`
      );
      
      // Replace/add keywords
      if (metaData.keywords) {
        if (html.includes('name="keywords"')) {
          html = html.replace(
            /<meta name="keywords" content="[^"]*"\s*\/?>/,
            `<meta name="keywords" content="${metaData.keywords}"/>`
          );
        } else {
          html = html.replace(
            '<meta name="viewport"',
            `<meta name="keywords" content="${metaData.keywords}"/><meta name="viewport"`
          );
        }
      }
      
      // Replace OG tags
      html = html.replace(
        /<meta property="og:title" content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${metaData.og_title}"/>`
      );
      
      html = html.replace(
        /<meta property="og:description" content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${metaData.og_description}"/>`
      );
      
      // Replace Twitter card tags
      html = html.replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${metaData.og_title}"/>`
      );
      
      html = html.replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${metaData.og_description}"/>`
      );
    }
    
    res.send(html);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Frontend server with SEO meta injection running on port ${PORT}`);
  console.log(`✓ Backend API: ${BACKEND_URL}`);
});
