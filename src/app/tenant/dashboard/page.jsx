import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
function TenantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [rentInfo, setRentInfo] = useState({ amount: 0, dueDate: null, status: 'pending' });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Get user from session
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/account/signin');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.userType !== 'tenant') {
      navigate('/owner/dashboard');
      return;
    }
    
    setUser(userData); // Set user state
    loadDashboardData(userData.email);
  }, [navigate]);

  const loadDashboardData = async (email) => {
    try {
      console.log('Loading tenant data for:', email);
      const response = await fetch(`/api/tenants/info?email=${email}`);
      const data = await response.json();
      
      console.log('Tenant info response:', data);

      if (data.property) {
        setPropertyInfo(data.property);
        setOwnerInfo(data.owner);
        
        // Ensure rent info has all required fields
        const rentData = {
          amount: data.rent?.amount || 0,
          dueDate: data.rent?.dueDate || null,
          status: data.rent?.status || 'pending',
          daysUntilDue: data.rent?.daysUntilDue || 0,
          lastPaymentDate: data.rent?.lastPaymentDate || null,
          rentDueDay: data.rent?.rentDueDay || 5
        };
        
        console.log('Setting rent info:', rentData);
        setRentInfo(rentData);
      } else {
        console.log('No property found for tenant');
        setPropertyInfo(null);
        setOwnerInfo(null);
        setRentInfo({ amount: 0, dueDate: null, status: 'pending', daysUntilDue: 0 });
      }

      // Load notifications
      const notifResponse = await fetch(`/api/notifications/tenant?tenantEmail=${email}`);
      const notifData = await notifResponse.json();
      if (notifData.notifications) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const loadPaymentHistory = async () => {
    if (!user?.email) {
      console.warn('Cannot load payment history: user email is not set');
      return;
    }
    
    console.log('📧 Loading payment history for email:', user.email);
    try {
      const response = await fetch(`/api/payments/history?tenantEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      console.log('Payment history response:', data);
      
      if (data.payments) {
        setPaymentHistory(data.payments);
        console.log('✅ Loaded', data.payments.length, 'payments');
      } else if (data.error) {
        console.error('Payment history error:', data.error);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleShowPaymentHistory = () => {
    console.log('Opening payment history modal');
    setShowPaymentHistory(true);
    loadPaymentHistory();
  };

  const loadMaintenanceRequests = async () => {
    if (!user?.email) {
      console.warn('Cannot load maintenance requests: user email is not set');
      return;
    }
    
    console.log('🔧 Loading maintenance requests for email:', user.email);
    try {
      const response = await fetch(`/api/maintenance/tenant?tenantEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      console.log('Maintenance requests response:', data);
      
      if (data.requests) {
        setMaintenanceRequests(data.requests);
        console.log('✅ Loaded', data.requests.length, 'maintenance requests');
      } else if (data.error) {
        console.error('Maintenance requests error:', data.error);
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  const handleShowMaintenance = () => {
    console.log('Opening maintenance modal');
    setShowMaintenance(true);
    loadMaintenanceRequests();
  };

  const loadDocuments = async () => {
    if (!user?.email) {
      console.warn('Cannot load documents: user email is not set');
      return;
    }
    
    console.log('📄 Loading documents for email:', user.email);
    try {
      const response = await fetch(`/api/documents/tenant?tenantEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      console.log('Documents response:', data);
      
      if (data.documents) {
        setDocuments(data.documents);
        console.log('✅ Loaded', data.documents.length, 'documents');
      } else if (data.error) {
        console.error('Documents error:', data.error);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleShowDocuments = () => {
    setShowDocuments(true);
    loadDocuments();
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/account/signin');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#0f1419',
        color: '#f7fafc'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f1419',
      color: '#f7fafc'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1f2e',
        padding: '1rem 2rem',
        borderBottom: '1px solid #2d3748',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🏢 Nivasi</h1>
          <span style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Tenant
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#cbd5e0' }}>Welcome, {user?.name}</span>
          
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              padding: '0.5rem',
              backgroundColor: showNotifications ? '#3b82f6' : '#2d3748',
              color: '#f7fafc',
              border: '1px solid #4a5568',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: '#f7fafc',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            👤 Profile
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2d3748',
              color: '#f7fafc',
              border: '1px solid #4a5568',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '2rem',
          width: '400px',
          maxHeight: '500px',
          backgroundColor: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #2d3748',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a0aec0',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: 0
              }}
            >
              ×
            </button>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#a0aec0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #2d3748',
                    backgroundColor: notif.read ? 'transparent' : '#1e3a5f',
                    cursor: notif.read ? 'default' : 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#f7fafc'
                    }}>
                      {notif.reminder_type === 'payment' ? '💰' : 
                       notif.reminder_type === 'lease' ? '📄' :
                       notif.reminder_type === 'maintenance' ? '🔧' : '📢'} 
                      {' '}{notif.reminder_type.charAt(0).toUpperCase() + notif.reminder_type.slice(1)} Reminder
                    </span>
                    {!notif.read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    color: '#cbd5e0',
                    whiteSpace: 'pre-line'
                  }}>
                    {notif.message}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#a0aec0'
                  }}>
                    From: {notif.owner_name} • {new Date(notif.sent_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {!propertyInfo ? (
          /* Not Assigned to Property */
          <EnterCodeUI user={user} onSuccess={() => loadDashboardData(user?.email)} />
        ) : (
          /* Assigned to Property */
          <div>
            {/* Debug Info - Remove after testing */}
            <div style={{ 
              backgroundColor: '#1a1f2e', 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#cbd5e0',
              display: 'none' // Set to 'block' to see debug info
            }}>
              <p><strong>Debug Info:</strong></p>
              <p>Rent Amount: ₹{rentInfo?.amount || 0}</p>
              <p>Status: {rentInfo?.status || 'undefined'}</p>
              <p>Due Date: {rentInfo?.dueDate || 'undefined'}</p>
              <p>Days Until Due: {rentInfo?.daysUntilDue || 'undefined'}</p>
            </div>

            {/* Rent Status */}
            <div style={{
              backgroundColor: 
                rentInfo?.status === 'paid' ? '#065f46' : 
                rentInfo?.status === 'overdue' ? '#7f1d1d' : 
                '#1e3a8a',
              border: `2px solid ${
                rentInfo?.status === 'paid' ? '#10b981' : 
                rentInfo?.status === 'overdue' ? '#ef4444' : 
                '#3b82f6'
              }`,
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
                      {rentInfo?.status === 'paid' ? '✅ Rent Paid' : 
                       rentInfo?.status === 'overdue' ? '⚠️ Rent Overdue' : 
                       '⏰ Rent Pending'}
                    </p>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      fontWeight: '700'
                    }}>
                      {rentInfo?.status || 'PENDING'}
                    </span>
                  </div>
                  <p style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0.5rem 0' }}>
                    ₹{(rentInfo?.amount || 0).toLocaleString()}
                  </p>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {rentInfo?.status === 'paid' ? (
                      <>
                        <p style={{ margin: '0.25rem 0' }}>
                          💚 Next due: {rentInfo?.dueDate ? new Date(rentInfo.dueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                        <p style={{ margin: '0.25rem 0' }}>
                          📅 {rentInfo?.daysUntilDue || 0} days remaining
                        </p>
                      </>
                    ) : rentInfo?.status === 'overdue' ? (
                      <>
                        <p style={{ margin: '0.25rem 0' }}>
                          📅 Was due: {rentInfo?.dueDate ? new Date(rentInfo.dueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontWeight: '600' }}>
                          ⚠️ {Math.abs(rentInfo?.daysUntilDue || 0)} days overdue
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: '0.25rem 0' }}>
                          📅 Due: {rentInfo?.dueDate ? new Date(rentInfo.dueDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </p>
                        <p style={{ margin: '0.25rem 0' }}>
                          ⏰ {rentInfo?.daysUntilDue || 0} days remaining
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {rentInfo?.status !== 'paid' && (
                  <button
                    onClick={() => alert('Contact your property owner to record payment')}
                    style={{
                      padding: '0.75rem 2rem',
                      backgroundColor: rentInfo?.status === 'overdue' ? '#ef4444' : '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    {rentInfo?.status === 'overdue' ? '⚠️ Pay Now' : '💰 Pay Rent'}
                  </button>
                )}
              </div>
            </div>

            {/* Property & Owner Info Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Property Info */}
              <div style={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                  🏢 Your Property
                </h3>
                <div style={{ color: '#cbd5e0', lineHeight: '1.8' }}>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Property:</strong> {propertyInfo.name}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Address:</strong> {propertyInfo.address}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Type:</strong> {propertyInfo.type}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Unit:</strong> {propertyInfo.unit || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Owner Info */}
              <div style={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                  👤 Property Owner
                </h3>
                <div style={{ color: '#cbd5e0', lineHeight: '1.8' }}>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Name:</strong> {ownerInfo.name}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Email:</strong> {ownerInfo.email}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong style={{ color: '#f7fafc' }}>Phone:</strong> {ownerInfo.phone}
                  </p>
                  <button
                    onClick={() => window.location.href = `mailto:${ownerInfo.email}`}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      width: '100%'
                    }}
                  >
                    📧 Contact Owner
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <ActionCard 
                  icon="💳"
                  title="Payment History"
                  description="View past payments"
                  onClick={handleShowPaymentHistory}
                />
                <ActionCard 
                  icon="🔧"
                  title="Maintenance"
                  description="Request repairs"
                  onClick={handleShowMaintenance}
                />
                <ActionCard 
                  icon="👤"
                  title="Profile"
                  description="Update your info"
                  onClick={handleShowProfile}
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment History Modal */}
        {showPaymentHistory && (
          <PaymentHistoryModal
            onClose={() => setShowPaymentHistory(false)}
            payments={paymentHistory}
            rentAmount={rentInfo.amount}
          />
        )}

        {/* Maintenance Modal */}
        {showMaintenance && (
          <MaintenanceModal
            onClose={() => setShowMaintenance(false)}
            requests={maintenanceRequests}
            tenantEmail={user?.email}
            onSuccess={() => {
              loadMaintenanceRequests();
            }}
          />
        )}

        {/* Profile Modal */}
        {showProfile && (
          <TenantProfileModal
            onClose={() => setShowProfile(false)}
            user={user}
            onSuccess={(updatedUser) => {
              setUser(updatedUser);
              sessionStorage.setItem('user', JSON.stringify(updatedUser));
            }}
          />
        )}
      </div>
    </div>
  );
}

// Payment History Modal Component
function PaymentHistoryModal({ onClose, payments, rentAmount }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1f2e',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: '2rem 0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>
            💳 Payment History
          </h2>
          <button
            onClick={onClose}
            title="Close (ESC)"
            style={{
              background: '#2d3748',
              border: 'none',
              color: '#f7fafc',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1,
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d3748';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {payments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No payment history yet</p>
              <p style={{ fontSize: '0.875rem' }}>Your payment records will appear here once payments are recorded.</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#a0aec0' }}>
                    Total Payments
                  </p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#f7fafc' }}>
                    {payments.length}
                  </p>
                </div>
                <div style={{
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#a0aec0' }}>
                    Total Paid
                  </p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                    ₹{payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div style={{
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#a0aec0' }}>
                    Monthly Rent
                  </p>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
                    ₹{rentAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment List */}
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#f7fafc' }}>
                Recent Payments
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {payments.map((payment, index) => (
                  <div
                    key={payment.id || index}
                    style={{
                      backgroundColor: '#0f1419',
                      border: '1px solid #2d3748',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {payment.payment_method === 'cash' ? '💵' :
                           payment.payment_method === 'bank_transfer' ? '🏦' :
                           payment.payment_method === 'upi' ? '📱' :
                           payment.payment_method === 'card' ? '💳' : '💰'}
                        </span>
                        <div>
                          <p style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#f7fafc' }}>
                            ₹{parseFloat(payment.amount || 0).toLocaleString()}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0', textTransform: 'capitalize' }}>
                            {payment.payment_method?.replace('_', ' ') || 'Cash'}
                          </p>
                        </div>
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#cbd5e0' }}>
                        📅 {new Date(payment.paid_date || payment.payment_date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      {payment.notes && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#a0aec0', fontStyle: 'italic' }}>
                          📝 {payment.notes}
                        </p>
                      )}
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#065f46',
                      color: '#10b981',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      ✓ {payment.status || 'Completed'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #2d3748',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#2d3748',
              color: '#f7fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '8px',
        padding: '1.5rem',
        color: '#f7fafc',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2d3748';
        e.currentTarget.style.borderColor = '#4a5568';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1f2e';
        e.currentTarget.style.borderColor = '#2d3748';
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '0.875rem', color: '#a0aec0' }}>{description}</p>
    </button>
  );
}

// Enter Code UI Component
function EnterCodeUI({ user, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tenants/connect-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          tenantEmail: user?.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 Successfully connected to ${data.property}!`);
        onSuccess();
      } else {
        setError(data.error || 'Failed to connect');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1a1f2e',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f7fafc' }}>
        Connect to Your Property
      </h2>
      <p style={{ color: '#a0aec0', marginBottom: '2rem', lineHeight: '1.6' }}>
        Enter the 6-character code provided by your property owner to connect to your unit
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#7c2d12',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            color: '#fecaca',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-digit code (e.g., ABC123)"
          maxLength={6}
          required
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#0f1419',
            border: '2px solid #2d3748',
            borderRadius: '8px',
            color: '#f7fafc',
            fontSize: '1.5rem',
            textAlign: 'center',
            letterSpacing: '0.5em',
            fontFamily: 'monospace',
            fontWeight: '700',
            marginBottom: '1rem'
          }}
        />

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: code.length === 6 && !loading ? '#10b981' : '#2d3748',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: code.length === 6 && !loading ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: code.length === 6 && !loading ? 1 : 0.5
          }}
        >
          {loading ? 'Connecting...' : '🔗 Connect to Property'}
        </button>
      </form>

      <div style={{
        borderTop: '1px solid #2d3748',
        paddingTop: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <strong style={{ color: '#f7fafc' }}>Don't have a code?</strong>
        </p>
        <p style={{ color: '#a0aec0', fontSize: '0.875rem', lineHeight: '1.6' }}>
          Ask your property owner to generate a connection code for your unit. 
          They can do this from their owner dashboard.
        </p>
        <div style={{
          backgroundColor: '#0f1419',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <p style={{ color: '#a0aec0', fontSize: '0.875rem', margin: 0 }}>
            <strong style={{ color: '#f7fafc' }}>Your Email:</strong> {user?.email}
          </p>
          <p style={{ color: '#a0aec0', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Share this with your owner
          </p>
        </div>
      </div>
    </div>
  );
}

// Tenant Profile Modal Component
function TenantProfileModal({ onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: formData.name,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, name: formData.name, phone: formData.phone };
        setMessage('✅ Profile updated successfully!');
        setTimeout(() => {
          onSuccess(updatedUser);
          onClose();
        }, 1500);
      } else {
        setMessage('❌ ' + (data.error || 'Failed to update profile'));
      }
    } catch (error) {
      setMessage('❌ An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1f2e',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '2rem 0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>
            👤 Tenant Profile
          </h2>
          <button
            onClick={onClose}
            title="Close (ESC)"
            style={{
              background: '#2d3748',
              border: 'none',
              color: '#f7fafc',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1,
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d3748';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {message && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: message.includes('✅') ? '#065f46' : '#7c2d12',
              border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`,
              borderRadius: '6px',
              color: message.includes('✅') ? '#d1fae5' : '#fecaca',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {/* Profile Info Display */}
          <div style={{
            backgroundColor: '#0f1419',
            border: '1px solid #2d3748',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#f7fafc' }}>
              Current Profile Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Name:</span>
                <p style={{ margin: '0.25rem 0 0 0', color: '#f7fafc', fontSize: '1rem', fontWeight: '600' }}>
                  {user?.name || 'Not set'}
                </p>
              </div>
              <div>
                <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Email:</span>
                <p style={{ margin: '0.25rem 0 0 0', color: '#f7fafc', fontSize: '1rem', fontWeight: '600' }}>
                  {user?.email}
                </p>
              </div>
              <div>
                <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Phone:</span>
                <p style={{ margin: '0.25rem 0 0 0', color: '#f7fafc', fontSize: '1rem', fontWeight: '600' }}>
                  {user?.phone || 'Not set'}
                </p>
              </div>
              <div>
                <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Account Type:</span>
                <p style={{ margin: '0.25rem 0 0 0', color: '#10b981', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  {user?.userType || 'Tenant'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#f7fafc' }}>
              Edit Profile
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '6px',
                  color: '#a0aec0',
                  fontSize: '1rem',
                  cursor: 'not-allowed'
                }}
              />
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#a0aec0' }}>
                Your email address cannot be changed for security reasons
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '6px',
                  color: '#f7fafc',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +91 9876543210"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0f1419',
                  border: '1px solid #2d3748',
                  borderRadius: '6px',
                  color: '#f7fafc',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#2d3748',
                  color: '#f7fafc',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading ? '#4a5568' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Updating...' : '✓ Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Maintenance Modal Component
function MaintenanceModal({ onClose, requests, tenantEmail, onSuccess }) {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔧 Submitting maintenance request:', {
      tenantEmail,
      title: formData.title,
      description: formData.description,
      priority: formData.priority
    });

    try {
      const response = await fetch('/api/maintenance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantEmail,
          ...formData
        })
      });

      const data = await response.json();
      console.log('Maintenance request response:', data);

      if (response.ok) {
        alert('✅ ' + (data.message || 'Maintenance request submitted successfully!'));
        setFormData({ title: '', description: '', priority: 'medium' });
        setShowNewRequest(false);
        onSuccess();
      } else {
        console.error('Failed to create request:', data);
        alert('❌ ' + (data.error || 'Failed to submit request') + (data.details ? ': ' + data.details : ''));
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert('❌ An error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#7f1d1d';
      case 'high': return '#7c2d12';
      case 'medium': return '#1e3a8a';
      case 'low': return '#065f46';
      default: return '#1e3a8a';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#065f46';
      case 'in_progress': return '#1e3a8a';
      case 'pending': return '#7c2d12';
      case 'cancelled': return '#4a5568';
      default: return '#1e3a8a';
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1f2e',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          margin: '2rem 0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>
            🔧 Maintenance Requests
          </h2>
          <button
            onClick={onClose}
            title="Close (ESC)"
            style={{
              background: '#2d3748',
              border: 'none',
              color: '#f7fafc',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1,
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d3748';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* New Request Button */}
          <button
            onClick={() => setShowNewRequest(!showNewRequest)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}
          >
            {showNewRequest ? '❌ Cancel' : '➕ New Maintenance Request'}
          </button>

          {/* New Request Form */}
          {showNewRequest && (
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Broken faucet in kitchen"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #2d3748',
                    borderRadius: '6px',
                    color: '#f7fafc',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #2d3748',
                    borderRadius: '6px',
                    color: '#f7fafc',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#1a1f2e',
                    border: '1px solid #2d3748',
                    borderRadius: '6px',
                    color: '#f7fafc',
                    fontSize: '1rem'
                  }}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Submitting...' : '✓ Submit Request'}
              </button>
            </form>
          )}

          {/* Existing Requests */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#f7fafc' }}>
            Your Requests
          </h3>

          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No maintenance requests yet</p>
              <p style={{ fontSize: '0.875rem' }}>Submit a request above if you need any repairs.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    backgroundColor: '#0f1419',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#f7fafc' }}>
                        {request.title}
                      </h4>
                      <p style={{ margin: 0, color: '#cbd5e0', fontSize: '0.875rem' }}>
                        {request.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: getPriorityColor(request.priority),
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        {request.priority}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: getStatusColor(request.status),
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#a0aec0' }}>
                    📅 Submitted: {new Date(request.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  {request.resolved_at && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#10b981' }}>
                      ✓ Resolved: {new Date(request.resolved_at).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Documents Modal Component  
function DocumentsModal({ onClose, documents }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1f2e',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '2rem 0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>
            📄 Documents
          </h2>
          <button
            onClick={onClose}
            title="Close (ESC)"
            style={{
              background: '#2d3748',
              border: 'none',
              color: '#f7fafc',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 1,
              borderRadius: '6px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d3748';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {documents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No documents available</p>
              <p style={{ fontSize: '0.875rem' }}>Your lease agreement and other documents will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#0f1419',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => window.open(doc.document_url, '_blank')}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d3748'}
                >
                  <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {doc.document_type === 'lease' ? '📋' :
                     doc.document_type === 'agreement' ? '📝' :
                     doc.document_type === 'receipt' ? '🧾' :
                     doc.document_type === 'photo' ? '📷' : '📄'}
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#f7fafc', textAlign: 'center' }}>
                    {doc.document_name}
                  </h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#a0aec0', textAlign: 'center', textTransform: 'capitalize' }}>
                    {doc.document_type}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.625rem', color: '#a0aec0', textAlign: 'center' }}>
                    {new Date(doc.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
