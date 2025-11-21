// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Code, Brain, User, Shield, Home, ChevronDown, LogOut, Settings, Bell, Menu, X, Users,FileText
} from 'lucide-react';
import { useUserStore } from '../store/userStore.js';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserStore(); // Use your user store hooks
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // ... (existing useEffects for closing menus)

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'DSA Practice', path: '/dsa-practice', icon: Code },
    { name: 'AI Services', path: '/ai-module', icon: Brain },
    { name: 'About Us' , path : '/about-us' ,icon:Users  }
  ];

  const isAdmin = user?.role === 'admin';
  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Shield });
  }

  const handleSignOut = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    setIsProfileDropdownOpen(false);
    navigate(path);
    console.log(`Navigating to: ${path}`);
  };


  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            CodeNest
          </Link>
          
          <div className="hidden lg:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  } ${item.name === 'Admin' ? 'border border-purple-200 bg-purple-50 hover:bg-purple-100' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {item.name === 'Admin' && (
                    <Shield size={14} className="text-purple-600" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0) + user?.lastName?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block">
                      {user?.firstName || 'User'}
                    </span>
                    {isAdmin && (
                      <Shield size={14} className="text-purple-600" />
                    )}
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                        {isAdmin && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Shield size={12} className="mr-1" />
                              Administrator
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Account Settings</span>
                      </button>

                      <button
                          onClick={() => handleNavigation('/my-resources')}
                          className="text-gray-700 flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover-elevate transition-colors"
                          data-testid="button-my-resources"
                      >
                      <FileText size={16} />
                      <span>My Resources</span>
                    </button>
                    
                    <div className="border-t border-border my-1"></div>

                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              navigate('/admin');
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Shield size={16} />
                            <span>Admin Dashboard</span>
                          </button>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link to="/auth?mode=login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Sign In
                  </button>
                </Link>
                
                <Link to="/auth?mode=register">
                  <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-2 pt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  } ${item.name === 'Admin' ? 'border border-purple-200 bg-purple-50' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {item.name === 'Admin' && (
                    <Shield size={14} className="text-purple-600" />
                  )}
                </Link>
              );
            })}

            {!user && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/auth?mode=login">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors text-left">
                    Sign In
                  </button>
                </Link>
                <Link to="/auth?mode=register">
                  <button className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.firstName?.charAt(0) + user?.lastName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    {isAdmin && (
                      <div className="text-xs text-purple-600 font-medium">Administrator</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;