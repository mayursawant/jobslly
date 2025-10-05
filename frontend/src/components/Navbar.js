import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Jobslly
              </h1>
              <p className="text-xs text-gray-500 font-medium">Future of Healthcare Careers</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''} relative group`}
              data-testid="nav-home"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            <Link 
              to="/jobs" 
              className={`nav-link ${isActive('/jobs') ? 'active' : ''} relative group`}
              data-testid="nav-jobs"
            >
              <span className="relative z-10">Opportunities</span>
              <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            <Link 
              to="/blog" 
              className={`nav-link ${isActive('/blog') ? 'active' : ''} relative group`}
              data-testid="nav-blog"
            >
              <span className="relative z-10">Health Hub</span>
              <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''} relative group`}
                  data-testid="nav-dashboard"
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''} relative group`}
                    data-testid="nav-admin"
                  >
                    <span className="relative z-10 flex items-center">
                      CMS Admin
                      <Badge className="ml-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                        Admin
                      </Badge>
                    </span>
                    <div className="absolute inset-x-0 -bottom-2 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full group" data-testid="user-menu">
                      <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background ring-gradient-to-r ring-cyan-400 group-hover:ring-purple-600 transition-all">
                        <AvatarImage src="" alt={user?.full_name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold">
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse border-2 border-white"></div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass border-white/20" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.full_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="outline" className="w-fit text-xs">
                          {user?.role?.replace('_', ' ').toUpperCase()}
                        </Badge>
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
                  <Button variant="ghost" className="hover:bg-white/10" data-testid="login-btn">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" data-testid="register-btn">
                    Join the Future
                  </Button>
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
              className="hover:bg-white/10"
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
              Opportunities
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                    CMS Admin
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
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 w-full">Join the Future</Button>
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