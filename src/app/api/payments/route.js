import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const ownerId = searchParams.get('owner_id');
    const status = searchParams.get('status');
    
    let whereClause = '';
    let params = [];
    
    if (tenantId) {
      whereClause = 'WHERE pay.tenant_id = $1';
      params = [tenantId];
    } else if (ownerId) {
      whereClause = 'WHERE p.owner_id = $1';
      params = [ownerId];
    }
    
    if (status && whereClause) {
      whereClause += ' AND pay.status = $2';
      params.push(status);
    } else if (status) {
      whereClause = 'WHERE pay.status = $1';
      params = [status];
    }

    const queryText = `
      SELECT 
        pay.*,
        t.unit_number,
        u.name as tenant_name,
        u.email as tenant_email,
        u.phone as tenant_phone,
        prop.name as property_name,
        prop.address as property_address
      FROM payments pay
      JOIN tenants t ON pay.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN properties prop ON t.property_id = prop.id
      LEFT JOIN properties p ON t.property_id = p.id
      ${whereClause}
      ORDER BY pay.due_date DESC, pay.created_at DESC
    `;

    const payments = await sql(queryText, params);
    return Response.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return Response.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      tenant_id, 
      amount, 
      due_date, 
      paid_date, 
      payment_method, 
      status,
      notes 
    } = body;

    if (!tenant_id || !amount || !due_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [payment] = await sql`
      INSERT INTO payments (
        tenant_id, 
        amount, 
        due_date, 
        paid_date, 
        payment_method, 
        status,
        notes
      ) VALUES (
        ${tenant_id}, 
        ${amount}, 
        ${due_date}, 
        ${paid_date || null}, 
        ${payment_method || null}, 
        ${status || 'pending'},
        ${notes || ''}
      )
      RETURNING *
    `;

    return Response.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return Response.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      amount, 
      due_date, 
      paid_date, 
      payment_method, 
      status,
      notes 
    } = body;

    if (!id) {
      return Response.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      values.push(amount);
      paramCount++;
    }
    if (due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount}`);
      values.push(due_date);
      paramCount++;
    }
    if (paid_date !== undefined) {
      updateFields.push(`paid_date = $${paramCount}`);
      values.push(paid_date);
      paramCount++;
    }
    if (payment_method !== undefined) {
      updateFields.push(`payment_method = $${paramCount}`);
      values.push(payment_method);
      paramCount++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const queryText = `
      UPDATE payments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [payment] = await sql(queryText, values);
    return Response.json({ payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return Response.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}