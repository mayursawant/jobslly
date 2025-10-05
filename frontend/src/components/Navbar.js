import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Separator } from './ui/separator';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">HealthCare Jobs</h1>
              <p className="text-xs text-gray-500">Find Your Calling</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link 
              to="/jobs" 
              className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              data-testid="nav-jobs"
            >
              Browse Jobs
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                    data-testid="nav-admin"
                  >
                    Admin
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.full_name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.full_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" data-testid="login-btn">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-primary" data-testid="register-btn">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            <Link to="/" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/jobs" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Browse Jobs
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="w-full justify-start p-0 h-auto font-medium text-gray-700"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="btn-primary w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;