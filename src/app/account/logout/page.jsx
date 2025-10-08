import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { signOut } from '@auth/create/react';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ redirect: false });
      navigate('/account/signin');
    };
    handleLogout();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f1419'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          👋
        </div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#f7fafc',
          marginBottom: '0.5rem'
        }}>
          Logging out...
        </h1>
        <p style={{ color: '#a0aec0' }}>
          Please wait while we sign you out
        </p>
      </div>
    </div>
  );
}