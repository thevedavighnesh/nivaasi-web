import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const ownerId = searchParams.get('owner_id');
    const propertyId = searchParams.get('property_id');
    
    let query;
    
    if (tenantId) {
      query = sql`
        SELECT 
          m.*,
          p.name as property_name,
          p.address as property_address
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.id
        WHERE m.tenant_id = ${tenantId}
        ORDER BY 
          CASE m.status 
            WHEN 'pending' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'completed' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          m.created_at DESC
      `;
    } else if (ownerId) {
      query = sql`
        SELECT 
          m.*,
          p.name as property_name,
          p.address as property_address,
          t.unit_number,
          u.name as tenant_name,
          u.phone as tenant_phone
        FROM maintenance_requests m
        JOIN properties p ON m.property_id = p.id
        JOIN tenants t ON m.tenant_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE p.owner_id = ${ownerId}
        ORDER BY 
          CASE m.status 
            WHEN 'pending' THEN 1
            WHEN 'in_progress' THEN 2
            WHEN 'completed' THEN 3
            WHEN 'cancelled' THEN 4
          END,
          CASE m.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          m.created_at DESC
      `;
    } else if (propertyId) {
      query = sql`
        SELECT 
          m.*,
          t.unit_number,
          u.name as tenant_name,
          u.phone as tenant_phone
        FROM maintenance_requests m
        JOIN tenants t ON m.tenant_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE m.property_id = ${propertyId}
        ORDER BY m.created_at DESC
      `;
    } else {
      return Response.json({ error: 'Tenant ID, Owner ID, or Property ID is required' }, { status: 400 });
    }

    const requests = await query;
    return Response.json({ requests });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return Response.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      property_id,
      tenant_id,
      title,
      description,
      priority
    } = body;

    if (!tenant_id || !title || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get property_id from tenant if not provided
    let finalPropertyId = property_id;
    if (!finalPropertyId) {
      const [tenant] = await sql`
        SELECT property_id FROM tenants WHERE id = ${tenant_id}
      `;
      if (tenant) {
        finalPropertyId = tenant.property_id;
      }
    }

    if (!finalPropertyId) {
      return Response.json({ error: 'Property ID could not be determined' }, { status: 400 });
    }

    const [maintenanceRequest] = await sql`
      INSERT INTO maintenance_requests (
        property_id,
        tenant_id,
        title,
        description,
        priority,
        status
      ) VALUES (
        ${finalPropertyId},
        ${tenant_id},
        ${title},
        ${description},
        ${priority || 'medium'},
        'pending'
      )
      RETURNING *
    `;

    return Response.json({ request: maintenanceRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return Response.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      status,
      priority
    } = body;

    if (!id) {
      return Response.json({ error: 'Request ID is required' }, { status: 400 });
    }

    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
      
      // If status is completed, set resolved_at
      if (status === 'completed') {
        updateFields.push(`resolved_at = CURRENT_TIMESTAMP`);
      }
    }

    if (priority !== undefined) {
      updateFields.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const queryText = `
      UPDATE maintenance_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [maintenanceRequest] = await sql(queryText, values);
    return Response.json({ request: maintenanceRequest });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return Response.json({ error: 'Failed to update maintenance request' }, { status: 500 });
  }
}
