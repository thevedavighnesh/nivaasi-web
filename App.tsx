import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './global.css';

// Import existing dashboard components
import OwnerDashboard from './src/app/owner/dashboard/page.jsx';
import TenantDashboard from './src/app/tenant/dashboard/page.jsx';
import SignInPage from './src/app/account/signin/page.jsx';
import SignUpPage from './src/app/account/signup/page.jsx';

// Create a query client
const queryClient = new QueryClient();

// Landing page component
function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f1419',
      color: '#f7fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#3b82f6' }}>
          🏢 Nivaasi
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#cbd5e0' }}>
          Complete Property Management System
        </p>
        <p style={{ marginBottom: '3rem', color: '#a0aec0' }}>
          Manage your properties, tenants, payments, and maintenance requests all in one place.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/account/signin" 
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Sign In
          </a>
          <a 
            href="/account/signup" 
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#2d3748',
              color: '#f7fafc',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '1px solid #4a5568',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4a5568'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2d3748'}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/account/signin" element={<SignInPage />} />
            <Route path="/account/signup" element={<SignUpPage />} />
            <Route path="*" element={<div style={{ 
              minHeight: '100vh', 
              backgroundColor: '#0f1419',
              color: '#f7fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>Page Not Found</div>} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
