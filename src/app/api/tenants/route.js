import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');
    const ownerId = searchParams.get('owner_id');
    
    let query;
    if (propertyId) {
      query = sql`
        SELECT 
          t.*,
          u.name as tenant_name,
          u.email as tenant_email,
          u.phone as tenant_phone,
          u.profile_image_url,
          p.name as property_name,
          p.address as property_address,
          (
            SELECT COUNT(*) 
            FROM payments pay 
            WHERE pay.tenant_id = t.id AND pay.status = 'pending'
          ) as pending_payments,
          (
            SELECT COUNT(*) 
            FROM payments pay 
            WHERE pay.tenant_id = t.id AND pay.status = 'overdue'
          ) as overdue_payments
        FROM tenants t
        JOIN users u ON t.user_id = u.id
        JOIN properties p ON t.property_id = p.id
        WHERE t.property_id = ${propertyId}
        ORDER BY t.created_at DESC
      `;
    } else if (ownerId) {
      query = sql`
        SELECT 
          t.*,
          u.name as tenant_name,
          u.email as tenant_email,
          u.phone as tenant_phone,
          u.profile_image_url,
          p.name as property_name,
          p.address as property_address,
          (
            SELECT COUNT(*) 
            FROM payments pay 
            WHERE pay.tenant_id = t.id AND pay.status = 'pending'
          ) as pending_payments,
          (
            SELECT COUNT(*) 
            FROM payments pay 
            WHERE pay.tenant_id = t.id AND pay.status = 'overdue'
          ) as overdue_payments
        FROM tenants t
        JOIN users u ON t.user_id = u.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.owner_id = ${ownerId}
        ORDER BY t.created_at DESC
      `;
    } else {
      return Response.json({ error: 'Property ID or Owner ID is required' }, { status: 400 });
    }

    const tenants = await query;
    return Response.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return Response.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name,
      email,
      phone,
      property_id, 
      unit_number, 
      rent_amount, 
      deposit_amount, 
      lease_start_date, 
      lease_end_date 
    } = body;

    if (!name || !email || !phone || !property_id || !rent_amount || !lease_start_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [tenant] = await sql.transaction([
      // First create or find the user
      sql`
        INSERT INTO users (name, email, phone, user_type)
        VALUES (${name}, ${email}, ${phone}, 'tenant')
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `,
      // Then create the tenant record
      sql`
        INSERT INTO tenants (
          user_id, 
          property_id, 
          unit_number, 
          rent_amount, 
          deposit_amount, 
          lease_start_date, 
          lease_end_date
        ) VALUES (
          (SELECT id FROM users WHERE email = ${email}),
          ${property_id}, 
          ${unit_number || ''}, 
          ${rent_amount}, 
          ${deposit_amount || 0}, 
          ${lease_start_date}, 
          ${lease_end_date || null}
        )
        RETURNING *
      `
    ]);

    return Response.json({ tenant: tenant[1] }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return Response.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}