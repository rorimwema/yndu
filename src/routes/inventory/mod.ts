// Inventory routes
import { Router } from '../../deps.ts';
import { getContainer } from '../../infrastructure/container.ts';
import { requireAuth } from '../../infrastructure/auth/auth-middleware.ts';
import { ProduceItemId } from '../../domain/value-objects/branded.ts';
import { ProduceCategory, ProduceItem } from '../../domain/aggregates/ProduceItem/ProduceItem.ts';
import { Money } from '../../domain/value-objects/Money.ts';
import { Quantity } from '../../domain/value-objects/Quantity.ts';
import { z } from 'zod';

type RouteContext = {
  params: Record<string, string>;
  state: Record<string, unknown>;
  request: Request;
  response: Response;
};

export const inventoryRouter = new Router();

const createItemSchema = z.object({
  name: z.string().min(1),
  nameSw: z.string().optional(),
  category: z.enum(['LEAFY_GREENS', 'ROOT_VEGETABLES', 'FRUITS', 'HERBS']),
  unitPriceCents: z.number().min(0),
  availableQuantity: z.number().min(0),
  unit: z.enum(['kg', 'g', 'pcs', 'bunches']),
  reorderThreshold: z.number().min(0).optional(),
  isSeasonal: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  nameSw: z.string().optional(),
  category: z.enum(['LEAFY_GREENS', 'ROOT_VEGETABLES', 'FRUITS', 'HERBS']).optional(),
  unitPriceCents: z.number().min(0).optional(),
  availableQuantity: z.number().min(0).optional(),
  reorderThreshold: z.number().min(0).optional(),
  isSeasonal: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

function toInventoryResponse(item: ProduceItem) {
  return {
    id: item.id,
    name: item.name,
    nameSw: item.nameSw,
    category: item.category,
    unitPrice: {
      amount: item.unitPrice.amount,
      currency: item.unitPrice.currency,
    },
    availableQuantity: {
      value: item.availableQuantity.value,
      unit: item.availableQuantity.unit,
    },
    reorderThreshold: {
      value: item.reorderThreshold.value,
      unit: item.reorderThreshold.unit,
    },
    isSeasonal: item.isSeasonal,
    seasonStart: item.seasonStart?.toISOString() ?? null,
    seasonEnd: item.seasonEnd?.toISOString() ?? null,
    imageUrl: item.imageUrl ?? null,
    isActive: item.isActive,
  };
}

// GET /api/inventory - List all produce items
inventoryRouter.get('/', async (ctx: RouteContext) => {
  try {
    const container = getContainer();
    const url = new URL(ctx.request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let items;
    if (category) {
      items = await container.inventoryRepository.findByCategory(category);
    } else {
      items = await container.inventoryRepository.findAll();
    }

    // Simple search filter
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.nameSw?.toLowerCase().includes(searchLower)
      );
    }

    ctx.response.body = {
      items: items.map(toInventoryResponse),
      total: items.length,
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// GET /api/inventory/:id - Get single item
inventoryRouter.get('/:id', async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const container = getContainer();

    const item = await container.inventoryRepository.findById(ProduceItemId(id));

    if (!item) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Item not found' };
      return;
    }

    ctx.response.body = { item: toInventoryResponse(item) };
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// POST /api/inventory - Create new item (admin only)
inventoryRouter.post('/', requireAuth, async (ctx: RouteContext) => {
  try {
    const container = getContainer();
    const currentUser = await container.userRepository.findById(ctx.state.user.sub as string);

    // Check admin role
    if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden - Admin access required' };
      return;
    }

    const body = await ctx.request.body.json();
    const data = createItemSchema.parse(body);

    const item = new ProduceItem({
      name: data.name,
      nameSw: data.nameSw,
      category: data.category as ProduceCategory,
      unitPrice: Money.fromCents(data.unitPriceCents),
      availableQuantity: Quantity.kilograms(data.availableQuantity),
      reorderThreshold: data.reorderThreshold !== undefined
        ? Quantity.kilograms(data.reorderThreshold)
        : undefined,
      isSeasonal: data.isSeasonal,
      imageUrl: data.imageUrl,
    });

    await container.inventoryRepository.save(item);

    ctx.response.status = 201;
    ctx.response.body = { item: toInventoryResponse(item) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Validation error', details: error.errors };
      return;
    }
    console.error('Error creating inventory item:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// PUT /api/inventory/:id - Update item (admin only)
inventoryRouter.put('/:id', requireAuth, async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const container = getContainer();
    const currentUser = await container.userRepository.findById(ctx.state.user.sub as string);

    // Check admin role
    if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden - Admin access required' };
      return;
    }

    const existing = await container.inventoryRepository.findById(ProduceItemId(id));
    if (!existing) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Item not found' };
      return;
    }

    const body = await ctx.request.body.json();
    const data = updateItemSchema.parse(body);

    // Update fields
    if (data.name) existing.name = data.name;
    if (data.nameSw !== undefined) existing.nameSw = data.nameSw;
    if (data.category) existing.category = data.category as ProduceCategory;
    if (data.unitPriceCents !== undefined) {
      existing.unitPrice = Money.fromCents(data.unitPriceCents);
    }
    if (data.availableQuantity !== undefined) {
      existing.availableQuantity = Quantity.kilograms(data.availableQuantity);
    }
    if (data.reorderThreshold !== undefined) {
      existing.reorderThreshold = Quantity.kilograms(data.reorderThreshold);
    }
    if (data.isSeasonal !== undefined) existing.isSeasonal = data.isSeasonal;
    if (data.imageUrl !== undefined) existing.imageUrl = data.imageUrl;

    await container.inventoryRepository.save(existing);

    ctx.response.body = { item: toInventoryResponse(existing) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Validation error', details: error.errors };
      return;
    }
    console.error('Error updating inventory item:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// DELETE /api/inventory/:id - Deactivate item (admin only)
inventoryRouter.delete('/:id', requireAuth, async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const container = getContainer();
    const currentUser = await container.userRepository.findById(ctx.state.user.sub as string);

    // Check admin role
    if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden - Admin access required' };
      return;
    }

    const existing = await container.inventoryRepository.findById(ProduceItemId(id));
    if (!existing) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Item not found' };
      return;
    }

    await container.inventoryRepository.deactivate(ProduceItemId(id));

    ctx.response.body = { message: 'Item deactivated successfully' };
  } catch (error) {
    console.error('Error deactivating inventory item:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

// PATCH /api/inventory/:id/quantity - Update quantity (admin only)
inventoryRouter.patch('/:id/quantity', requireAuth, async (ctx: RouteContext) => {
  try {
    const id = ctx.params.id;
    const container = getContainer();
    const currentUser = await container.userRepository.findById(ctx.state.user.sub as string);

    // Check admin role
    if (!currentUser?.role || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Forbidden - Admin access required' };
      return;
    }

    const body = await ctx.request.body.json();
    const { quantity } = body;

    if (typeof quantity !== 'number' || quantity < 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Valid quantity is required' };
      return;
    }

    const existing = await container.inventoryRepository.findById(ProduceItemId(id));
    if (!existing) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Item not found' };
      return;
    }

    await container.inventoryRepository.updateQuantity(ProduceItemId(id), quantity);

    ctx.response.body = { message: 'Quantity updated successfully' };
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});
