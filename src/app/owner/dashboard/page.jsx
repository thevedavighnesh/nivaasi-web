import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    totalRent: 0,
    pendingPayments: 0
  });
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedPropertyForTenant, setSelectedPropertyForTenant] = useState(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [selectedPropertyForCode, setSelectedPropertyForCode] = useState(null);
  const [showViewTenants, setShowViewTenants] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Get user from session
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/account/signin');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.userType !== 'owner') {
      navigate('/tenant/dashboard');
      return;
    }
    
    setUser(userData);
    loadDashboardData(userData.email);
  }, [navigate]);

  const loadDashboardData = async (email) => {
    try {
      console.log('Loading owner dashboard data for:', email);
      
      // Fetch properties
      const propertiesRes = await fetch(`/api/properties/list?ownerEmail=${email}`);
      let propertiesList = [];
      if (propertiesRes.ok) {
        const propertiesData = await propertiesRes.json();
        propertiesList = propertiesData.properties || [];
        setProperties(propertiesList);
        console.log('Properties loaded:', propertiesList.length);
      } else {
        console.error('Failed to fetch properties:', propertiesRes.status);
      }

      // Fetch tenants
      const tenantsRes = await fetch(`/api/tenants/list?ownerEmail=${email}`);
      let tenantsList = [];
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        tenantsList = tenantsData.tenants || [];
        setTenants(tenantsList);
        console.log('Tenants loaded:', tenantsList.length);
      } else {
        console.error('Failed to fetch tenants:', tenantsRes.status);
      }
      
      // Calculate stats
      const totalRent = tenantsList.reduce((sum, t) => sum + parseFloat(t.rent_amount || 0), 0);
      const pendingCount = tenantsList.filter(t => t.rent_status === 'pending' || t.rent_status === 'overdue').length;
      
      const calculatedStats = {
        properties: propertiesList.length,
        tenants: tenantsList.length,
        totalRent: totalRent,
        pendingPayments: pendingCount
      };
      
      console.log('Stats calculated:', calculatedStats);
      setStats(calculatedStats);

      // Fetch notifications
      const notifRes = await fetch(`/api/notifications/owner?ownerEmail=${email}`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.notifications?.filter(n => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceRequests = async () => {
    if (!user?.email) return;
    try {
      console.log('🔧 Loading maintenance requests for owner:', user.email);
      const response = await fetch(`/api/maintenance/owner?ownerEmail=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (data.requests) {
        setMaintenanceRequests(data.requests);
        console.log('✅ Loaded', data.requests.length, 'maintenance requests');
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  const handleShowMaintenance = () => {
    setShowMaintenance(true);
    loadMaintenanceRequests();
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
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Owner
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

          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem', textAlign: 'center', color: '#a0aec0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔔</div>
            <p>No notifications yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Owner notifications will appear here (e.g., tenant connections, payment confirmations)
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Properties"
            value={stats.properties}
            icon="🏢"
            color="#3b82f6"
          />
          <StatCard
            title="Total Tenants"
            value={stats.tenants}
            icon="👥"
            color="#10b981"
          />
          <StatCard
            title="Monthly Rent"
            value={`₹${stats.totalRent.toLocaleString()}`}
            icon="💰"
            color="#f59e0b"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon="⏰"
            color="#ef4444"
          />
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ActionButton 
              label="Add Property"
              icon="➕"
              onClick={() => setShowAddProperty(true)}
            />
            <ActionButton 
              label="Record Payment"
              icon="💳"
              onClick={() => setShowRecordPayment(true)}
            />
            <ActionButton 
              label="View All Tenants"
              icon="👥"
              onClick={() => setShowViewTenants(true)}
            />
            <ActionButton 
              label="Reports"
              icon="📊"
              onClick={() => setShowReports(true)}
            />
            <ActionButton 
              label="Maintenance"
              icon="🔧"
              onClick={handleShowMaintenance}
            />
          </div>
        </div>

        {/* Properties List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your Properties</h2>
          {properties.length === 0 ? (
            <div style={{
              backgroundColor: '#1a1f2e',
              border: '1px solid #2d3748',
              borderRadius: '8px',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>
                You haven't added any properties yet
              </p>
              <button
                onClick={() => setShowAddProperty(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Add Your First Property
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  onAddTenant={() => {
                    setSelectedPropertyForTenant(property);
                    setShowAddTenant(true);
                  }}
                  onGenerateCode={() => {
                    setSelectedPropertyForCode(property);
                    setShowGenerateCode(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      {showAddProperty && (
        <AddPropertyModal
          onClose={() => setShowAddProperty(false)}
          ownerEmail={user?.email}
          onSuccess={() => {
            setShowAddProperty(false);
            loadDashboardData(user?.email);
          }}
        />
      )}

      {/* Add Tenant Modal */}
      {showAddTenant && (
        <AddTenantModal
          onClose={() => {
            setShowAddTenant(false);
            setSelectedPropertyForTenant(null);
          }}
          property={selectedPropertyForTenant}
          onSuccess={() => {
            setShowAddTenant(false);
            setSelectedPropertyForTenant(null);
            loadDashboardData(user?.email);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <RecordPaymentModal
          onClose={() => setShowRecordPayment(false)}
          tenants={tenants}
          onSuccess={() => {
            setShowRecordPayment(false);
            loadDashboardData(user?.email);
          }}
        />
      )}

      {/* Generate Code Modal */}
      {showGenerateCode && (
        <GenerateCodeModal
          onClose={() => {
            setShowGenerateCode(false);
            setSelectedPropertyForCode(null);
          }}
          property={selectedPropertyForCode}
        />
      )}

      {/* View All Tenants Modal */}
      {showViewTenants && (
        <ViewTenantsModal
          onClose={() => setShowViewTenants(false)}
          tenants={tenants}
        />
      )}

      {/* Reports Modal */}
      {showReports && (
        <ReportsModal
          onClose={() => setShowReports(false)}
          properties={properties}
          tenants={tenants}
          stats={stats}
          user={user}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <OwnerProfileModal
          onClose={() => setShowProfile(false)}
          user={user}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      )}

      {/* Maintenance Modal */}
      {showMaintenance && (
        <OwnerMaintenanceModal
          onClose={() => setShowMaintenance(false)}
          requests={maintenanceRequests}
          ownerEmail={user?.email}
          onSuccess={() => {
            loadMaintenanceRequests();
          }}
        />
      )}
    </div>
  );
}

// Add Property Modal Component
function AddPropertyModal({ onClose, ownerEmail, onSuccess }) {
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    propertyType: 'apartment',
    units: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/properties/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ownerEmail })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to add property');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Add New Property">
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <Input
          label="Property Name"
          value={formData.propertyName}
          onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
          required
        />
        
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Property Type
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '1rem'
            }}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        
        <Input
          label="Number of Units"
          type="number"
          min="1"
          value={formData.units}
          onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
          required
        />
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Property'}
          </button>
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Add Tenant Modal Component
function AddTenantModal({ onClose, property, onSuccess }) {
  const [formData, setFormData] = useState({
    tenantEmail: '',
    unit: '',
    rentAmount: '',
    rentDueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [occupiedUnits, setOccupiedUnits] = useState([]);

  // Fetch occupied units when component mounts
  useEffect(() => {
    if (property?.id) {
      fetch(`/api/properties/occupied-units?propertyId=${property.id}`)
        .then(res => res.json())
        .then(data => setOccupiedUnits(data.occupiedUnits || []))
        .catch(err => console.error('Error fetching occupied units:', err));
    }
  }, [property]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tenants/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to add tenant');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title={`Add Tenant to ${property?.name}`}>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        {/* Property Info Card */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#0f1419',
          border: '1px solid #2d3748',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, color: '#f7fafc', fontSize: '1rem' }}>{property?.name}</h3>
            <p style={{ margin: '0.25rem 0 0 0', color: '#a0aec0', fontSize: '0.875rem' }}>
              📍 {property?.address}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#a0aec0', display: 'block', fontSize: '0.75rem' }}>Total Units</span>
              <span style={{ color: '#f7fafc', fontWeight: '600' }}>{property?.total_units}</span>
            </div>
            <div>
              <span style={{ color: '#a0aec0', display: 'block', fontSize: '0.75rem' }}>Occupied</span>
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>{property?.occupied_units}</span>
            </div>
            <div>
              <span style={{ color: '#a0aec0', display: 'block', fontSize: '0.75rem' }}>Available</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>{property?.available_units}</span>
            </div>
          </div>
          {occupiedUnits.length > 0 && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #2d3748' }}>
              <span style={{ color: '#a0aec0', fontSize: '0.75rem' }}>Occupied units: </span>
              <span style={{ color: '#cbd5e0', fontSize: '0.75rem' }}>
                {occupiedUnits.join(', ')}
              </span>
            </div>
          )}
        </div>
        
        <Input
          label="Tenant Email"
          type="email"
          value={formData.tenantEmail}
          onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
          placeholder="tenant@example.com"
          required
        />
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Unit Number {occupiedUnits.length > 0 && <span style={{ color: '#a0aec0' }}>(avoid: {occupiedUnits.join(', ')})</span>}
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., 101, A-1, Floor-2, etc."
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
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#a0aec0' }}>
            Enter a unique identifier for this unit
          </p>
        </div>
        
        <Input
          label="Monthly Rent Amount (₹)"
          type="number"
          min="0"
          step="100"
          value={formData.rentAmount}
          onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
          required
        />
        
        <Input
          label="Lease Start Date"
          type="date"
          value={formData.rentDueDate}
          onChange={(e) => setFormData({ ...formData, rentDueDate: e.target.value })}
          required
        />
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Tenant'}
          </button>
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Record Payment Modal Component
function RecordPaymentModal({ onClose, tenants, onSuccess }) {
  const [formData, setFormData] = useState({
    tenantEmail: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Submitting payment:', formData);

    try {
      const response = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (response.ok) {
        alert(data.message || 'Payment recorded successfully!');
        onSuccess();
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        console.error('Payment failed:', errorMsg);
        setError(errorMsg || 'Failed to record payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Select Tenant
          </label>
          <select
            value={formData.tenantEmail}
            onChange={(e) => {
              const selectedTenant = tenants.find(t => t.email === e.target.value);
              console.log('💰 Selected tenant for payment:', {
                tenantEmail: e.target.value,
                tenantName: selectedTenant?.name,
                rentAmount: selectedTenant?.rent_amount
              });
              setFormData({ 
                ...formData, 
                tenantEmail: e.target.value,
                amount: selectedTenant ? selectedTenant.rent_amount : ''
              });
            }}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '1rem'
            }}
          >
            <option value="">Choose a tenant...</option>
            {tenants.map((tenant) => (
              <option key={tenant.email} value={tenant.email}>
                {tenant.name} - {tenant.property_name} ({tenant.unit || 'N/A'}) - ₹{parseFloat(tenant.rent_amount).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        
        <Input
          label="Amount (₹)"
          type="number"
          min="0"
          step="1"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
        
        <Input
          label="Payment Date"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          required
        />
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '1rem'
            }}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            placeholder="Add any notes about this payment..."
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal Component
function Modal({ children, onClose, title }) {
  return (
    <div style={{
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
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#1a1f2e',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#a0aec0',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Input Component
function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
        {label}
      </label>
      <input
        {...props}
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
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: '#1a1f2e',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      padding: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{value}</p>
        </div>
        <div style={{ 
          fontSize: '2.5rem',
          opacity: 0.8
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '8px',
        padding: '1rem 1.5rem',
        color: '#f7fafc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#2d3748';
        e.target.style.borderColor = '#4a5568';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#1a1f2e';
        e.target.style.borderColor = '#2d3748';
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      {label}
    </button>
  );
}

function PropertyCard({ property, onAddTenant, onGenerateCode }) {
  const occupancyPercent = (parseInt(property.occupied_units) / parseInt(property.total_units)) * 100;
  const isFullyOccupied = parseInt(property.occupied_units) >= parseInt(property.total_units);
  const hasAvailableUnits = parseInt(property.available_units) > 0;

  return (
    <div style={{
      backgroundColor: '#1a1f2e',
      border: '1px solid #2d3748',
      borderRadius: '8px',
      padding: '1.5rem'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, color: '#f7fafc' }}>{property.name}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {isFullyOccupied && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                FULL
              </span>
            )}
            {hasAvailableUnits && (
              <>
                <button
                  onClick={onGenerateCode}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  <span>🔑</span> Generate Code
                </button>
                <button
                  onClick={onAddTenant}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  <span>👤</span> Add Direct
                </button>
              </>
            )}
          </div>
        </div>
        <p style={{ color: '#a0aec0', margin: '0 0 0.75rem 0', fontSize: '0.875rem' }}>
          📍 {property.address}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ 
            padding: '0.25rem 0.75rem',
            backgroundColor: '#0f1419',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#cbd5e0'
          }}>
            {property.property_type}
          </span>
          <span style={{ 
            padding: '0.25rem 0.75rem',
            backgroundColor: parseInt(property.available_units) > 0 ? '#065f46' : '#7c2d12',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#f7fafc',
            fontWeight: '600'
          }}>
            {property.occupied_units}/{property.total_units} Units Occupied
          </span>
          {hasAvailableUnits && (
            <span style={{ 
              padding: '0.25rem 0.75rem',
              backgroundColor: '#1e40af',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#f7fafc'
            }}>
              {property.available_units} Available
            </span>
          )}
        </div>
      </div>
      {/* Occupancy bar */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#0f1419',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${occupancyPercent}%`,
          height: '100%',
          backgroundColor: occupancyPercent >= 100 ? '#10b981' : occupancyPercent >= 75 ? '#f59e0b' : '#3b82f6',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

// Reports Modal Component
function ReportsModal({ onClose, properties, tenants, stats, user }) {
  const handleDownloadPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const totalRent = tenants.reduce((sum, t) => sum + parseFloat(t.rent_amount || 0), 0);
    const occupancyRate = properties.length > 0 
      ? ((properties.reduce((sum, p) => sum + parseInt(p.occupied_units || 0), 0) / 
          properties.reduce((sum, p) => sum + parseInt(p.total_units || 1), 0)) * 100).toFixed(1)
      : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Management Report - ${currentDate}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 20px;
            color: #1a1a1a;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            color: #1a1a1a;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .summary-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #666;
          }
          .summary-card p {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            color: #1a1a1a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          tr:hover {
            background-color: #f9fafb;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-success {
            background-color: #d1fae5;
            color: #065f46;
          }
          .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏢 Property Management Report</h1>
          <p><strong>Owner:</strong> ${user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Report Generated:</strong> ${currentDate}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Properties</h3>
            <p>${properties.length}</p>
          </div>
          <div class="summary-card">
            <h3>Active Tenants</h3>
            <p>${tenants.length}</p>
          </div>
          <div class="summary-card">
            <h3>Monthly Rent</h3>
            <p>₹${totalRent.toLocaleString()}</p>
          </div>
          <div class="summary-card">
            <h3>Occupancy Rate</h3>
            <p>${occupancyRate}%</p>
          </div>
        </div>

        <div class="section">
          <h2>Properties Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Address</th>
                <th>Type</th>
                <th>Total Units</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${properties.map(prop => `
                <tr>
                  <td><strong>${prop.name}</strong></td>
                  <td>${prop.address}</td>
                  <td>${prop.property_type}</td>
                  <td>${prop.total_units}</td>
                  <td>${prop.occupied_units}</td>
                  <td>${prop.available_units}</td>
                  <td>
                    <span class="badge ${parseInt(prop.available_units) > 0 ? 'badge-success' : 'badge-warning'}">
                      ${parseInt(prop.available_units) > 0 ? 'Available' : 'Full'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Tenants Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Tenant Name</th>
                <th>Email</th>
                <th>Property</th>
                <th>Unit</th>
                <th>Monthly Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tenants.map(tenant => `
                <tr>
                  <td><strong>${tenant.name}</strong></td>
                  <td>${tenant.email}</td>
                  <td>${tenant.property_name}</td>
                  <td>${tenant.unit || 'N/A'}</td>
                  <td>₹${parseFloat(tenant.rent_amount || 0).toLocaleString()}</td>
                  <td><span class="badge badge-success">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report was automatically generated by Nivasi Property Management System</p>
          <p>© ${new Date().getFullYear()} Nivasi - All Rights Reserved</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const totalRent = tenants.reduce((sum, t) => sum + parseFloat(t.rent_amount || 0), 0);
  const totalUnits = properties.reduce((sum, p) => sum + parseInt(p.total_units || 0), 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + parseInt(p.occupied_units || 0), 0);
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

  return (
    <Modal onClose={onClose} title="📊 Property Management Reports">
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '0.875rem', fontWeight: '600' }}>
              Total Properties
            </p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>
              {properties.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '0.875rem', fontWeight: '600' }}>
              Active Tenants
            </p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', color: '#10b981' }}>
              {tenants.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '0.875rem', fontWeight: '600' }}>
              Monthly Rent Collection
            </p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              ₹{totalRent.toLocaleString()}
            </p>
          </div>
          <div style={{
            backgroundColor: '#f3e8ff',
            border: '2px solid #a855f7',
            borderRadius: '8px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#6b21a8', fontSize: '0.875rem', fontWeight: '600' }}>
              Occupancy Rate
            </p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700', color: '#a855f7' }}>
              {occupancyRate}%
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          backgroundColor: '#0f1419',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#f7fafc', fontSize: '1.125rem' }}>
            Quick Statistics
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', color: '#cbd5e0', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Units:</span>
              <strong style={{ color: '#f7fafc' }}>{totalUnits}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Occupied Units:</span>
              <strong style={{ color: '#10b981' }}>{occupiedUnits}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Available Units:</span>
              <strong style={{ color: '#3b82f6' }}>{totalUnits - occupiedUnits}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #2d3748' }}>
              <span>Average Rent per Unit:</span>
              <strong style={{ color: '#f59e0b' }}>
                ₹{tenants.length > 0 ? Math.round(totalRent / tenants.length).toLocaleString() : 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2d3748' }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1,
              padding: '0.875rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            📄 Download PDF Report
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.875rem',
              backgroundColor: '#2d3748',
              color: '#f7fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// View All Tenants Modal Component
function ViewTenantsModal({ onClose, tenants }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [removingTenantId, setRemovingTenantId] = useState(null);

  const handleSendReminder = (tenant) => {
    setSelectedTenant(tenant);
    setShowReminderModal(true);
  };

  const handleRemoveTenant = async (tenant) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${tenant.name} from ${tenant.property_name}?\n\nThis will:\n- Remove tenant access\n- Delete all reminders\n- Delete payment records\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setRemovingTenantId(tenant.id);

    try {
      const response = await fetch('/api/tenants/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${tenant.name} has been removed successfully`);
        window.location.reload(); // Reload to refresh data
      } else {
        alert(`❌ ${data.error || 'Failed to remove tenant'}`);
      }
    } catch (error) {
      alert('❌ An error occurred while removing tenant');
      console.error('Remove tenant error:', error);
    } finally {
      setRemovingTenantId(null);
    }
  };

  return (
    <>
      <Modal onClose={onClose} title="All Tenants">
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {tenants.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <p>No tenants assigned yet</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Add tenants to your properties to see them here
              </p>
            </div>
          ) : (
          <>
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#0f1419',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
                Total Tenants
              </span>
              <span style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {tenants.length}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {tenants.map((tenant, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#0f1419',
                    border: '1px solid #2d3748',
                    borderRadius: '8px',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: '#f7fafc', fontSize: '1.125rem' }}>
                        {tenant.name}
                      </h3>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#a0aec0', fontSize: '0.875rem' }}>
                        📧 {tenant.email}
                      </p>
                      {tenant.phone && (
                        <p style={{ margin: '0 0 0.5rem 0', color: '#a0aec0', fontSize: '0.875rem' }}>
                          📱 {tenant.phone}
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
                      Active
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #2d3748'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#a0aec0', fontSize: '0.75rem' }}>
                        Property
                      </p>
                      <p style={{ margin: 0, color: '#f7fafc', fontSize: '0.875rem', fontWeight: '600' }}>
                        {tenant.property_name}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#cbd5e0', fontSize: '0.75rem' }}>
                        📍 {tenant.address}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#a0aec0', fontSize: '0.75rem' }}>
                        Unit & Rent
                      </p>
                      <p style={{ margin: 0, color: '#f7fafc', fontSize: '0.875rem', fontWeight: '600' }}>
                        Unit: {tenant.unit || 'N/A'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                        ₹{parseFloat(tenant.rent_amount || 0).toLocaleString()}/month
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleSendReminder(tenant)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      🔔 Send Reminder
                    </button>
                    <button
                      onClick={() => handleRemoveTenant(tenant)}
                      disabled={removingTenantId === tenant.id}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: removingTenantId === tenant.id ? '#6b7280' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: removingTenantId === tenant.id ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: removingTenantId === tenant.id ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (removingTenantId !== tenant.id) {
                          e.target.style.backgroundColor = '#dc2626';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (removingTenantId !== tenant.id) {
                          e.target.style.backgroundColor = '#ef4444';
                        }
                      }}
                    >
                      {removingTenantId === tenant.id ? '⏳ Removing...' : '🗑️ Remove Tenant'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2d3748' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2d3748',
              color: '#f7fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>

    {/* Send Reminder Modal */}
    {showReminderModal && (
      <SendReminderModal
        onClose={() => {
          setShowReminderModal(false);
          setSelectedTenant(null);
        }}
        tenant={selectedTenant}
        onSuccess={() => {
          setShowReminderModal(false);
          setSelectedTenant(null);
        }}
      />
    )}
  </>
  );
}

// Send Reminder Modal Component
function SendReminderModal({ onClose, tenant, onSuccess }) {
  const [formData, setFormData] = useState({
    reminderType: 'payment',
    message: `Dear ${tenant?.name},\n\nThis is a friendly reminder about your rent payment for ${tenant?.property_name}, Unit ${tenant?.unit}.\n\nAmount: ₹${parseFloat(tenant?.rent_amount || 0).toLocaleString()}\n\nPlease ensure timely payment.\n\nThank you,\nProperty Management`
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log tenant data
  useEffect(() => {
    console.log('Tenant data:', tenant);
  }, [tenant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate tenant ID
    if (!tenant?.id) {
      setError('Tenant ID is missing');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          message: formData.message,
          reminderType: formData.reminderType
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Reminder sent to ${data.tenant.name}!`);
        onSuccess();
      } else {
        setError(data.error || data.details || 'Failed to send reminder');
        console.error('Reminder error:', data);
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
      console.error('Send reminder error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="🔔 Send Reminder">
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        {/* Tenant Info */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#0f1419',
          border: '1px solid #2d3748',
          borderRadius: '8px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#f7fafc', fontSize: '1rem' }}>
            {tenant?.name}
          </h3>
          <p style={{ margin: '0.25rem 0', color: '#a0aec0', fontSize: '0.875rem' }}>
            📧 {tenant?.email}
          </p>
          <p style={{ margin: '0.25rem 0', color: '#a0aec0', fontSize: '0.875rem' }}>
            🏢 {tenant?.property_name} - Unit {tenant?.unit}
          </p>
          <p style={{ margin: '0.25rem 0', color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
            💰 ₹{parseFloat(tenant?.rent_amount || 0).toLocaleString()}/month
          </p>
        </div>

        {/* Reminder Type */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Reminder Type
          </label>
          <select
            value={formData.reminderType}
            onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '1rem'
            }}
          >
            <option value="payment">💰 Payment Reminder</option>
            <option value="lease">📄 Lease Reminder</option>
            <option value="maintenance">🔧 Maintenance Notice</option>
            <option value="general">📢 General Notice</option>
          </select>
        </div>

        {/* Message */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e0' }}>
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={8}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0f1419',
              border: '1px solid #2d3748',
              borderRadius: '6px',
              color: '#f7fafc',
              fontSize: '0.875rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#a0aec0' }}>
            Customize the message above before sending
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: loading ? '#2d3748' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Sending...' : '🔔 Send Reminder'}
          </button>
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
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Generate Code Modal Component
function GenerateCodeModal({ onClose, property }) {
  const [formData, setFormData] = useState({
    unit: '',
    rentAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState('');
  const [occupiedUnits, setOccupiedUnits] = useState([]);

  useEffect(() => {
    if (property?.id) {
      fetch(`/api/properties/occupied-units?propertyId=${property.id}`)
        .then(res => res.json())
        .then(data => setOccupiedUnits(data.occupiedUnits || []))
        .catch(err => console.error('Error:', err));
    }
  }, [property]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/properties/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          unit: formData.unit,
          rentAmount: formData.rentAmount
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.code);
      } else {
        setError(data.error || 'Failed to generate code');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  return (
    <Modal onClose={onClose} title={`Generate Connection Code - ${property?.name}`}>
      {!generatedCode ? (
        <form onSubmit={handleGenerate}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#0f1419',
            border: '1px solid #2d3748',
            borderRadius: '8px',
            fontSize: '0.875rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e0' }}>
              <strong style={{ color: '#f7fafc' }}>Property:</strong> {property?.name}
            </p>
            <p style={{ margin: '0', color: '#cbd5e0' }}>
              <strong style={{ color: '#f7fafc' }}>Available Units:</strong> {property?.available_units}
            </p>
            {occupiedUnits.length > 0 && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#a0aec0', fontSize: '0.75rem' }}>
                Occupied: {occupiedUnits.join(', ')}
              </p>
            )}
          </div>

          <Input
            label="Unit Number"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., 101, A-1, Floor-2"
            required
          />

          <Input
            label="Monthly Rent Amount (₹)"
            type="number"
            min="0"
            step="100"
            value={formData.rentAmount}
            onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
            required
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontWeight: '600'
              }}
            >
              {loading ? 'Generating...' : '🔑 Generate Code'}
            </button>
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
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#f7fafc', fontSize: '1.25rem' }}>
            Code Generated Successfully!
          </h3>
          
          <div style={{
            margin: '1.5rem 0',
            padding: '2rem',
            backgroundColor: '#0f1419',
            border: '2px solid #10b981',
            borderRadius: '12px'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: '#a0aec0', fontSize: '0.875rem' }}>
              Connection Code
            </p>
            <p style={{
              margin: 0,
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#10b981',
              letterSpacing: '0.1em',
              fontFamily: 'monospace'
            }}>
              {generatedCode}
            </p>
          </div>

          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#1e40af',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.875rem',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>📋 Share this code with tenant:</p>
            <p style={{ margin: '0.25rem 0' }}>• Unit: {formData.unit}</p>
            <p style={{ margin: '0.25rem 0' }}>• Rent: ₹{formData.rentAmount}/month</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', opacity: 0.9 }}>
              ⏰ Valid for 7 days
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={copyCode}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📋 Copy Code
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// Owner Profile Modal Component
function OwnerProfileModal({ onClose, user, onSuccess }) {
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
            👤 Owner Profile
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
                <p style={{ margin: '0.25rem 0 0 0', color: '#3b82f6', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  {user?.userType || 'Owner'}
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
                  backgroundColor: loading ? '#4a5568' : '#3b82f6',
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

// Owner Maintenance Modal Component
function OwnerMaintenanceModal({ onClose, requests, ownerEmail, onSuccess }) {
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const updateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const response = await fetch('/api/maintenance/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: newStatus,
          ownerEmail
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Status updated successfully!');
        onSuccess();
      } else {
        alert('❌ ' + (data.error || 'Failed to update status'));
      }
    } catch (error) {
      alert('❌ An error occurred');
    } finally {
      setUpdatingId(null);
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
          maxWidth: '1000px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '2rem 0'
        }}
      >
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f7fafc' }}>
            🔧 Maintenance Requests ({requests.length})
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

        <div style={{ padding: '1.5rem' }}>
          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#a0aec0'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No maintenance requests</p>
              <p style={{ fontSize: '0.875rem' }}>Requests from your tenants will appear here.</p>
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
                      <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e0', fontSize: '0.875rem' }}>
                        {request.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.5rem' }}>
                        <span>🏠 {request.property_name}</span>
                        <span>🚪 Unit {request.unit_number}</span>
                        <span>👤 {request.tenant_name}</span>
                      </div>
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
                  
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: '#a0aec0' }}>
                    📅 Submitted: {new Date(request.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>

                  {request.status !== 'completed' && request.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {request.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(request.id, 'in_progress')}
                          disabled={updatingId === request.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#1e3a8a',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingId === request.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            opacity: updatingId === request.id ? 0.5 : 1
                          }}
                        >
                          🔄 Start Work
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(request.id, 'completed')}
                        disabled={updatingId === request.id}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#065f46',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: updatingId === request.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          opacity: updatingId === request.id ? 0.5 : 1
                        }}
                      >
                        ✓ Mark Complete
                      </button>
                      <button
                        onClick={() => updateStatus(request.id, 'cancelled')}
                        disabled={updatingId === request.id}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#4a5568',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: updatingId === request.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          opacity: updatingId === request.id ? 0.5 : 1
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
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

export default OwnerDashboard;
