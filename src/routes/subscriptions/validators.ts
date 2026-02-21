import type { Context, Next } from '../../deps.ts';

const createSubscriptionSchema = {
  userId: { type: 'string', required: true },
  planName: { type: 'string', required: true },
  planPriceCents: { type: 'number', required: true, min: 0 },
  billingCycle: { type: 'string', required: true, enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY'] },
  deliveryAddressId: { type: 'string', required: true },
  preferredDeliveryDate: { type: 'string', required: true },
  items: { type: 'array', required: false },
};

const pauseSubscriptionSchema = {
  reason: { type: 'string', required: false },
  resumeDate: { type: 'string', required: false },
};

const cancelSubscriptionSchema = {
  reason: { type: 'string', required: false },
};

const modifySubscriptionSchema = {
  modificationType: {
    type: 'string',
    required: true,
    enum: ['PLAN', 'BILLING_CYCLE', 'DELIVERY_SLOT', 'ITEMS'],
  },
  newPlanName: { type: 'string', required: false },
  newPlanPriceCents: { type: 'number', required: false },
  newBillingCycle: { type: 'string', required: false, enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY'] },
  newDeliveryDate: { type: 'string', required: false },
  newItems: { type: 'array', required: false },
};

function validate(schema: Record<string, unknown>) {
  return async (ctx: Context, next: Next) => {
    const body = await ctx.request.body.json().catch(() => ({}));
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }
    }

    if (errors.length > 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Validation failed', details: errors };
      return;
    }

    ctx.state.validatedBody = body;
    await next();
  };
}

export const createSubscriptionValidator = validate(createSubscriptionSchema);
export const pauseSubscriptionValidator = validate(pauseSubscriptionSchema);
export const cancelSubscriptionValidator = validate(cancelSubscriptionSchema);
export const modifySubscriptionValidator = validate(modifySubscriptionSchema);
