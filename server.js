import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🔍 Environment variables:');
console.log('PORT from env:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Final PORT:', PORT);

// Add health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Mock data for development
const mockUsers = [];
const mockProperties = [];
const mockTenants = [];
const mockPayments = [];

// Authentication Routes
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password, userType } = req.body;
  
  if (!name || !email || !password || !userType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    userType,
    createdAt: new Date().toISOString()
  };

  mockUsers.push(newUser);

  res.status(201).json({
    message: 'Account created successfully',
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
    return res.status(400).json({ error: 'Missing email or password' });
  }

  // For demo purposes, accept any email/password combination
  // In production, you'd verify against a database
  const user = mockUsers.find(u => u.email === email) || {
    id: Date.now(),
    name: email.split('@')[0],
    email,
    userType: email.includes('owner') ? 'owner' : 'tenant'
  };

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

// Properties Routes
app.get('/api/properties/list', (req, res) => {
  const { ownerEmail } = req.query;
  const properties = mockProperties.filter(p => p.ownerEmail === ownerEmail);
  res.json({ properties });
});

app.post('/api/properties/add', (req, res) => {
  const { propertyName, address, propertyType, units, ownerEmail } = req.body;
  
  const newProperty = {
    id: Date.now(),
    name: propertyName,
    address,
    property_type: propertyType,
    total_units: units,
    occupied_units: 0,
    available_units: units,
    ownerEmail,
    createdAt: new Date().toISOString()
  };

  mockProperties.push(newProperty);
  res.json({ message: 'Property added successfully', property: newProperty });
});

// Tenants Routes
app.get('/api/tenants/list', (req, res) => {
  const { ownerEmail } = req.query;
  const ownerProperties = mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);
  const tenants = mockTenants.filter(t => propertyIds.includes(t.propertyId));
  res.json({ tenants });
});

app.post('/api/tenants/add', (req, res) => {
  const { propertyId, tenantEmail, unit, rentAmount, rentDueDate } = req.body;
  
  const newTenant = {
    id: Date.now(),
    propertyId,
    email: tenantEmail,
    name: tenantEmail.split('@')[0],
    unit,
    rent_amount: rentAmount,
    rent_due_date: rentDueDate,
    rent_status: 'pending',
    createdAt: new Date().toISOString()
  };

  mockTenants.push(newTenant);
  
  // Update property occupancy
  const property = mockProperties.find(p => p.id === propertyId);
  if (property) {
    property.occupied_units += 1;
    property.available_units -= 1;
  }

  res.json({ message: 'Tenant added successfully', tenant: newTenant });
});

// Payments Routes
app.post('/api/payments/record', (req, res) => {
  const { tenantEmail, amount, paymentDate, paymentMethod, notes } = req.body;
  
  const payment = {
    id: Date.now(),
    tenantEmail,
    amount: parseFloat(amount),
    paymentDate,
    paymentMethod,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  mockPayments.push(payment);
  
  // Update tenant rent status
  const tenant = mockTenants.find(t => t.email === tenantEmail);
  if (tenant) {
    tenant.rent_status = 'paid';
  }

  res.json({ message: 'Payment recorded successfully', payment });
});

// Property Code Generation Routes
app.post('/api/properties/generate-code', (req, res) => {
  const { propertyId, unit, rentAmount } = req.body;
  
  if (!propertyId || !unit || !rentAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate a unique 6-digit code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const connectionCode = {
    id: Date.now(),
    code,
    propertyId,
    unit,
    rentAmount: parseFloat(rentAmount),
    isUsed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };

  // Store the code (in a real app, this would be in a database)
  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }
  global.mockConnectionCodes.push(connectionCode);

  res.json({ 
    message: 'Connection code generated successfully',
    code: connectionCode.code,
    expiresAt: connectionCode.expiresAt
  });
});

// Get occupied units for a property
app.get('/api/properties/occupied-units', (req, res) => {
  const { propertyId } = req.query;
  
  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  const occupiedUnits = mockTenants
    .filter(t => t.propertyId == propertyId)
    .map(t => t.unit)
    .filter(unit => unit);

  res.json({ occupiedUnits });
});

// Tenant connection with code
app.post('/api/tenants/connect-with-code', (req, res) => {
  const { code, tenantEmail } = req.body;
  
  if (!code || !tenantEmail) {
    return res.status(400).json({ error: 'Code and tenant email are required' });
  }

  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }

  const connectionCode = global.mockConnectionCodes.find(c => 
    c.code === code.toUpperCase() && 
    !c.isUsed && 
    new Date(c.expiresAt) > new Date()
  );

  if (!connectionCode) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }

  // Mark code as used
  connectionCode.isUsed = true;

  // Create tenant connection
  const newTenant = {
    id: Date.now(),
    propertyId: connectionCode.propertyId,
    email: tenantEmail,
    name: tenantEmail.split('@')[0],
    unit: connectionCode.unit,
    rent_amount: connectionCode.rentAmount,
    rent_due_date: new Date().toISOString().split('T')[0],
    rent_status: 'pending',
    createdAt: new Date().toISOString()
  };

  mockTenants.push(newTenant);

  // Update property occupancy
  const property = mockProperties.find(p => p.id === connectionCode.propertyId);
  if (property) {
    property.occupied_units += 1;
    property.available_units -= 1;
  }

  res.json({ 
    message: 'Successfully connected to property',
    tenant: newTenant,
    property: property
  });
});

// Maintenance Routes
app.get('/api/maintenance/owner', (req, res) => {
  const { ownerEmail } = req.query;
  
  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  // Get properties owned by this owner
  const ownerProperties = mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);
  
  // Get maintenance requests for these properties
  const requests = global.mockMaintenanceRequests.filter(r => 
    propertyIds.includes(r.propertyId)
  );

  res.json({ requests });
});

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
  request.updatedAt = new Date().toISOString();

  res.json({ 
    message: 'Maintenance request updated successfully',
    request 
  });
});

// Notifications Routes
app.get('/api/notifications/owner', (req, res) => {
  const { ownerEmail } = req.query;
  
  // Mock notifications for development
  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Received',
      message: 'Rent payment received from John Doe',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  res.json({ notifications });
});

app.get('/api/notifications/tenant', (req, res) => {
  const { tenantEmail } = req.query;
  
  // Mock notifications for development
  const notifications = [
    {
      id: 1,
      type: 'maintenance',
      title: 'Maintenance Update',
      message: 'Your maintenance request has been updated',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];

  res.json({ notifications });
});

// Tenant Dashboard Routes
app.get('/api/tenants/dashboard', (req, res) => {
  const { tenantEmail } = req.query;
  
  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  // Find tenant data
  const tenant = mockTenants.find(t => t.email === tenantEmail);
  
  if (!tenant) {
    return res.json({ 
      tenant: null,
      property: null,
      payments: [],
      maintenanceRequests: []
    });
  }

  // Find property data
  const property = mockProperties.find(p => p.id === tenant.propertyId);
  
  // Find payments for this tenant
  const payments = mockPayments.filter(p => p.tenantEmail === tenantEmail);
  
  // Find maintenance requests for this tenant
  const maintenanceRequests = global.mockMaintenanceRequests ? 
    global.mockMaintenanceRequests.filter(r => r.tenantEmail === tenantEmail) : [];

  res.json({
    tenant: {
      ...tenant,
      property_name: property?.name,
      property_address: property?.address
    },
    property,
    payments,
    maintenanceRequests
  });
});

// User profile routes
app.get('/api/users/profile', (req, res) => {
  const { email } = req.query;
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

app.patch('/api/users/profile', (req, res) => {
  const { email, name, phone } = req.body;
  
  const userIndex = mockUsers.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user data
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    name: name || mockUsers[userIndex].name,
    phone: phone || mockUsers[userIndex].phone,
    updatedAt: new Date().toISOString()
  };

  res.json({ 
    message: 'Profile updated successfully',
    user: mockUsers[userIndex]
  });
});

// For all other API routes, return a helpful message
app.use('/api/*', (req, res) => {
  res.status(501).json({ 
    error: 'API endpoint not implemented yet',
    endpoint: req.path,
    method: req.method,
    message: 'This API endpoint is being developed. Please check back later.'
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Web app available`);
  console.log(`🔧 API endpoints available at /api/*`);
  console.log(`📝 Mock API server ready for production`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
