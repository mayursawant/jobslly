# Jobslly - Future of Healthcare Careers Platform

## 🏥 Overview

Jobslly is a comprehensive healthcare job platform that connects healthcare professionals (doctors, nurses, pharmacists, dentists, physiotherapists) with leading medical institutions. Built with modern technologies and AI-powered features, it provides an intelligent career matching system with advanced CMS capabilities.

## 🚀 Key Features

### For Job Seekers (Healthcare Professionals)
- **AI-Powered Job Matching**: Intelligent recommendations based on skills and preferences
- **Comprehensive Profile Management**: Skills, certifications, experience tracking
- **Application Tracking**: Monitor job applications and interview requests
- **Resume Analysis**: AI-powered resume optimization suggestions
- **Career Development**: Interview preparation and career guidance
- **Lead Collection**: Capture interest before job applications

### For Employers (Healthcare Organizations)
- **Advanced Job Posting**: Create detailed job listings with external redirect options
- **Candidate Management**: Review applications and shortlist candidates
- **Analytics Dashboard**: Track job performance and application metrics
- **Resume Database Access**: Search and filter candidate profiles
- **AI-Enhanced Descriptions**: Improve job postings with AI assistance

### Content Management System (CMS)
- **Blog Management**: Create, edit, and publish healthcare content
- **SEO Optimization**: Meta tags, structured data, and search optimization
- **Job Administration**: Admin-level job posting and approval workflow
- **Lead Management**: Track and manage job application leads
- **Analytics**: Comprehensive platform statistics and reporting

### AI-Powered Features
- **Chatbot**: 24/7 career assistance and lead generation
- **Resume Analysis**: Professional feedback and improvement suggestions
- **Job Description Enhancement**: AI-optimized job posting content
- **Interview Question Generation**: Role-specific interview preparation
- **Career Matching**: Intelligent job recommendations

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework for APIs
- **MongoDB**: NoSQL database for flexible data storage
- **Motor**: Async MongoDB driver for Python
- **Pydantic**: Data validation and settings management
- **JWT**: Secure authentication and authorization
- **Emergent LLM Integration**: AI capabilities via unified API

### Frontend
- **React 19**: Modern JavaScript library for user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality React component library
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing
- **React Helmet**: SEO meta tag management

## 📁 Project Structure

```
/app/
├── backend/                 # FastAPI backend application
│   ├── server.py           # Main application file with all API routes
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   ├── Home.js    # Homepage with search functionality
│   │   │   ├── JobSeekerLogin.js    # Job seeker authentication
│   │   │   ├── EmployerLogin.js     # Employer authentication
│   │   │   ├── JobSeekerDashboard.js # Professional dashboard
│   │   │   ├── Dashboard.js          # Main dashboard router
│   │   │   ├── JobListing.js        # Job search and filtering
│   │   │   ├── JobDetails.js        # Individual job pages
│   │   │   ├── Blog.js              # Blog listing page
│   │   │   ├── BlogPost.js          # Individual blog articles
│   │   │   ├── AdminPanel.js        # CMS administration
│   │   │   └── ChatBot.js           # AI assistant
│   │   ├── App.js         # Main application component
│   │   └── App.css        # Global styles and animations
│   ├── package.json       # Node.js dependencies
│   └── .env              # Frontend environment variables
├── tests/                 # Test files
└── README.md             # This documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB instance
- Emergent LLM API key (for AI features)

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Environment variables in .env
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="jobslly_db"
   EMERGENT_LLM_KEY="your_api_key_here"
   JWT_SECRET="your_jwt_secret"
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   yarn start  # Runs on port 3000
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Job Management
- `GET /api/jobs` - List jobs with filtering
- `GET /api/jobs/{job_id}` - Get job details
- `POST /api/jobs` - Create job (employers only)
- `POST /api/jobs/{job_id}/apply-lead` - Apply with lead collection

### User Profiles
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Dashboard Endpoints
- `GET /api/job-seeker/dashboard` - Job seeker statistics
- `GET /api/employer/dashboard` - Employer analytics

### AI Features
- `POST /api/ai/enhance-job-description` - Improve job posting
- `POST /api/ai/match-jobs` - Get job recommendations
- `POST /api/ai/analyze-resume` - Resume feedback
- `POST /api/chat` - Chatbot interaction

### Blog Management
- `GET /api/blog` - List published blog posts
- `GET /api/blog/{slug}` - Get blog post by slug
- `POST /api/admin/blog` - Create blog post (admin only)

### Admin CMS
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/jobs/pending` - Pending job approvals
- `POST /api/admin/seo` - Update SEO settings

## 🎨 User Roles & Permissions

### Job Seekers
- Browse and search job listings
- Create and manage professional profiles
- Apply to jobs and track applications
- Access AI-powered career tools

### Employers
- Post job listings (with admin approval)
- Review job applications and candidate profiles
- Access hiring analytics and metrics
- Use AI tools for job description enhancement

### Administrators
- Full CMS access for content management
- Job posting and approval workflow management
- Blog creation and publishing
- SEO settings and optimization

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify MongoDB is running
   - Check MONGO_URL in backend/.env

2. **API Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration (30 minutes default)

3. **AI Features Not Working**
   - Confirm EMERGENT_LLM_KEY is valid
   - Check emergentintegrations package installation

### Demo Accounts
- **Job Seeker**: test@nurse.com / password123
- **Employer**: hr@hospital.com / password123  
- **Admin**: admin@healthcare.com / admin123

## 📝 Development Scripts

```bash
# Frontend
yarn start          # Development server
yarn build          # Production build
yarn test           # Run tests

# Backend
pip install -r requirements.txt    # Install dependencies
python -m uvicorn server:app --reload  # Development server
```

---

**Built with ❤️ for the healthcare community**
