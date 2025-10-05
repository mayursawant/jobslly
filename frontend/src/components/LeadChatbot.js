import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LeadChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState({});
  const [conversationMode, setConversationMode] = useState('lead'); // 'lead' or 'chat'
  const messagesEndRef = useRef(null);

  const welcomeMessages = [
    "Need help finding healthcare jobs? 🔍",
    "Looking for career guidance? 💼", 
    "Want to advance your healthcare career? 🚀"
  ];

  const quickReplies = [
    "Find jobs for doctors",
    "Nurse opportunities", 
    "Pharmacist positions",
    "Career advice",
    "Salary guidance"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hi there! 👋 I'm your healthcare career assistant. How can I help you today?");
      }, 800);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (message) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: message, 
        type: 'bot', 
        timestamp: new Date() 
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { 
      text: message, 
      type: 'user', 
      timestamp: new Date() 
    }]);
  };

  const getAIResponse = async (userMessage) => {
    try {
      // Call the AI assistant endpoint
      const response = await axios.post(`${API}/ai/job-posting-assistant`, {
        question: `User says: "${userMessage}". Respond as a helpful healthcare career chatbot with short, friendly answers (max 2 sentences). Focus on job search, career advice, or healthcare opportunities.`
      });
      
      return response.data.answer || "I'm here to help with healthcare career questions! Ask me about jobs, career advice, or opportunities.";
    } catch (error) {
      console.error('AI response error:', error);
      return getDefaultResponse(userMessage);
    }
  };

  const getDefaultResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('job') || lowerMessage.includes('position')) {
      return "Great! We have 11K+ healthcare jobs available. What type of role are you looking for? 🏥";
    }
    if (lowerMessage.includes('doctor') || lowerMessage.includes('physician')) {
      return "Excellent! We have many doctor positions available. Would you like me to show you our latest openings? 👨‍⚕️";
    }
    if (lowerMessage.includes('nurse') || lowerMessage.includes('nursing')) {
      return "Perfect! Nursing is in high demand. We have great opportunities waiting for you! 👩‍⚕️";
    }
    if (lowerMessage.includes('pharmacist') || lowerMessage.includes('pharmacy')) {
      return "Awesome! Pharmacist roles are booming. Let me help you find the perfect match! 💊";
    }
    if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
      return "Healthcare salaries are competitive! It depends on your specialty and experience. What field are you in? 💰";
    }
    if (lowerMessage.includes('experience') || lowerMessage.includes('years')) {
      return "Experience is valuable! We have opportunities for all levels - from fresh graduates to seasoned professionals. 🎓";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm excited to help you with your healthcare career. What can I assist you with today? 😊";
    }
    
    return "That's interesting! I'm here to help with healthcare careers, job searches, and professional advice. What would you like to know? 🤔";
  };

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    addUserMessage(userMessage);
    setCurrentInput('');
    
    // Get AI response
    setIsTyping(true);
    try {
      const response = await getAIResponse(userMessage);
      setTimeout(() => {
        addBotMessage(response);
      }, 1000 + Math.random() * 800);
    } catch (error) {
      setTimeout(() => {
        addBotMessage("I'm having trouble connecting right now. Try asking about healthcare jobs, career advice, or opportunities! 🔄");
      }, 1000);
    }
  };

  const handleQuickReply = (reply) => {
    addUserMessage(reply);
    setTimeout(async () => {
      const response = await getAIResponse(reply);
      addBotMessage(response);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-full w-16 h-16 shadow-2xl animate-medical-pulse hover:scale-110 transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-90 animate-bounce">
          {welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-teal-100 w-80 h-96 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">🏥</span>
            </div>
            <div>
              <div className="font-semibold text-sm">Healthcare Assistant</div>
              <div className="text-xs text-teal-100">Online • Here to help</div>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-sm' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              } animate-slide-up`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm text-sm animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick options */}
          {currentStep < chatFlow.length && chatFlow[currentStep].options && (
            <div className="space-y-2">
              {chatFlow[currentStep].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(option)}
                  className="block w-full text-left px-3 py-2 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-200 border border-teal-200"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentStep < chatFlow.length && chatFlow[currentStep].expectsInput && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 h-10 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!currentInput.trim()}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-10 w-10 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Final CTA */}
        {currentStep >= chatFlow.length - 1 && (
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Button
              onClick={() => window.open('/jobs', '_blank')}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-10"
            >
              Browse Jobs Now 🔍
            </Button>
            <Button
              onClick={() => window.open('/register', '_blank')}
              variant="outline"
              className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 h-10"
            >
              Create Account 📝
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadChatbot;