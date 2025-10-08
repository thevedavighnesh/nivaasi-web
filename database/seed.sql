-- Nivasi Database Seed Data
-- Sample data for testing and development

-- Insert sample users (owners and tenants)
INSERT INTO users (name, email, phone, password_hash, user_type) VALUES
  ('Rajesh Kumar', 'rajesh@example.com', '+91-9876543210', '$2a$10$YourHashedPasswordHere', 'owner'),
  ('Priya Sharma', 'priya@example.com', '+91-9876543211', '$2a$10$YourHashedPasswordHere', 'tenant'),
  ('Amit Patel', 'amit@example.com', '+91-9876543212', '$2a$10$YourHashedPasswordHere', 'tenant'),
  ('Sneha Reddy', 'sneha@example.com', '+91-9876543213', '$2a$10$YourHashedPasswordHere', 'tenant'),
  ('Vikram Singh', 'vikram@example.com', '+91-9876543214', '$2a$10$YourHashedPasswordHere', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Insert sample properties
INSERT INTO properties (owner_id, name, address, property_type, rent_amount, deposit_amount, total_units, description) VALUES
  (1, 'Green Valley Apartments', '123 MG Road, Bangalore, Karnataka 560001', 'Apartment', 25000.00, 50000.00, 12, 'Modern apartment complex with amenities'),
  (1, 'Sunrise Villa', '456 Park Street, Mumbai, Maharashtra 400001', 'Villa', 45000.00, 90000.00, 1, 'Luxury villa with garden and parking'),
  (1, 'City Center Plaza', '789 Commercial Street, Pune, Maharashtra 411001', 'Commercial', 35000.00, 70000.00, 8, 'Prime commercial space in city center'),
  (5, 'Lake View Residency', '321 Lake Road, Hyderabad, Telangana 500001', 'Apartment', 28000.00, 56000.00, 15, 'Peaceful lakeside apartments')
ON CONFLICT DO NOTHING;

-- Insert sample tenants
INSERT INTO tenants (user_id, property_id, unit_number, rent_amount, deposit_amount, lease_start_date, lease_end_date, status) VALUES
  (2, 1, 'A-101', 25000.00, 50000.00, '2024-01-01', '2025-01-01', 'active'),
  (3, 1, 'A-102', 25000.00, 50000.00, '2024-02-01', '2025-02-01', 'active'),
  (4, 2, NULL, 45000.00, 90000.00, '2024-01-15', '2025-01-15', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO payments (tenant_id, amount, due_date, paid_date, payment_method, status, notes) VALUES
  -- Tenant 1 payments
  (1, 25000.00, '2024-01-05', '2024-01-03', 'UPI', 'paid', 'January rent'),
  (1, 25000.00, '2024-02-05', '2024-02-04', 'Bank Transfer', 'paid', 'February rent'),
  (1, 25000.00, '2024-03-05', '2024-03-02', 'UPI', 'paid', 'March rent'),
  (1, 25000.00, '2024-04-05', NULL, NULL, 'pending', 'April rent'),
  
  -- Tenant 2 payments
  (2, 25000.00, '2024-02-05', '2024-02-05', 'Cash', 'paid', 'February rent'),
  (2, 25000.00, '2024-03-05', '2024-03-06', 'UPI', 'paid', 'March rent'),
  (2, 25000.00, '2024-04-05', NULL, NULL, 'pending', 'April rent'),
  
  -- Tenant 3 payments
  (3, 45000.00, '2024-01-20', '2024-01-18', 'Bank Transfer', 'paid', 'January rent'),
  (3, 45000.00, '2024-02-20', '2024-02-19', 'Bank Transfer', 'paid', 'February rent'),
  (3, 45000.00, '2024-03-20', NULL, NULL, 'overdue', 'March rent - overdue')
ON CONFLICT DO NOTHING;

-- Insert sample documents
INSERT INTO documents (property_id, tenant_id, uploaded_by, document_type, document_name, document_url, description) VALUES
  (1, 1, 2, 'Lease Agreement', 'lease_agreement_a101.pdf', 'https://example.com/docs/lease1.pdf', 'Signed lease agreement for unit A-101'),
  (1, 1, 2, 'ID Proof', 'aadhar_priya.pdf', 'https://example.com/docs/id1.pdf', 'Aadhar card copy'),
  (1, 2, 3, 'Lease Agreement', 'lease_agreement_a102.pdf', 'https://example.com/docs/lease2.pdf', 'Signed lease agreement for unit A-102'),
  (2, 3, 4, 'Lease Agreement', 'lease_agreement_villa.pdf', 'https://example.com/docs/lease3.pdf', 'Villa lease agreement')
ON CONFLICT DO NOTHING;

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority, status) VALUES
  (1, 1, 'Leaking Faucet', 'Kitchen faucet is leaking continuously', 'medium', 'in_progress'),
  (1, 2, 'AC Not Working', 'Air conditioner in bedroom not cooling', 'high', 'pending'),
  (2, 3, 'Garden Maintenance', 'Garden needs trimming and cleaning', 'low', 'completed')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_id, related_type) VALUES
  (1, 'Payment Received', 'Payment of ₹25,000 received from Priya Sharma', 'payment', true, 1, 'payment'),
  (1, 'New Maintenance Request', 'New maintenance request from unit A-101', 'maintenance', false, 1, 'maintenance'),
  (2, 'Rent Due Reminder', 'Your rent of ₹25,000 is due on April 5th', 'payment', false, 4, 'payment'),
  (3, 'Maintenance Update', 'Your maintenance request has been updated to in-progress', 'maintenance', true, 1, 'maintenance')
ON CONFLICT DO NOTHING;
