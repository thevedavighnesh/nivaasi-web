import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  const payload = {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    node_env: process.env.NODE_ENV || 'development'
  };
  console.log('✅ Health check hit:', payload);
  res.status(200).json(payload);
});

app.get('/', (req, res) => {
  console.log('📡 Root endpoint hit');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  console.log(`🔁 SPA fallback for ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global mock data storage
if (!global.mockUsers) global.mockUsers = [];
if (!global.mockProperties) global.mockProperties = [];
if (!global.mockTenants) global.mockTenants = [];
if (!global.mockPayments) global.mockPayments = [];
if (!global.mockMaintenanceRequests) global.mockMaintenanceRequests = [];
if (!global.mockReminders) global.mockReminders = [];
if (!global.mockTenantNotifications) global.mockTenantNotifications = {};
if (!global.mockConnectionCodes) global.mockConnectionCodes = [];

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Body:', req.body);
  console.error('Stack Trace:', err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); // Exit on unhandled exceptions
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

// Property management endpoints
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

app.post('/api/properties/add', (req, res) => {
  const requestId = Date.now();
  console.log(`[${requestId}] Received property creation request:`, req.body);
  
  try {
    const { name, address, property_type, total_units, ownerEmail } = req.body;

    if (!name || !address || !ownerEmail) {
      const errorMsg = 'Name, address, and owner email are required';
      console.error(`[${requestId}] ${errorMsg}`);
      return res.status(400).json({ 
        success: false,
        error: errorMsg 
      });
    }

    // Initialize mockProperties if it doesn't exist
    if (!global.mockProperties) {
      console.log(`[${requestId}] Initializing mockProperties array`);
      global.mockProperties = [];
    }

    // Ensure mockUsers is initialized
    if (!global.mockUsers || !Array.isArray(global.mockUsers)) {
      global.mockUsers = [];
      console.log(`[${requestId}] Initialized empty mockUsers array`);
    }
    
    // Find owner by email
    const owner = global.mockUsers.find(u => {
      try {
        return u && u.email === ownerEmail && u.userType === 'owner';
      } catch (e) {
        console.error(`[${requestId}] Error checking user:`, e);
        return false;
      }
    });
    
    if (!owner) {
      const errorMsg = `Owner not found for email: ${ownerEmail}`;
      console.error(`[${requestId}] ${errorMsg}`);
      console.error(`[${requestId}] Available users:`, global.mockUsers.map(u => ({
        email: u?.email,
        userType: u?.userType
      })));
      
      return res.status(404).json({
        success: false,
        error: errorMsg
      });
    }
    
    const newProperty = {
      id: Date.now().toString(),
      name,
      address,
      propertyType: property_type || 'apartment',
      totalUnits: parseInt(total_units) || 1,
      occupied_units: 0,
      available_units: parseInt(total_units) || 1,
      ownerId: owner.id,
      ownerEmail,
      rentAmount: 0, // Default value, can be updated later
      createdAt: new Date().toISOString()
    };
    
    console.log(`[${requestId}] Creating new property:`, newProperty);
    
    try {
      // Add the new property
      global.mockProperties.push(newProperty);
      console.log(`[${requestId}] Successfully added property. Total properties:`, global.mockProperties.length);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Property added successfully',
        property: newProperty
      });
      
      console.log(`[${requestId}] Property creation successful`);
    } catch (error) {
      console.error(`[${requestId}] Error adding property to mockProperties:`, error);
      throw error; // Let the outer catch handle this
    }
  } catch (error) {
    console.error(`[${requestId}] Error in property creation:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create property',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    console.error(`[${requestId}] Property creation failed`);
  }
});

// Generate connection code
app.post('/api/properties/generate-code', (req, res) => {
  const { propertyId, unit, rentAmount } = req.body;

  if (!propertyId || !unit || !rentAmount) {
    return res.status(400).json({ error: 'Property ID, unit, and rent amount are required' });
  }

  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }

  // Generate a 6-character alphanumeric code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const connectionCode = {
    code,
    propertyId,
    unit,
    rentAmount,
    isUsed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };

  global.mockConnectionCodes.push(connectionCode);

  res.json({
    message: 'Connection code generated successfully',
    code: connectionCode.code,
    expiresAt: connectionCode.expiresAt
  });
});

// Validate connection code
app.get('/api/tenants/validate-code', (req, res) => {
  const { connectionCode } = req.query;

  if (!connectionCode) {
    return res.status(400).json({ error: 'Connection code is required' });
  }

  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }

  const codeData = global.mockConnectionCodes.find(c => c.code === connectionCode);

  if (!codeData) {
    return res.status(404).json({ error: 'Invalid connection code' });
  }

  // Check if code is expired
  if (new Date() > new Date(codeData.expiresAt)) {
    return res.status(400).json({ error: 'Connection code has expired', expired: true });
  }

  // Check if code is already used
  if (codeData.isUsed) {
    return res.status(400).json({ error: 'Connection code has already been used', used: true });
  }

  // Find the property
  const property = global.mockProperties.find(p => p.id === codeData.propertyId);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  res.json({
    valid: true,
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      unit: codeData.unit,
      rentAmount: codeData.rentAmount
    },
    expiresAt: codeData.expiresAt
  });
});

// Connect with connection code
app.post('/api/tenants/connect-with-code', (req, res) => {
  const { code, tenantEmail } = req.body;

  if (!code || !tenantEmail) {
    return res.status(400).json({ error: 'Connection code and tenant email are required' });
  }

  if (!global.mockUsers) {
    global.mockUsers = [];
  }

  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  // Find the user to get their name
  const user = global.mockUsers.find(u => u.email === tenantEmail);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Find the connection code
  const codeIndex = global.mockConnectionCodes.findIndex(c => c.code === code);

  if (codeIndex === -1) {
    return res.status(404).json({ error: 'Invalid connection code' });
  }

  const codeData = global.mockConnectionCodes[codeIndex];

  // Check if code is expired
  if (new Date() > new Date(codeData.expiresAt)) {
    return res.status(400).json({ error: 'Connection code has expired' });
  }

  // Check if code is already used
  if (codeData.isUsed) {
    return res.status(400).json({ error: 'Connection code has already been used' });
  }

  // Find the property
  const property = global.mockProperties.find(p => p.id === codeData.propertyId);

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Check if unit is already occupied
  const existingTenant = global.mockTenants.find(t => t.propertyId === codeData.propertyId && t.unit === codeData.unit);

  if (existingTenant) {
    return res.status(400).json({ error: 'Unit is already occupied' });
  }

  // Create tenant record
  const newTenant = {
    id: Date.now().toString(),
    email: tenantEmail,
    name: user.name,
    propertyId: codeData.propertyId,
    unit: codeData.unit,
    rent_amount: codeData.rentAmount,
    rent_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    rent_status: 'pending',
    move_in_date: new Date().toISOString(),
    connection_code: code,
    createdAt: new Date().toISOString()
  };

  global.mockTenants.push(newTenant);

  // Mark code as used
  codeData.isUsed = true;
  codeData.usedAt = new Date().toISOString();
  codeData.usedBy = tenantEmail;

  // Update property occupancy
  property.occupied_units += 1;
  property.available_units -= 1;

  res.json({
    message: 'Successfully connected to property!',
    property: {
      id: property.id,
      name: property.name,
      address: property.address,
      unit: codeData.unit,
      rentAmount: codeData.rentAmount
    }
  });
});

// Owner dashboard
app.get('/api/owners/dashboard', async (req, res, next) => {
  const requestId = Date.now();
  console.log(`[${requestId}] === START: Dashboard Request ===`);
  
  try {
    console.log(`[${requestId}] Request query:`, req.query);
    
    const { ownerEmail } = req.query;

    if (!ownerEmail) {
      const error = new Error('Owner email is required');
      error.status = 400;
      throw error;
    }
    
    // Ensure all required collections are initialized
    global.mockUsers = global.mockUsers || [];
    global.mockProperties = global.mockProperties || [];
    global.mockTenants = global.mockTenants || [];
    global.mockPayments = global.mockPayments || [];
    global.mockMaintenanceRequests = global.mockMaintenanceRequests || [];
    global.mockReminders = global.mockReminders || [];
    
    console.log(`[${requestId}] Global data counts:`, {
      users: global.mockUsers.length,
      properties: global.mockProperties.length,
      tenants: global.mockTenants.length,
      payments: global.mockPayments.length,
      maintenance: global.mockMaintenanceRequests.length,
      reminders: global.mockReminders.length
    });
    
    // Find owner by email
    const owner = global.mockUsers.find(u => {
      try {
        return u && u.email === ownerEmail && u.userType === 'owner';
      } catch (e) {
        console.error(`[${requestId}] Error checking user:`, e);
        return false;
      }
    });
    
    if (!owner) {
      console.error(`[${requestId}] Owner not found for email: ${ownerEmail}`);
      console.error(`[${requestId}] Available users:`, global.mockUsers.map(u => ({
        email: u?.email,
        userType: u?.userType
      })));
      
      // Return a valid response with empty data
      return res.json({
        success: true,
        stats: {
          totalProperties: 0,
          totalTenants: 0,
          totalRent: 0,
          pendingPayments: 0
        },
        properties: [],
        recentTenants: [],
        recentMaintenance: [],
        upcomingReminders: []
      });
    }
    
    console.log(`[${requestId}] Found owner:`, { 
      id: owner.id, 
      email: owner.email,
      name: owner.name || 'N/A'
    });
    
    // Find owner's properties
    const ownerProperties = global.mockProperties.filter(p => 
      p.ownerId === owner.id || p.ownerEmail === owner.email
    );
    console.log(`[${requestId}] Found ${ownerProperties.length} properties for owner`);
    
    // Get all tenants for owner's properties
    const propertyIds = ownerProperties.map(p => p.id);
    const ownerTenants = global.mockTenants.filter(t => t.propertyId && propertyIds.includes(t.propertyId));
    console.log(`[${requestId}] Found ${ownerTenants.length} tenants for owner's properties`);
    
    // Calculate total rent with proper null checks
    const totalRent = ownerProperties.reduce((sum, p) => {
      try {
        const propertyTenants = ownerTenants.filter(t => t.propertyId === p.id).length;
        const rentAmount = parseFloat(p.rentAmount) || 0;
        return sum + (rentAmount * propertyTenants);
      } catch (error) {
        console.error(`[${requestId}] Error calculating rent for property ${p.id}:`, error);
        return sum;
      }
    }, 0);
    
    // Get pending payments with null checks
    const pendingPayments = global.mockPayments.filter(p => {
      try {
        return p && 
               p.propertyId && 
               p.status === 'pending' &&
               propertyIds.includes(p.propertyId);
      } catch (error) {
        console.error(`[${requestId}] Error processing payment:`, p, error);
        return false;
      }
    });
    
    // Get recent maintenance requests
    const recentMaintenance = (global.mockMaintenanceRequests || [])
      .filter(req => req && req.propertyId && propertyIds.includes(req.propertyId))
      .sort((a, b) => {
        try {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 5);
    
    // Get upcoming reminders
    const upcomingReminders = (global.mockReminders || [])
      .filter(r => r && r.userId === owner.id && new Date(r.dueDate) >= new Date())
      .sort((a, b) => {
        try {
          return new Date(a.dueDate) - new Date(b.dueDate);
        } catch (e) {
          return 0;
        }
      });
    
    // Prepare dashboard data with default values
    const dashboardData = {
      success: true,
      stats: {
        totalProperties: ownerProperties.length || 0,
        totalTenants: ownerTenants.length || 0,
        totalRent: totalRent || 0,
        pendingPayments: pendingPayments.length || 0
      },
      properties: Array.isArray(ownerProperties) ? ownerProperties : [],
      recentTenants: Array.isArray(ownerTenants) ? ownerTenants.slice(0, 5) : [],
      recentMaintenance: Array.isArray(recentMaintenance) ? recentMaintenance : [],
      upcomingReminders: Array.isArray(upcomingReminders) ? upcomingReminders : [],
      tenants: Array.isArray(ownerTenants) ? ownerTenants : []
    };
    
    // Add success flag to the response
    dashboardData.success = true;
    
    console.log(`[${requestId}] Dashboard data prepared successfully`);
    console.log(`[${requestId}] Stats:`, dashboardData.stats);
    console.log(`[${requestId}] Properties count:`, dashboardData.properties.length);
    console.log(`[${requestId}] Tenants count:`, dashboardData.recentTenants.length);
    console.log(`[${requestId}] Maintenance requests:`, dashboardData.recentMaintenance.length);
    console.log(`[${requestId}] Upcoming reminders:`, dashboardData.upcomingReminders.length);
    
    res.json(dashboardData);
    console.log(`[${requestId}] === END: Dashboard Request (Success) ===`);
    
  } catch (error) {
    console.error(`[${requestId}] === ERROR in owner dashboard ===`);
    console.error(`[${requestId}] Error details:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.error(`[${requestId}] Request details:`, {
      url: req.url,
      method: req.method,
      query: req.query,
      body: req.body
    });
    
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      success: false,
      error: statusCode === 500 ? 'Internal server error' : error.message,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    console.log(`[${requestId}] === END: Dashboard Request (Error) ===`);
  }
});

// Tenant dashboard
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
      rent_status: tenant.rent_status // Use the actual rent status from the tenant record
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

// Get tenants list for owner
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

  // Get tenants for owner's properties
  const ownerProperties = global.mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);

  const ownerTenants = global.mockTenants.filter(t => propertyIds.includes(t.propertyId));

  // Enrich tenant data with property information
  const enrichedTenants = ownerTenants.map(tenant => {
    const property = ownerProperties.find(p => p.id === tenant.propertyId);
    return {
      ...tenant,
      property_name: property?.name || 'Unknown Property',
      address: property?.address || 'Unknown Address'
    };
  });

  res.json({ tenants: enrichedTenants });
});

// Get occupied units for a property
app.get('/api/properties/occupied-units', (req, res) => {
  const { propertyId } = req.query;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const occupiedUnits = global.mockTenants
    .filter(t => t.propertyId === propertyId)
    .map(t => t.unit);

  res.json({ occupiedUnits });
});

// Add tenant endpoint
app.post('/api/tenants/add', (req, res) => {
  const { propertyId, tenantEmail, unit, rentAmount, rentDueDate } = req.body;

  if (!propertyId || !tenantEmail || !unit || !rentAmount) {
    return res.status(400).json({ error: 'Property ID, tenant email, unit, and rent amount are required' });
  }

  if (!global.mockUsers) {
    global.mockUsers = [];
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  // Check if user exists
  const user = global.mockUsers.find(u => u.email === tenantEmail);
  if (!user) {
    return res.status(404).json({ error: 'User not found. Please sign up first.' });
  }

  // Check if property exists
  const property = global.mockProperties.find(p => p.id === propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Check if unit is already occupied
  const existingTenant = global.mockTenants.find(t => t.propertyId === propertyId && t.unit === unit);
  if (existingTenant) {
    return res.status(400).json({ error: 'Unit is already occupied' });
  }

  // Create tenant
  const newTenant = {
    id: Date.now().toString(),
    email: tenantEmail,
    name: user.name,
    propertyId,
    unit,
    rent_amount: rentAmount,
    rent_due_date: rentDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    rent_status: 'pending',
    move_in_date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  global.mockTenants.push(newTenant);

  // Update property occupancy
  property.occupied_units += 1;
  property.available_units = property.total_units - property.occupied_units;

  res.json({
    message: 'Tenant added successfully',
    tenant: newTenant
  });
});

// Owner notifications endpoint
app.get('/api/notifications/owner', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  // For now, return empty notifications
  // This can be expanded later with real notification logic
  res.json({
    notifications: [],
    unreadCount: 0
  });
});

// Maintenance endpoints
app.get('/api/maintenance/owner', (req, res) => {
  const { ownerEmail } = req.query;

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  // Filter maintenance requests for owner's properties
  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const ownerProperties = global.mockProperties.filter(p => p.ownerEmail === ownerEmail);
  const propertyIds = ownerProperties.map(p => p.id);

  const ownerRequests = global.mockMaintenanceRequests.filter(r => propertyIds.includes(r.propertyId));

  // Enrich with property and tenant info
  const enrichedRequests = ownerRequests.map(request => {
    const property = ownerProperties.find(p => p.id === request.propertyId);
    const tenant = global.mockTenants.find(t => t.id === request.tenantId);

    return {
      ...request,
      property_name: property?.name || 'Unknown Property',
      property_address: property?.address || 'Unknown Address',
      tenant_name: tenant?.name || 'Unknown Tenant',
      unit_number: tenant?.unit || 'N/A'
    };
  });

  res.json({ requests: enrichedRequests });
});

// Record payment endpoint
app.post('/api/payments/record', (req, res) => {
  const { tenantEmail, amount, paymentDate, paymentMethod, notes } = req.body;

  if (!tenantEmail || !amount) {
    return res.status(400).json({ error: 'Tenant email and amount are required' });
  }

  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  const payment = {
    id: Date.now().toString(),
    tenantEmail,
    amount: parseFloat(amount),
    payment_method: paymentMethod || 'cash',
    paid_date: paymentDate || new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: notes || 'Payment recorded via owner dashboard',
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
    message: 'Payment recorded successfully',
    payment
  });
});

// Send reminder endpoint
app.post('/api/reminders/send', (req, res) => {
  const { tenantId, message, reminderType } = req.body;

  if (!tenantId || !message) {
    return res.status(400).json({ error: 'Tenant ID and message are required' });
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  if (!global.mockReminders) {
    global.mockReminders = [];
  }

  // Find the tenant
  const tenant = global.mockTenants.find(t => t.id === tenantId);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  // Create reminder record
  const reminder = {
    id: Date.now().toString(),
    tenantId,
    tenantEmail: tenant.email,
    tenantName: tenant.name,
    message,
    type: reminderType || 'general',
    status: 'sent',
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  global.mockReminders.push(reminder);

  // Create notification for tenant
  if (!global.mockNotifications) {
    global.mockNotifications = [];
  }

  const tenantNotification = {
    id: Date.now().toString() + '_notif',
    tenantEmail: tenant.email,
    type: reminderType || 'general',
    title: 'New Reminder from Owner',
    message: message,
    read: false,
    createdAt: new Date().toISOString(),
    relatedId: reminder.id,
    relatedType: 'reminder',
    owner_name: 'Property Owner' // You can get actual owner name if needed
  };

  global.mockNotifications.push(tenantNotification);
  console.log('Created notification for tenant:', tenant.email);

  res.json({
    message: 'Reminder sent successfully',
    reminder: {
      id: reminder.id,
      tenant: {
        name: tenant.name,
        email: tenant.email
      },
      sentAt: reminder.sentAt
    }
  });
});

// Update user profile endpoint
app.post('/api/users/update-profile', (req, res) => {
  const { email, name, phone } = req.body;

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

  // Update user data
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  user.updatedAt = new Date().toISOString();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType
    }
  });
});

// Maintenance update status endpoint
app.post('/api/maintenance/update-status', (req, res) => {
  const { requestId, status, ownerEmail } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ error: 'Request ID and status are required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  const request = global.mockMaintenanceRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Maintenance request not found' });
  }

  // Update the status
  request.status = status;
  request.updatedAt = new Date().toISOString();

  // If completed, add completed date
  if (status === 'completed') {
    request.completedAt = new Date().toISOString();
  }

  res.json({
    message: 'Status updated successfully',
    request: {
      id: request.id,
      title: request.title,
      status: request.status,
      updatedAt: request.updatedAt
    }
  });
});

// Get tenant notifications
app.get('/api/notifications/tenant', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockReminders) {
    global.mockReminders = [];
  }

  // Filter reminders for this tenant
  const tenantReminders = global.mockReminders.filter(r => r.tenantEmail === tenantEmail);

  // Convert reminders to notifications format
  const notifications = tenantReminders.map(reminder => ({
    id: reminder.id,
    type: reminder.type || 'general',
    message: reminder.message,
    read: false, // For now, mark all as unread
    owner_name: 'Property Owner',
    sent_at: reminder.sentAt,
    createdAt: reminder.createdAt
  }));

  res.json({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  });
});

// Mark notification as read
app.post('/api/notifications/mark-read', (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  // For now, just return success (no persistent storage of read status)
  res.json({ message: 'Notification marked as read' });
});

// Get payment history for tenant
app.get('/api/payments/history', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  // Filter payments for this tenant
  const tenantPayments = global.mockPayments.filter(p => p.tenantEmail === tenantEmail);

  res.json({
    payments: tenantPayments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      paid_date: payment.paid_date,
      status: payment.status,
      notes: payment.notes,
      createdAt: payment.createdAt
    }))
  });
});

// Get tenant maintenance requests
app.get('/api/maintenance/tenant', (req, res) => {
  const { tenantEmail } = req.query;

  if (!tenantEmail) {
    return res.status(400).json({ error: 'Tenant email is required' });
  }

  if (!global.mockMaintenanceRequests) {
    global.mockMaintenanceRequests = [];
  }

  // Filter maintenance requests for this tenant
  const tenantRequests = global.mockMaintenanceRequests.filter(r => r.tenantEmail === tenantEmail);

  res.json({
    requests: tenantRequests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      priority: request.priority || 'medium',
      status: request.status || 'pending',
      created_at: request.createdAt,
      updated_at: request.updatedAt,
      property_name: 'Property Name', // Would need to join with property data
      unit_number: request.unit || 'N/A'
    }))
  });
});

// Submit maintenance request
app.post('/api/maintenance/submit', (req, res) => {
  const requestId = Date.now();
  console.log(`[${requestId}] Received maintenance request submission:`, req.body);
  
  try {
    const { tenantEmail, title, description, priority } = req.body;

    if (!tenantEmail || !title || !description) {
      return res.status(400).json({ 
        error: 'Tenant email, title, and description are required',
        details: 'Missing required fields'
      });
    }

    // Initialize maintenance requests array
    if (!global.mockMaintenanceRequests) {
      global.mockMaintenanceRequests = [];
    }

    // Find tenant to get property info
    if (!global.mockTenants) {
      global.mockTenants = [];
    }

    const tenant = global.mockTenants.find(t => t.email === tenantEmail);
    if (!tenant) {
      console.error(`[${requestId}] Tenant not found:`, tenantEmail);
      return res.status(404).json({ 
        error: 'Tenant not found',
        details: 'Please ensure you are connected to a property'
      });
    }

    // Create maintenance request
    const maintenanceRequest = {
      id: Date.now().toString(),
      tenantEmail,
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      title,
      description,
      priority: priority || 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    global.mockMaintenanceRequests.push(maintenanceRequest);
    
    console.log(`[${requestId}] Maintenance request created successfully:`, maintenanceRequest.id);

    // Find property to get owner email
    if (!global.mockProperties) {
      global.mockProperties = [];
    }
    
    const property = global.mockProperties.find(p => p.id === tenant.propertyId);
    console.log(`[${requestId}] Looking for property with ID:`, tenant.propertyId);
    console.log(`[${requestId}] Found property:`, property ? property.name : 'NOT FOUND');
    
    if (property && property.ownerEmail) {
      // Initialize notifications array
      if (!global.mockNotifications) {
        global.mockNotifications = [];
      }

      // Create notification for owner
      const ownerNotification = {
        id: Date.now().toString() + '_notif',
        ownerEmail: property.ownerEmail,
        type: 'maintenance',
        title: 'New Maintenance Request',
        message: `${tenant.name || tenantEmail} submitted a maintenance request: "${title}"`,
        priority: priority || 'medium',
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: maintenanceRequest.id,
        relatedType: 'maintenance_request'
      };

      global.mockNotifications.push(ownerNotification);
      console.log(`[${requestId}] ✅ Created notification for owner:`, property.ownerEmail);
      console.log(`[${requestId}] Total notifications in system:`, global.mockNotifications.length);
    } else {
      console.log(`[${requestId}] ⚠️ Could not create notification - property or ownerEmail not found`);
    }

    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully',
      request: maintenanceRequest
    });
  } catch (error) {
    console.error(`[${requestId}] Error submitting maintenance request:`, error);
    res.status(500).json({ 
      error: 'Failed to submit maintenance request',
      details: error.message
    });
  }
});

// Get owner notifications
app.get('/api/notifications/owner', (req, res) => {
  const { ownerEmail } = req.query;
  const requestId = Date.now();

  console.log(`[${requestId}] 📬 Fetching notifications for owner:`, ownerEmail);

  if (!ownerEmail) {
    return res.status(400).json({ error: 'Owner email is required' });
  }

  if (!global.mockNotifications) {
    global.mockNotifications = [];
    console.log(`[${requestId}] Initialized empty notifications array`);
  }

  console.log(`[${requestId}] Total notifications in system:`, global.mockNotifications.length);
  if (global.mockNotifications.length > 0) {
    console.log(`[${requestId}] All notifications:`, global.mockNotifications.map(n => ({
      id: n.id,
      ownerEmail: n.ownerEmail,
      tenantEmail: n.tenantEmail,
      type: n.type,
      message: n.message ? n.message.substring(0, 50) : 'no message'
    })));
  }

  // Filter notifications for this owner
  const ownerNotifications = global.mockNotifications.filter(n => n.ownerEmail === ownerEmail);

  console.log(`[${requestId}] ✅ Found ${ownerNotifications.length} notifications for owner:`, ownerEmail);

  res.json({
    notifications: ownerNotifications,
    unreadCount: ownerNotifications.filter(n => !n.read).length
  });
});

// Test endpoint to create a sample notification
app.post('/api/notifications/test', (req, res) => {
  const { ownerEmail } = req.body;
  
  if (!global.mockNotifications) {
    global.mockNotifications = [];
  }
  
  const testNotification = {
    id: Date.now().toString() + '_test',
    ownerEmail: ownerEmail || 'test@owner.com',
    type: 'maintenance',
    title: 'Test Notification',
    message: 'This is a test maintenance notification',
    priority: 'high',
    read: false,
    createdAt: new Date().toISOString(),
    relatedId: 'test123',
    relatedType: 'maintenance_request'
  };
  
  global.mockNotifications.push(testNotification);
  console.log('✅ Created test notification. Total notifications:', global.mockNotifications.length);
  
  res.json({
    success: true,
    message: 'Test notification created',
    notification: testNotification,
    totalNotifications: global.mockNotifications.length
  });
});

// Submit tenant payment
app.post('/api/payments/submit', (req, res) => {
  const { tenantEmail, amount, paymentMethod, notes } = req.body;

  if (!tenantEmail || !amount) {
    return res.status(400).json({ error: 'Tenant email and amount are required' });
  }

  if (!global.mockPayments) {
    global.mockPayments = [];
  }

  const payment = {
    id: Date.now().toString(),
    tenantEmail,
    amount: parseFloat(amount),
    payment_method: paymentMethod || 'cash',
    paid_date: new Date().toISOString().split('T')[0],
    status: 'pending', // Tenant payments start as pending, owner needs to approve
    notes: notes || 'Payment submitted by tenant',
    createdAt: new Date().toISOString()
  };

  global.mockPayments.push(payment);

  // Update tenant rent status if payment amount matches rent
  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const tenant = global.mockTenants.find(t => t.email === tenantEmail);
  if (tenant && parseFloat(amount) >= parseFloat(tenant.rent_amount)) {
    // Don't automatically mark as paid - let owner approve first
    // tenant.rent_status = 'pending_approval';
  }

  res.json({
    message: 'Payment submitted successfully. Waiting for owner approval.',
    payment
  });
});

// Remove tenant endpoint
app.post('/api/tenants/remove', (req, res) => {
  const { tenantId } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const tenantIndex = global.mockTenants.findIndex(t => t.id === tenantId);

  if (tenantIndex === -1) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const removedTenant = global.mockTenants.splice(tenantIndex, 1)[0];

  // Update property occupancy
  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  const property = global.mockProperties.find(p => p.id === removedTenant.propertyId);
  if (property) {
    property.occupied_units = Math.max(0, property.occupied_units - 1);
    property.available_units = property.total_units - property.occupied_units;
  }

  // Remove tenant payments
  if (!global.mockPayments) {
    global.mockPayments = [];
  }
  const initialPaymentCount = global.mockPayments.length;
  global.mockPayments = global.mockPayments.filter(p => p.tenantEmail !== removedTenant.email);

  // Remove tenant reminders
  if (!global.mockReminders) {
    global.mockReminders = [];
  }
  const initialReminderCount = global.mockReminders.length;
  global.mockReminders = global.mockReminders.filter(r => r.tenantEmail !== removedTenant.email);

  console.log(`Removed tenant ${removedTenant.name}: ${initialPaymentCount - global.mockPayments.length} payments, ${initialReminderCount - global.mockReminders.length} reminders`);

  res.json({
    message: 'Tenant removed successfully',
    tenant: removedTenant,
    cleanup: {
      paymentsRemoved: initialPaymentCount - global.mockPayments.length,
      remindersRemoved: initialReminderCount - global.mockReminders.length
    }
  });
});

// Remove property endpoint
app.delete('/api/properties/remove/:id', (req, res) => {
  const { id } = req.params;

  if (!global.mockProperties) {
    global.mockProperties = [];
  }

  const propertyIndex = global.mockProperties.findIndex(p => p.id === id);

  if (propertyIndex === -1) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Check if property has tenants
  if (!global.mockTenants) {
    global.mockTenants = [];
  }

  const propertyTenants = global.mockTenants.filter(t => t.propertyId === id);

  if (propertyTenants.length > 0) {
    return res.status(400).json({
      error: 'Cannot delete property with active tenants',
      details: `${propertyTenants.length} tenant(s) still assigned to this property`
    });
  }

  const deletedProperty = global.mockProperties.splice(propertyIndex, 1)[0];

  // Remove all connection codes for this property
  if (!global.mockConnectionCodes) {
    global.mockConnectionCodes = [];
  }
  const initialCodeCount = global.mockConnectionCodes.length;
  global.mockConnectionCodes = global.mockConnectionCodes.filter(c => c.propertyId !== id);

  console.log(`Removed property ${deletedProperty.name}: ${initialCodeCount - global.mockConnectionCodes.length} connection codes`);

  res.json({
    message: 'Property removed successfully',
    property: deletedProperty,
    cleanup: {
      connectionCodesRemoved: initialCodeCount - global.mockConnectionCodes.length
    }
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
