import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Global mock data storage
if (!global.mockUsers) global.mockUsers = [];
if (!global.mockProperties) global.mockProperties = [];
if (!global.mockTenants) global.mockTenants = [];
if (!global.mockPayments) global.mockPayments = [];
if (!global.mockMaintenanceRequests) global.mockMaintenanceRequests = [];
if (!global.mockReminders) global.mockReminders = [];
if (!global.mockTenantNotifications) global.mockTenantNotifications = {};
if (!global.mockConnectionCodes) global.mockConnectionCodes = [];

// Maintenance request submission
app.post('/api/maintenance/submit', (req, res) => {
  const { tenantEmail, propertyId, title, description, priority } = req.body;

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const request = {
    id: Date.now(),
    tenantEmail,
    propertyId,
    title,
    description,
    priority: priority || 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  global.mockMaintenanceRequests.push(request);

  res.json({
    message: 'Maintenance request submitted successfully',
    request
  });
});

// Maintenance request updates (multiple endpoint formats)
app.patch('/api/maintenance/update', (req, res) => {
  const { requestId, status, response } = req.body;

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const request = global.mockMaintenanceRequests.find(r => r.id == requestId);

  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  request.status = status;
  if (response) {
    request.response = response;
  }
  if (status === 'completed' && !request.resolved_at) {
    request.resolved_at = new Date().toISOString();
  }
  request.updatedAt = new Date().toISOString();

  res.json({
    message: 'Maintenance request updated successfully',
    request
  });
});

app.put('/api/maintenance/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Request ID and status are required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const request = global.mockMaintenanceRequests.find(r => r.id == id);

  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  request.status = status;
  if (response) {
    request.response = response;
  }
  if (status === 'completed' && !request.resolved_at) {
    request.resolved_at = new Date().toISOString();
  }
  request.updatedAt = new Date().toISOString();

  res.json({
    message: 'Maintenance request updated successfully',
    request
  });
});

app.patch('/api/maintenance/:id', (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: 'Request ID and status are required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const request = global.mockMaintenanceRequests.find(r => r.id == id);

  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  request.status = status;
  if (response) {
    request.response = response;
  }
  if (status === 'completed' && !request.resolved_at) {
    request.resolved_at = new Date().toISOString();
  }
  request.updatedAt = new Date().toISOString();

  res.json({
    message: 'Maintenance request updated successfully',
    request
  });
});

// Owner dashboard - get maintenance requests for owner's properties
app.get('/api/maintenance/owner', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  // Get properties owned by this owner
  const ownerProperties = global.mockProperties ?
    global.mockProperties.filter(p => p.ownerEmail === ownerEmail) : [];
  const propertyIds = ownerProperties.map(p => p.id);

  // Get maintenance requests for these properties
  const requests = global.mockMaintenanceRequests.filter(r =>
    propertyIds.includes(r.propertyId)
  );

  res.json({ requests });
});

// Owner dashboard endpoints
app.get('/api/properties/list', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  const ownerProperties = global.mockProperties.filter(p => p.ownerEmail === ownerEmail);

  res.json({ properties: ownerProperties });
});

app.get('/api/tenants/list', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  // Get properties owned by this owner
  const ownerProperties = global.mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);

  // Get tenants for these properties
  const ownerTenants = global.mockTenants.filter(t => propertyIds.includes(t.propertyId));

  res.json({ tenants: ownerTenants });
});

app.post('/api/properties/add', (req, res) => {
  const { name, address, property_type, total_units, ownerEmail } = req.body;

  if (!name || !address || !ownerEmail) {
    return res.status(400).json({ error: 'Name, address, and owner email are required' });
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  const newProperty = {
    id: Date.now().toString(),
    name,
    address,
    property_type: property_type || 'apartment',
    total_units: total_units || 1,
    occupied_units: 0,
    available_units: total_units || 1,
    ownerEmail,
    createdAt: new Date().toISOString()
  };

  global.mockProperties.push(newProperty);

  res.json({
    message: 'Property added successfully',
    property: newProperty
  });
});

app.get('/api/owner/stats', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }
  if (!global.mockTenants) {
    global.mockTenants = [];
  }
  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  // Get properties owned by this owner
  const ownerProperties = global.mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);

  // Get tenants for these properties
  const ownerTenants = global.mockTenants.filter(t => propertyIds.includes(t.propertyId));

  // Get payments for these properties (through tenants)
  const ownerPayments = global.mockPayments.filter(p =>
    ownerTenants.some(t => t.email === p.tenantEmail)
  );

  // Calculate stats
  const stats = {
    totalProperties: ownerProperties.length,
    totalUnits: ownerProperties.reduce((sum, p) => sum + (p.total_units || 0), 0),
    occupiedUnits: ownerProperties.reduce((sum, p) => sum + (p.occupied_units || 0), 0),
    totalTenants: ownerTenants.length,
    monthlyRevenue: ownerPayments
      .filter(p => {
        const paymentDate = new Date(p.paid_date || p.createdAt);
        const currentMonth = new Date();
        return paymentDate.getMonth() === currentMonth.getMonth() &&
               paymentDate.getFullYear() === currentMonth.getFullYear();
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    pendingRent: ownerTenants
      .filter(t => t.rent_status === 'pending')
      .reduce((sum, t) => sum + parseFloat(t.rent_amount || 0), 0)
  };

  res.json({ stats });
  // Mock notifications for development
  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      message: 'Rent payment received from tenant',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'New Maintenance Request',
      message: 'A tenant has submitted a maintenance request',
      read: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

// Tenant dashboard endpoint
app.get('/api/tenants/dashboard', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  const tenant = global.mockTenants.find(t => t.email === tenantEmail);

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  // Get property info
  const property = global.mockProperties.find(p => p.id === tenant.propertyId);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Calculate days until due
  const today = new Date();
  const dueDate = new Date(tenant.rent_due_date);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  const tenantData = {
    tenant: {
      ...tenant,
      daysUntilDue,
      rent_status: daysUntilDue < 0 ? 'overdue' : (daysUntilDue === 0 ? 'due' : 'pending')
    },
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      type: property.property_type,
      unit: tenant.unit,
      ownerEmail: property.ownerEmail
    }
  };

  res.json(tenantData);
});

// Tenant notifications
app.get('/api/notifications/tenant', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  // Mock notifications for development
  const notifications = [
    {
      id: '1',
      type: 'payment',
      reminder_type: 'payment',
      message: 'Your rent payment is due in 5 days.',
      owner_name: 'Property Owner',
      sent_at: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'maintenance',
      reminder_type: 'maintenance',
      message: 'Your maintenance request has been completed.',
      owner_name: 'Property Owner',
      sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ];

  res.json({ notifications });
});

// Mark notification as read
app.post('/api/notifications/mark-read', (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  res.json({ message: 'Notification marked as read' });
});

// Tenant maintenance requests
app.get('/api/maintenance/tenant', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const requests = global.mockMaintenanceRequests.filter(r => r.tenantEmail === tenantEmail);

  res.json({ requests });
});

// Tenant payment history
app.get('/api/payments/history', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  // Get actual payment history for this tenant
  const actualPayments = global.mockPayments.filter(p => p.tenantEmail === tenantEmail);

  // Add some mock payments for backward compatibility if no actual payments exist
  const mockPaymentsData = [
    {
      id: 1,
      tenantEmail: tenantEmail,
      amount: 15000,
      payment_method: 'bank_transfer',
      paid_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      notes: 'Monthly rent payment'
    },
    {
      id: 2,
      tenantEmail: tenantEmail,
      amount: 15000,
      payment_method: 'upi',
      paid_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      notes: 'Monthly rent payment'
    }
  ];

  const allPayments = actualPayments.length > 0 ? actualPayments : mockPaymentsData;

  res.json({ payments: allPayments });
});

// Submit payment
app.post('/api/payments/submit', (req, res) => {
  const { tenantEmail, amount, paymentMethod, notes } = req.body;

  if (!tenantEmail || !amount) {
    return res.status(400).json({ error: 'Tenant email and amount are required' });
  }

  // Ensure global arrays exist
  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  const payment = {
    id: Date.now(),
    tenantEmail,
    amount: parseFloat(amount),
    payment_method: paymentMethod || 'cash',
    paid_date: new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: notes || 'Payment submitted via tenant dashboard',
    createdAt: new Date().toISOString()
  };

  global.mockPayments.push(payment);

  // Update tenant rent status to 'paid' if payment amount matches rent
  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const tenant = global.mockTenants.find(t => t.email === tenantEmail);
  if (tenant && parseFloat(amount) >= parseFloat(tenant.rent_amount)) {
    tenant.rent_status = 'paid';
  }

  res.json({
    message: 'Payment submitted successfully',
    payment
  });
});

// Load documents for tenant
app.get('/api/tenants/documents', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  // Mock documents for development
  const documents = [
    {
      id: '1',
      document_name: 'Lease Agreement',
      document_type: 'lease',
      file_path: '/documents/lease.pdf',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      document_name: 'Rent Receipt',
      document_type: 'receipt',
      file_path: '/documents/receipt.pdf',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  res.json({ documents });
});
});

// Authentication endpoints
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, userType } = req.body;

  if (!name || !email || !password || !userType) {
    return res.status(400).json({ error: 'Name, email, password, and user type are required' });
  }

  if (!global.mockUsers) {
    global.mockUsers = [];
  }

  // Check if user already exists
  const existingUser = global.mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, this should be hashed
    userType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  global.mockUsers.push(newUser);

  res.json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType
    }
  });
});

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!global.mockUsers) {
    global.mockUsers = [];
  }

  // Find user by email
  const user = global.mockUsers.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In production, verify password hash
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    message: 'Sign in successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!global.mockUsers) {
    global.mockUsers = [];
  }

  const user = global.mockUsers.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
