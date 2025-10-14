/**
 * LeadCollectionModal Component
 * 
 * Purpose: Collect user information as leads before job applications
 * Features:
 * - Modal dialog for lead capture
 * - Form validation and submission
 * - Redirect to login/registration after lead collection
 * - Integration with job application flow
 * 
 * Usage: Triggered when unauthenticated users click "Apply Now"
 * Dependencies: Dialog components, form validation, API integration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadCollectionModal = ({ isOpen, onClose, jobId, jobTitle, jobExternalUrl, companyName, onSuccess }) => {
  // Lead form state
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    current_position: '',
    experience_years: '',
    message: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  /**
   * Validates the lead form data
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!leadData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!leadData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(leadData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!leadData.current_position.trim()) {
      newErrors.current_position = 'Current position is required';
    }
    
    if (!leadData.experience_years) {
      newErrors.experience_years = 'Experience level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form input changes
   * @param {string} field - Field name
   * @param {string} value - Field value
   */
  const handleInputChange = (field, value) => {
    setLeadData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Submits the lead data and redirects to registration
   */
  const handleSubmitLead = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Submit lead data to backend
      const response = await axios.post(`${API}/jobs/${jobId}/apply-lead`, leadData);
      
      // Save applied job ID to localStorage for session tracking
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!appliedJobs.includes(jobId)) {
        appliedJobs.push(jobId);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
      }
      
      // toast.success('Thank you for your interest!');
      
      // Close modal
      onClose();
      
      // Call success callback which will handle the flow based on job type
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback behavior if no callback provided
        if (jobExternalUrl) {
          setTimeout(() => {
            window.open(jobExternalUrl, '_blank');
          }, 1000);
        } else {
          navigate('/register', { 
            state: { 
              jobId, 
              jobTitle,
              leadData: leadData.email 
            } 
          });
        }
      }
      
    } catch (error) {
      console.error('Lead submission error:', error);
      const message = error.response?.data?.detail || 'Failed to submit. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles modal close and reset
   */
  const handleClose = () => {
    setLeadData({
      name: '',
      email: '',
      phone: '',
      current_position: '',
      experience_years: '',
      message: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold text-gray-800">
            <span className="mr-2">🚀</span>
            Show Your Interest
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Let us know you're interested in the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>. 
            We'll help you complete your application!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="lead-name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="lead-name"
              value={leadData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Dr. Jane Smith"
              className={`h-10 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              data-testid="lead-name-input"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="lead-email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="lead-email"
              type="email"
              value={leadData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="jane.smith@hospital.com"
              className={`h-10 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              data-testid="lead-email-input"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="lead-phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              value={leadData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="h-10 border-gray-200 focus:border-blue-500"
              data-testid="lead-phone-input"
            />
          </div>

          {/* Current Position Field */}
          <div className="space-y-2">
            <Label htmlFor="lead-position" className="text-sm font-medium text-gray-700">
              Current Position *
            </Label>
            <Input
              id="lead-position"
              value={leadData.current_position}
              onChange={(e) => handleInputChange('current_position', e.target.value)}
              placeholder="Registered Nurse, Emergency Medicine Physician, etc."
              className={`h-10 ${errors.current_position ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
              data-testid="lead-position-input"
            />
            {errors.current_position && (
              <p className="text-sm text-red-600">{errors.current_position}</p>
            )}
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="lead-experience" className="text-sm font-medium text-gray-700">
              Years of Experience *
            </Label>
            <Select 
              value={leadData.experience_years} 
              onValueChange={(value) => handleInputChange('experience_years', value)}
            >
              <SelectTrigger 
                className={`h-10 ${errors.experience_years ? 'border-red-300' : 'border-gray-200'}`}
                data-testid="lead-experience-select"
              >
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-1">0-1 years (New Graduate)</SelectItem>
                <SelectItem value="2-5">2-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="11-15">11-15 years</SelectItem>
                <SelectItem value="16+">16+ years (Senior/Expert)</SelectItem>
              </SelectContent>
            </Select>
            {errors.experience_years && (
              <p className="text-sm text-red-600">{errors.experience_years}</p>
            )}
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="lead-message" className="text-sm font-medium text-gray-700">
              Why are you interested? (Optional)
            </Label>
            <Textarea
              id="lead-message"
              value={leadData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell us what interests you about this position..."
              rows={3}
              className="border-gray-200 focus:border-blue-500 text-sm"
              data-testid="lead-message-input"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitLead}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="submit-lead-button"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">✨</span>
                Continue Application
              </div>
            )}
          </Button>
        </div>

        {/* Privacy Notice */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p>
            🔒 <strong>Privacy Protected:</strong> Your information is secure and will only be used to 
            connect you with relevant job opportunities. We never share your data with third parties 
            without your consent.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCollectionModal;