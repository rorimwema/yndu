// Users routes
import { Router } from '../../deps.ts';
import { getContainer } from '../../infrastructure/container.ts';
import { requireAuth } from '../../infrastructure/auth/auth-middleware.ts';
import { UserId } from '../../domain/value-objects/branded.ts';
import { z } from 'zod';

type RouteContext = {
  params: Record<string, string>;
  state: Record<string, unknown>;
  request: { body: { json: () => Promise<unknown> } };
  response: { status?: number; body?: unknown };
};

export const usersRouter = new Router();

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
});

// GET /api/users/me - Get current authenticated user
usersRouter.get('/me', requireAuth, async (ctx: RouteContext) => {
  try {
    const container = getContainer();
    const userId = ctx.state.user.sub;

    const user = await container.userRepository.findById(UserId(userId as string));

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'User not found' };
      return;
    }

    ctx.response.body = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// GET /api/users/:id - Get user by ID
usersRouter.get('/:id', requireAuth, async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const container = getContainer();

    const user = await container.userRepository.findById(UserId(id));

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'User not found' };
      return;
    }

    ctx.response.body = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// PUT /api/users/:id - Update user
usersRouter.put('/:id', requireAuth, async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const currentUserId = ctx.state.user.sub;

    // Users can only update their own profile
    if (id !== currentUserId) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden' };
      return;
    }

    const body = await ctx.request.body.json();
    const data = updateUserSchema.parse(body);

    const container = getContainer();
    const user = await container.userRepository.findById(UserId(id));

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'User not found' };
      return;
    }

    // Update user fields
    const updatedUser = {
      ...user,
      name: data.name ?? user.name,
      phone: data.phone ?? user.phone,
      updatedAt: new Date(),
    };

    await container.userRepository.save(updatedUser);

    ctx.response.body = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
        createdAt: updatedUser.createdAt,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Validation error', details: error.errors };
      return;
    }
    console.error('Error updating user:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// GET /api/users - List users (admin only)
usersRouter.get('/', requireAuth, async (ctx: RouteContext) => {
  try {
    const container = getContainer();
    const userId = ctx.state.user.sub;

    const currentUser = await container.userRepository.findById(UserId(userId as string));

    // Only admins can list all users
    if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden - Admin access required' };
      return;
    }

    const { db } = await import('../../infrastructure/config/database.ts');
    const users = await db('users').select(
      'id',
      'email',
      'name',
      'phone',
      'role',
      'created_at as createdAt',
    );

    // For now, return the list without pagination
    ctx.response.body = {
      users: users,
      total: users.length,
      page: 1,
      limit: users.length,
    };
  } catch (error) {
    console.error('Error listing users:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});
