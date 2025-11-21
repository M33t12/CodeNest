// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, user, isLoading, error } = useUserStore();
    const [mode, setMode] = useState(searchParams.get('mode') || 'login');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
    }, [user, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'login') {
                console.log("Form Data in the Auth page", formData);
                await login(formData.email, formData.password);
            } else {
                console.log("Form Data in the Auth page", formData);
                await register(formData.firstName, formData.lastName, formData.email, formData.password);
            }
        } catch (err) {
            // Error handled by store
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>{mode === 'login' ? 'Signing In...' : 'Signing Up...'}</span>
                            </div>
                        ) : (
                            <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                        )}
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <button onClick={toggleMode} className="text-sm text-blue-600 hover:underline">
                        {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;