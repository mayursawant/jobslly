/**
 * JobSeekerDashboard Component
 * 
 * Purpose: Comprehensive dashboard for healthcare professionals seeking jobs
 * Features:
 * - Job application tracking and status updates
 * - Profile completion progress and editing
 * - Resume upload and management
 * - Personalized job recommendations
 * - Application statistics and analytics
 * 
 * Usage: Displayed when job seeker logs in via /dashboard route
 * Dependencies: AuthContext, axios for API calls, various UI components
 */

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  User, 
  Briefcase, 
  Target, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Users,
  Building
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobSeekerDashboard = () => {
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    applications_count: 0,
    leads_count: 0,
    profile_completion: 0,
    recent_applications: [],
    recent_leads: []
  });
  
  // Profile data state
  const [profile, setProfile] = useState({
    country_code: '+91', // Default to India
    phone: '',
    address: '',
    specialization: '',
    custom_specialization: '',
    experience_years: 0,
    education: [],
    skills: [],
    certifications: [],
    linkedin_url: '',
    portfolio_url: '',
    preferred_job_type: [],
    preferred_locations: [],
    salary_expectation_min: '',
    salary_expectation_max: ''
  });

  // Comprehensive Country codes list
  const countryCodes = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', country: 'Albania', flag: '🇦🇱' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+1', country: 'American Samoa', flag: '🇦🇸' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩' },
    { code: '+244', country: 'Angola', flag: '🇦🇴' },
    { code: '+1', country: 'Anguilla', flag: '🇦🇮' },
    { code: '+1', country: 'Antigua and Barbuda', flag: '🇦🇬' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+374', country: 'Armenia', flag: '🇦🇲' },
    { code: '+297', country: 'Aruba', flag: '🇦🇼' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+1', country: 'Bahamas', flag: '🇧🇸' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+1', country: 'Barbados', flag: '🇧🇧' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+501', country: 'Belize', flag: '🇧🇿' },
    { code: '+229', country: 'Benin', flag: '🇧🇯' },
    { code: '+1', country: 'Bermuda', flag: '🇧🇲' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
    { code: '+387', country: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+1', country: 'British Virgin Islands', flag: '🇻🇬' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+257', country: 'Burundi', flag: '🇧🇮' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+238', country: 'Cape Verde', flag: '🇨🇻' },
    { code: '+1', country: 'Cayman Islands', flag: '🇰🇾' },
    { code: '+236', country: 'Central African Republic', flag: '🇨🇫' },
    { code: '+235', country: 'Chad', flag: '🇹🇩' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+269', country: 'Comoros', flag: '🇰🇲' },
    { code: '+242', country: 'Congo', flag: '🇨🇬' },
    { code: '+243', country: 'Congo (DRC)', flag: '🇨🇩' },
    { code: '+682', country: 'Cook Islands', flag: '🇨🇰' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
    { code: '+1', country: 'Dominica', flag: '🇩🇲' },
    { code: '+1', country: 'Dominican Republic', flag: '🇩🇴' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
    { code: '+240', country: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+291', country: 'Eritrea', flag: '🇪🇷' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+679', country: 'Fiji', flag: '🇫🇯' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
    { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦' },
    { code: '+220', country: 'Gambia', flag: '🇬🇲' },
    { code: '+995', country: 'Georgia', flag: '🇬🇪' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+350', country: 'Gibraltar', flag: '🇬🇮' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+299', country: 'Greenland', flag: '🇬🇱' },
    { code: '+1', country: 'Grenada', flag: '🇬🇩' },
    { code: '+590', country: 'Guadeloupe', flag: '🇬🇵' },
    { code: '+1', country: 'Guam', flag: '🇬🇺' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
    { code: '+224', country: 'Guinea', flag: '🇬🇳' },
    { code: '+245', country: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+592', country: 'Guyana', flag: '🇬🇾' },
    { code: '+509', country: 'Haiti', flag: '🇭🇹' },
    { code: '+504', country: 'Honduras', flag: '🇭🇳' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+1', country: 'Jamaica', flag: '🇯🇲' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+686', country: 'Kiribati', flag: '🇰🇮' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+856', country: 'Laos', flag: '🇱🇦' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
    { code: '+231', country: 'Liberia', flag: '🇱🇷' },
    { code: '+218', country: 'Libya', flag: '🇱🇾' },
    { code: '+423', country: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
    { code: '+853', country: 'Macau', flag: '🇲🇴' },
    { code: '+389', country: 'Macedonia', flag: '🇲🇰' },
    { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
    { code: '+265', country: 'Malawi', flag: '🇲🇼' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻' },
    { code: '+223', country: 'Mali', flag: '🇲🇱' },
    { code: '+356', country: 'Malta', flag: '🇲🇹' },
    { code: '+692', country: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+596', country: 'Martinique', flag: '🇲🇶' },
    { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
    { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+691', country: 'Micronesia', flag: '🇫🇲' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
    { code: '+1', country: 'Montserrat', flag: '🇲🇸' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+264', country: 'Namibia', flag: '🇳🇦' },
    { code: '+674', country: 'Nauru', flag: '🇳🇷' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
    { code: '+227', country: 'Niger', flag: '🇳🇪' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+683', country: 'Niue', flag: '🇳🇺' },
    { code: '+850', country: 'North Korea', flag: '🇰🇵' },
    { code: '+1', country: 'Northern Mariana Islands', flag: '🇲🇵' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+680', country: 'Palau', flag: '🇵🇼' },
    { code: '+507', country: 'Panama', flag: '🇵🇦' },
    { code: '+675', country: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+1', country: 'Puerto Rico', flag: '🇵🇷' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+262', country: 'Réunion', flag: '🇷🇪' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
    { code: '+1', country: 'Saint Kitts and Nevis', flag: '🇰🇳' },
    { code: '+1', country: 'Saint Lucia', flag: '🇱🇨' },
    { code: '+1', country: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
    { code: '+685', country: 'Samoa', flag: '🇼🇸' },
    { code: '+378', country: 'San Marino', flag: '🇸🇲' },
    { code: '+239', country: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+221', country: 'Senegal', flag: '🇸🇳' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸' },
    { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
    { code: '+232', country: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+677', country: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+252', country: 'Somalia', flag: '🇸🇴' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+249', country: 'Sudan', flag: '🇸🇩' },
    { code: '+597', country: 'Suriname', flag: '🇸🇷' },
    { code: '+268', country: 'Swaziland', flag: '🇸🇿' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+963', country: 'Syria', flag: '🇸🇾' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+670', country: 'Timor-Leste', flag: '🇹🇱' },
    { code: '+228', country: 'Togo', flag: '🇹🇬' },
    { code: '+690', country: 'Tokelau', flag: '🇹🇰' },
    { code: '+676', country: 'Tonga', flag: '🇹🇴' },
    { code: '+1', country: 'Trinidad and Tobago', flag: '🇹🇹' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+1', country: 'Turks and Caicos Islands', flag: '🇹🇨' },
    { code: '+688', country: 'Tuvalu', flag: '🇹🇻' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+678', country: 'Vanuatu', flag: '🇻🇺' },
    { code: '+39', country: 'Vatican City', flag: '🇻🇦' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+1', country: 'Virgin Islands (US)', flag: '🇻🇮' },
    { code: '+681', country: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' }
  ];

  // Recommended jobs state removed as per user request
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);

  /**
   * Switch to Edit Profile tab
   */
  const switchToProfileTab = () => {
    const profileTab = document.querySelector('[data-testid="tab-profile"]');
    if (profileTab) {
      profileTab.click();
    }
  };

  /**
   * Fetch dashboard data on component mount
   */
  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
  }, []);

  /**
   * Fetches job seeker dashboard statistics and recent activity
   */
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API}/job-seeker/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDashboardData(response.data || {
        applications_count: 0,
        leads_count: 0,
        profile_completion: 0,
        recent_applications: [],
        recent_leads: []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to load dashboard data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches user profile data
   */
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }
      
      const response = await axios.get(`${API}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setProfile(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Don't show error toast for profile fetch as it might not exist yet
    }
  };

  /**
   * Recommended jobs functionality removed as per user request
   */

  /**
   * Updates user profile information
   */
  const updateProfile = async () => {
    setSaving(true);
    try {
      // Validate required fields
      const errors = [];
      
      if (!profile.phone) errors.push('Phone number is required');
      if (!profile.specialization) errors.push('Healthcare specialization is required');
      if (profile.specialization === 'other' && !profile.custom_specialization) {
        errors.push('Please specify your specialization');
      }
      if (profile.experience_years < 0) errors.push('Years of experience must be 0 or greater');
      
      if (errors.length > 0) {
        toast.error(`Please fix the following: ${errors.join(', ')}`);
        return;
      }

      // Prepare profile data
      const profileData = {
        ...profile,
        // Combine country code with phone number for storage
        full_phone: `${profile.country_code} ${profile.phone}`,
        // Use custom specialization if "other" is selected
        final_specialization: profile.specialization === 'other' ? profile.custom_specialization : profile.specialization
      };

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.put(`${API}/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state with response
      if (response.data) {
        setProfile(response.data);
      }
      
      toast.success('Profile updated successfully! 🎉');
      
      // Refresh dashboard data to update completion percentage
      fetchDashboardData();
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Calculate profile completion percentage
   */
  const calculateProfileCompletion = () => {
    const requiredFields = [
      profile.phone,
      profile.specialization,
      profile.experience_years >= 0,
      profile.address,
      profile.skills?.length > 0
    ];
    
    const completedFields = requiredFields.filter(field => field).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  /**
   * Adds a new skill to the profile
   */
  const addSkill = (skill) => {
    if (skill.trim() && !profile.skills.includes(skill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  /**
   * Removes a skill from the profile
   */
  const removeSkill = (skillIndex) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, index) => index !== skillIndex)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Modern Welcome Header */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            {/* Floating Animation Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full opacity-30 animate-bounce"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.full_name || user?.email?.split('@')[0]}! 
                  <span className="wave inline-block ml-2">👋</span>
                </h1>
                <p className="text-teal-100 text-lg">
                  Your healthcare career journey continues here
                </p>
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Progress Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Smart Matching</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-teal-200" />
                    <span className="text-teal-100 text-sm">Career Growth</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics cards removed as per user request */}

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Edit Profile</TabsTrigger>
            {/* Applications and Recommendations tabs removed as per user request */}
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Strength Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
                    Profile Strength
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="rgb(229 231 235)" strokeWidth="8" fill="none" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="rgb(20 184 166)" 
                            strokeWidth="8" 
                            fill="none"
                            strokeDasharray={`${2.51 * dashboardData.profile_completion} 251`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-teal-600">{dashboardData.profile_completion}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Professional Profile</p>
                    </div>
                    
                    {dashboardData.profile_completion < 100 && (
                      <div className="bg-white p-4 rounded-lg border border-teal-100">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Boost your visibility</p>
                            <p className="text-xs text-gray-600 mb-2">Complete your profile for better job matches</p>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={switchToProfileTab}>
                              Complete Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/jobs">
                      <Button className="w-full justify-between bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white group">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2" />
                          Browse Jobs
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-purple-200 hover:bg-purple-50 group"
                      onClick={switchToProfileTab}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-purple-600" />
                        Update Profile
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-purple-600" />
                    </Button>
                    {/* View Matches button removed as recommendations tab was removed */}
                  </div>
                </CardContent>
              </Card>

              {/* Career Insights Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Career Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Demand</span>
                      <Badge className="bg-green-100 text-green-700">High</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Profile Ranking</span>
                      <Badge className="bg-blue-100 text-blue-700">Top 15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <Badge className="bg-purple-100 text-purple-700">85%</Badge>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-blue-100 mt-4">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-blue-700">Pro Tip</p>
                          <p className="text-xs text-blue-600">Healthcare professionals with complete profiles get 3x more interviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                    Recent Activity
                  </div>
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recent_applications.length > 0 || dashboardData.recent_leads.length > 0 ? (
                  <div className="space-y-3">
                    {[...dashboardData.recent_applications, ...dashboardData.recent_leads].slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-teal-50 hover:to-emerald-50 transition-all duration-200 border border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Applied to Healthcare Position</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            Submitted
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to start your journey?</h3>
                    <p className="text-gray-600 mb-6">Begin applying to healthcare positions and track your progress here</p>
                    <Link to="/jobs">
                      <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white">
                        Explore Healthcare Jobs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Editing Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass border-blue-200" data-testid="profile-edit-form">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <span className="mr-2">👤</span>
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex space-x-2">
                      <Select value={profile.country_code || '+91'} onValueChange={(value) => setProfile(prev => ({...prev, country_code: value}))}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center space-x-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        className="flex-1"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({...prev, phone: e.target.value}))}
                        placeholder="123-456-7890"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Healthcare Specialization</Label>
                    <Select 
                      value={profile.specialization || ''} 
                      onValueChange={(value) => setProfile(prev => ({
                        ...prev, 
                        specialization: value,
                        custom_specialization: value !== 'other' ? '' : prev.custom_specialization
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctors">Doctor/Physician</SelectItem>
                        <SelectItem value="nurses">Nurse</SelectItem>
                        <SelectItem value="pharmacists">Pharmacist</SelectItem>
                        <SelectItem value="dentists">Dentist</SelectItem>
                        <SelectItem value="physiotherapists">Physiotherapist</SelectItem>
                        <SelectItem value="other">Other (Please specify)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {profile.specialization === 'other' && (
                      <Input
                        value={profile.custom_specialization || ''}
                        onChange={(e) => setProfile(prev => ({...prev, custom_specialization: e.target.value}))}
                        placeholder="Please specify your specialization"
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={profile.experience_years || 0}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setProfile(prev => ({...prev, experience_years: value}));
                      }}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile(prev => ({...prev, linkedin_url: e.target.value}))}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Location/Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile(prev => ({...prev, address: e.target.value}))}
                    placeholder="City, State, Country"
                    rows={2}
                  />
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <Label>Professional Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., Patient Care, Surgery, Radiology)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Add a skill"]');
                        addSkill(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={updateProfile} 
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white disabled:opacity-50"
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab content removed as per user request */}

          {/* Recommendations Tab content removed as per user request */}
        </Tabs>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;