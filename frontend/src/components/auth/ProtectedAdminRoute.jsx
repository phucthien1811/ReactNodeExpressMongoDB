import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading state if auth is still initializing
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated or not admin
  if (!user || user.role !== 'admin') {
    console.log('Not admin, redirecting to login', { user });
    return <Navigate to="/login" replace />;
  }
  
  // Render admin content if authenticated and has admin role
  return children;
}