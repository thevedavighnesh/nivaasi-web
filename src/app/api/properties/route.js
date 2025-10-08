import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    
    if (!ownerId) {
      return Response.json({ error: 'Owner ID is required' }, { status: 400 });
    }

    const properties = await sql`
      SELECT 
        p.*,
        COUNT(t.id) as tenant_count,
        SUM(CASE WHEN t.status = 'active' THEN p.rent_amount ELSE 0 END) as monthly_income
      FROM properties p
      LEFT JOIN tenants t ON p.id = t.property_id AND t.status = 'active'
      WHERE p.owner_id = ${ownerId}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    return Response.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      owner_id, 
      name, 
      address, 
      property_type, 
      rent_amount, 
      deposit_amount, 
      total_units,
      description,
      image_url 
    } = body;

    if (!owner_id || !name || !address || !property_type || !rent_amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [property] = await sql`
      INSERT INTO properties (
        owner_id, 
        name, 
        address, 
        property_type, 
        rent_amount, 
        deposit_amount, 
        total_units,
        description,
        image_url
      ) VALUES (
        ${owner_id}, 
        ${name}, 
        ${address}, 
        ${property_type}, 
        ${rent_amount}, 
        ${deposit_amount || 0}, 
        ${total_units || 1},
        ${description || ''},
        ${image_url || ''}
      )
      RETURNING *
    `;

    return Response.json({ property }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return Response.json({ error: 'Failed to create property' }, { status: 500 });
  }
}