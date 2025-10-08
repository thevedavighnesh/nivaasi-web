import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    const tenantId = searchParams.get('tenant_id');
    
    if (ownerId) {
      // Owner dashboard stats
      const [stats] = await sql.transaction([
        // Total properties count
        sql`SELECT COUNT(*) as total_properties FROM properties WHERE owner_id = ${ownerId}`,
        // Total tenants count  
        sql`
          SELECT COUNT(t.*) as total_tenants 
          FROM tenants t 
          JOIN properties p ON t.property_id = p.id 
          WHERE p.owner_id = ${ownerId} AND t.status = 'active'
        `,
        // Monthly income
        sql`
          SELECT COALESCE(SUM(t.rent_amount), 0) as monthly_income
          FROM tenants t 
          JOIN properties p ON t.property_id = p.id 
          WHERE p.owner_id = ${ownerId} AND t.status = 'active'
        `,
        // Pending payments count and amount
        sql`
          SELECT 
            COUNT(*) as pending_count,
            COALESCE(SUM(pay.amount), 0) as pending_amount
          FROM payments pay
          JOIN tenants t ON pay.tenant_id = t.id
          JOIN properties p ON t.property_id = p.id
          WHERE p.owner_id = ${ownerId} AND pay.status = 'pending'
        `,
        // Overdue payments count and amount
        sql`
          SELECT 
            COUNT(*) as overdue_count,
            COALESCE(SUM(pay.amount), 0) as overdue_amount
          FROM payments pay
          JOIN tenants t ON pay.tenant_id = t.id
          JOIN properties p ON t.property_id = p.id
          WHERE p.owner_id = ${ownerId} AND pay.status = 'overdue'
        `,
        // This month's collected amount
        sql`
          SELECT COALESCE(SUM(pay.amount), 0) as collected_amount
          FROM payments pay
          JOIN tenants t ON pay.tenant_id = t.id
          JOIN properties p ON t.property_id = p.id
          WHERE p.owner_id = ${ownerId} 
          AND pay.status = 'paid' 
          AND EXTRACT(MONTH FROM pay.paid_date) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM pay.paid_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `,
        // Recent payments
        sql`
          SELECT 
            pay.*,
            u.name as tenant_name,
            prop.name as property_name,
            t.unit_number
          FROM payments pay
          JOIN tenants t ON pay.tenant_id = t.id
          JOIN users u ON t.user_id = u.id
          JOIN properties prop ON t.property_id = prop.id
          WHERE prop.owner_id = ${ownerId}
          ORDER BY pay.created_at DESC
          LIMIT 5
        `
      ]);

      const dashboardData = {
        totalProperties: parseInt(stats[0][0].total_properties),
        totalTenants: parseInt(stats[1][0].total_tenants),
        monthlyIncome: parseFloat(stats[2][0].monthly_income),
        pendingPayments: {
          count: parseInt(stats[3][0].pending_count),
          amount: parseFloat(stats[3][0].pending_amount)
        },
        overduePayments: {
          count: parseInt(stats[4][0].overdue_count),
          amount: parseFloat(stats[4][0].overdue_amount)
        },
        collectedThisMonth: parseFloat(stats[5][0].collected_amount),
        recentPayments: stats[6]
      };

      return Response.json({ dashboard: dashboardData });
    } else if (tenantId) {
      // Tenant dashboard stats
      const [stats] = await sql.transaction([
        // Tenant details
        sql`
          SELECT 
            t.*,
            u.name,
            u.email,
            u.phone,
            p.name as property_name,
            p.address as property_address
          FROM tenants t
          JOIN users u ON t.user_id = u.id
          JOIN properties p ON t.property_id = p.id
          WHERE t.id = ${tenantId}
        `,
        // Next payment due
        sql`
          SELECT * FROM payments 
          WHERE tenant_id = ${tenantId} AND status = 'pending'
          ORDER BY due_date ASC
          LIMIT 1
        `,
        // Payment history
        sql`
          SELECT * FROM payments 
          WHERE tenant_id = ${tenantId}
          ORDER BY due_date DESC
          LIMIT 10
        `,
        // Total paid this year
        sql`
          SELECT COALESCE(SUM(amount), 0) as total_paid
          FROM payments 
          WHERE tenant_id = ${tenantId} 
          AND status = 'paid' 
          AND EXTRACT(YEAR FROM paid_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `
      ]);

      const dashboardData = {
        tenant: stats[0][0],
        nextPayment: stats[1][0] || null,
        paymentHistory: stats[2],
        totalPaidThisYear: parseFloat(stats[3][0].total_paid)
      };

      return Response.json({ dashboard: dashboardData });
    } else {
      return Response.json({ error: 'Owner ID or Tenant ID is required' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}