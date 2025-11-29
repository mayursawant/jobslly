/**
 * Express server with meta tag injection middleware for SEO
 */
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Meta tag injection middleware
app.get('*', async (req, res, next) => {
  const requestPath = req.path;
  
  // Only inject for detail pages
  let metaData = null;
  
  try {
    // Job detail pages
    if (requestPath.startsWith('/jobs/') && requestPath !== '/jobs' && requestPath !== '/jobs/') {
      const slug = requestPath.replace('/jobs/', '').replace(/\/$/, '');
      
      try {
        const jobResponse = await axios.get(`${BACKEND_URL}/api/jobs/${slug}`, { timeout: 2000 });
        const job = jobResponse.data;
        
        metaData = {
          title: `${job.title} - ${job.company || 'Healthcare Jobs'} | Jobslly`,
          description: (job.description || '').substring(0, 160) + '...',
          keywords: `${job.title}, ${job.company || ''}, ${job.location || ''}, healthcare jobs`
        };
      } catch (err) {
        console.log(`Job not found: ${slug}`);
      }
    }
    
    // Blog detail pages
    else if (requestPath.startsWith('/blogs/') && requestPath !== '/blogs' && requestPath !== '/blogs/') {
      const slug = requestPath.replace('/blogs/', '').replace(/\/$/, '');
      
      try {
        const blogResponse = await axios.get(`${BACKEND_URL}/api/blog/${slug}`, { timeout: 2000 });
        const blog = blogResponse.data;
        
        metaData = {
          title: blog.seo_title || `${blog.title} | Jobslly Health Hub`,
          description: blog.seo_description || (blog.excerpt || '').substring(0, 160),
          keywords: (blog.seo_keywords || []).join(', ')
        };
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
      return res.status(500).send('Error loading page');
    }
    
    // Inject meta tags if we have data
    if (metaData) {
      // Replace title
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${metaData.title}</title>`
      );
      
      // Replace description
      html = html.replace(
        /<meta name="description" content=".*?" \/>/,
        `<meta name="description" content="${metaData.description}" />`
      );
      
      // Replace/add keywords
      if (metaData.keywords) {
        if (html.includes('name="keywords"')) {
          html = html.replace(
            /<meta name="keywords" content=".*?" \/>/,
            `<meta name="keywords" content="${metaData.keywords}" />`
          );
        } else {
          html = html.replace(
            '</head>',
            `  <meta name="keywords" content="${metaData.keywords}" />\n  </head>`
          );
        }
      }
      
      // Replace OG tags
      html = html.replace(
        /<meta property="og:title" content=".*?" \/>/,
        `<meta property="og:title" content="${metaData.title}" />`
      );
      
      html = html.replace(
        /<meta property="og:description" content=".*?" \/>/,
        `<meta property="og:description" content="${metaData.description}" />`
      );
    }
    
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`✓ Frontend server with SEO meta injection running on port ${PORT}`);
});
