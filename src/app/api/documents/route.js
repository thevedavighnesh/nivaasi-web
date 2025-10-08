import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    const tenantId = searchParams.get('tenant_id');
    const propertyId = searchParams.get('property_id');
    
    let query;
    
    if (ownerId) {
      query = sql`
        SELECT 
          d.*,
          p.name as property_name,
          t.unit_number,
          u.name as tenant_name
        FROM documents d
        LEFT JOIN properties p ON d.property_id = p.id
        LEFT JOIN tenants t ON d.tenant_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE p.owner_id = ${ownerId} OR d.uploaded_by = ${ownerId}
        ORDER BY d.created_at DESC
      `;
    } else if (tenantId) {
      query = sql`
        SELECT 
          d.*,
          p.name as property_name,
          t.unit_number
        FROM documents d
        LEFT JOIN properties p ON d.property_id = p.id
        LEFT JOIN tenants t ON d.tenant_id = t.id
        WHERE d.tenant_id = ${tenantId}
        ORDER BY d.created_at DESC
      `;
    } else if (propertyId) {
      query = sql`
        SELECT 
          d.*,
          t.unit_number,
          u.name as tenant_name
        FROM documents d
        LEFT JOIN tenants t ON d.tenant_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE d.property_id = ${propertyId}
        ORDER BY d.created_at DESC
      `;
    } else {
      return Response.json({ error: 'Owner ID, Tenant ID, or Property ID is required' }, { status: 400 });
    }

    const documents = await query;
    return Response.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      property_id,
      tenant_id,
      uploaded_by,
      document_type,
      document_name,
      document_url,
      file_size,
      mime_type,
      description
    } = body;

    if (!uploaded_by || !document_type || !document_name || !document_url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [document] = await sql`
      INSERT INTO documents (
        property_id,
        tenant_id,
        uploaded_by,
        document_type,
        document_name,
        document_url,
        file_size,
        mime_type,
        description
      ) VALUES (
        ${property_id || null},
        ${tenant_id || null},
        ${uploaded_by},
        ${document_type},
        ${document_name},
        ${document_url},
        ${file_size || null},
        ${mime_type || null},
        ${description || ''}
      )
      RETURNING *
    `;

    return Response.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return Response.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return Response.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await sql`
      DELETE FROM documents WHERE id = ${documentId}
    `;

    return Response.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return Response.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
