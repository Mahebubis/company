import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Companies from './components/Companies';
import JobPosting from './components/JobPosting';
import PaidClient from './components/PaidClient';
import Requests from './components/Requests';
import Sidebar from './components/Sidebar';
import apiService from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('tpo_token');
      
      if (token) {
        try {
          const response = await apiService.validateSession();
          if (response.success) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            localStorage.removeItem('tpo_token');
            localStorage.removeItem('tpo_token_expiry');
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          localStorage.removeItem('tpo_token');
          localStorage.removeItem('tpo_token_expiry');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-sora">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar user={user} onLogout={handleLogout} />
                {/* <div className="flex-1 ml-64 overflow-y-auto"> */}
                <div className="flex-1 overflow-hidden">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/job-posting" element={<JobPosting />} />
                    <Route path="/paid-client" element={<PaidClient />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;