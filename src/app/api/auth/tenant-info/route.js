import { getToken } from '@auth/core/jwt';
import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https'),
    });

    if (!jwt) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = jwt.sub;

    // Fetch tenant information for this user
    const [tenant] = await sql`
      SELECT 
        t.id as tenant_id,
        t.property_id,
        t.unit_number,
        t.rent_amount,
        t.status,
        p.name as property_name,
        p.address as property_address,
        p.owner_id,
        u_owner.name as owner_name,
        u_owner.phone as owner_phone,
        u_owner.email as owner_email
      FROM tenants t
      JOIN properties p ON t.property_id = p.id
      JOIN users u_owner ON p.owner_id = u_owner.id
      WHERE t.user_id = ${userId} AND t.status = 'active'
      LIMIT 1
    `;

    if (!tenant) {
      return Response.json({ 
        error: 'No active tenancy found for this user',
        tenant_id: null 
      }, { status: 404 });
    }

    return Response.json({
      tenant_id: tenant.tenant_id,
      property_id: tenant.property_id,
      unit_number: tenant.unit_number,
      rent_amount: tenant.rent_amount,
      status: tenant.status,
      property: {
        name: tenant.property_name,
        address: tenant.property_address,
      },
      owner: {
        id: tenant.owner_id,
        name: tenant.owner_name,
        phone: tenant.owner_phone,
        email: tenant.owner_email,
      }
    });
  } catch (error) {
    console.error('Error fetching tenant info:', error);
    return Response.json({ error: 'Failed to fetch tenant info' }, { status: 500 });
  }
}
