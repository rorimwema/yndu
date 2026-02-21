// Admin backend routes
import { Router } from '../../deps.ts';
import { requireAuth } from '../../infrastructure/auth/auth-middleware.ts';
import { db } from '../../infrastructure/config/database.ts';
import { getContainer } from '../../infrastructure/container.ts';
import { UserId } from '../../domain/value-objects/branded.ts';

export const adminRouter = new Router();

type RouteContext = {
  params: Record<string, string>;
  state: Record<string, unknown>;
  request: unknown;
  response: { status?: number; body?: unknown };
};

// Middleware to ensure user is admin
const requireAdmin = async (ctx: RouteContext, next: () => Promise<unknown>) => {
  const container = getContainer();
  const userId = ctx.state.user.sub;
  const currentUser = await container.userRepository.findById(UserId(userId as string));

  if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    ctx.response.status = 403;
    ctx.response.body = { error: 'Forbidden - Admin access required' };
    return;
  }
  await next();
};

// GET /api/admin/dashboard/stats
adminRouter.get('/dashboard/stats', requireAuth, requireAdmin, async (ctx: RouteContext) => {
  try {
    const revenueQuery = await db('orders')
      .sum('total_price_cents as total')
      .whereNot('status', 'cancelled')
      .first();

    const ordersQuery = await db('orders').count('* as total').first();
    const pendingQuery = await db('orders').where('status', 'pending').count('* as total').first();
    const dispatchedQuery = await db('orders').where('status', 'dispatched').count('* as total')
      .first();

    // Quick approximation for delivered today (PostgreSQL dialect)
    const deliveredTodayQuery = await db('orders')
      .where('status', 'delivered')
      .whereRaw('updated_at >= CURRENT_DATE')
      .count('* as total').first();

    // Map DB results
    const totalRevenueCents = parseInt(revenueQuery?.total?.toString() || '0');
    const totalSales = parseInt(ordersQuery?.total?.toString() || '0'); // Assuming 1 sale = 1 order for simplicity
    const totalOrders = parseInt(ordersQuery?.total?.toString() || '0');
    const pendingOrders = parseInt(pendingQuery?.total?.toString() || '0');
    const inTransitOrders = parseInt(dispatchedQuery?.total?.toString() || '0');
    const deliveredToday = parseInt(deliveredTodayQuery?.total?.toString() || '0');

    ctx.response.body = {
      totalRevenue: totalRevenueCents / 100, // Converting cents to base currency units
      totalSales,
      totalOrders,
      netProfit: (totalRevenueCents / 100) * 0.25, // Mock 25% profit margin
      pendingOrders,
      inTransitOrders,
      deliveredToday,
      delayedOrders: 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// GET /api/admin/riders
adminRouter.get('/riders', requireAuth, requireAdmin, async (ctx: RouteContext) => {
  try {
    const riders = await db('users')
      .select('id', 'name', 'phone', 'email', 'created_at')
      .where('role', 'RIDER')
      .orWhere('role', 'LOGISTICS_PARTNER');

    ctx.response.body = riders.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name || 'Unknown Rider',
      phone: r.phone,
      email: r.email,
      status: 'active', // mock status
      assigned: 0, // mock count
      rating: 4.5,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.id}`,
    }));
  } catch (error) {
    console.error('Error fetching riders:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});
