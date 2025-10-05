import React, { useState } from 'react';
import { X, Wand2, MessageCircle, FileText, Award, Gift, Loader2, Copy, Check } from 'lucide-react';

const AIJobEnhancementModal = ({ isOpen, onClose, jobData, onApplyEnhancement, backendUrl }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEnhance = async (type) => {
    setLoading(true);
    setResult('');
    
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let requestData = '';
      
      switch (type) {
        case 'description':
          endpoint = '/ai/enhance-job-description';
          requestData = `Job Title: ${jobData.title || ''}
                        Company: ${jobData.company || ''}
                        Location: ${jobData.location || ''}
                        Current Description: ${jobData.description || ''}`;
          break;
        case 'requirements':
          endpoint = '/ai/suggest-job-requirements';
          requestData = `Job Title: ${jobData.title || ''}
                        Company: ${jobData.company || ''}
                        Location: ${jobData.location || ''}
                        Job Type: ${jobData.job_type || ''}
                        Description: ${jobData.description || ''}`;
          break;
        case 'benefits':
          endpoint = '/ai/suggest-job-benefits';
          requestData = `Job Title: ${jobData.title || ''}
                        Company: ${jobData.company || ''}
                        Location: ${jobData.location || ''}
                        Salary Range: ${jobData.salary_min || ''} - ${jobData.salary_max || ''}
                        Job Type: ${jobData.job_type || ''}`;
          break;
        case 'assistant':
          endpoint = '/ai/job-posting-assistant';
          requestData = question;
          break;
      }

      const response = await fetch(`${backendUrl}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: requestData })
      });

      if (!response.ok) throw new Error('AI enhancement failed');
      
      const data = await response.json();
      
      // Extract the result based on response type
      if (data.enhanced_description) {
        setResult(data.enhanced_description);
      } else if (data.suggested_requirements) {
        setResult(data.suggested_requirements);
      } else if (data.suggested_benefits) {
        setResult(data.suggested_benefits);
      } else if (data.assistant_response) {
        setResult(data.assistant_response);
      }
      
    } catch (error) {
      console.error('AI Enhancement Error:', error);
      setResult('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleApply = () => {
    if (result && activeTab !== 'assistant') {
      onApplyEnhancement(activeTab, result);
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'description', label: 'Enhance Description', icon: FileText },
    { id: 'requirements', label: 'Suggest Requirements', icon: Award },
    { id: 'benefits', label: 'Suggest Benefits', icon: Gift },
    { id: 'assistant', label: 'Ask AI Assistant', icon: MessageCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI Job Enhancement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult('');
                  setQuestion('');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Current Job Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Job Information:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Title:</strong> {jobData.title || 'Not specified'}</p>
              <p><strong>Company:</strong> {jobData.company || 'Not specified'}</p>
              <p><strong>Location:</strong> {jobData.location || 'Not specified'}</p>
              {activeTab === 'description' && jobData.description && (
                <p><strong>Current Description:</strong> {jobData.description.substring(0, 200)}...</p>
              )}
            </div>
          </div>

          {/* Assistant Tab - Question Input */}
          {activeTab === 'assistant' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask the AI Assistant anything about job posting:
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What's a competitive salary for this role? How should I write requirements for a senior position? What benefits are most attractive to healthcare professionals?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
          )}

          {/* Enhancement Button */}
          <div className="mb-6">
            <button
              onClick={() => handleEnhance(activeTab)}
              disabled={loading || (activeTab === 'assistant' && !question.trim())}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                loading || (activeTab === 'assistant' && !question.trim())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>
                    {activeTab === 'description' && 'Enhance Description'}
                    {activeTab === 'requirements' && 'Suggest Requirements'}
                    {activeTab === 'benefits' && 'Suggest Benefits'}
                    {activeTab === 'assistant' && 'Get AI Assistance'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">AI Generated Content:</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {result}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            💡 Tip: Review AI suggestions before applying them to your job posting
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {result && activeTab !== 'assistant' && (
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply to Job Posting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIJobEnhancementModal;