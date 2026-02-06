// Order validators using Zod
import { z } from "../../deps.ts";
import type { Context, Middleware } from "../../deps.ts";

const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      produceId: z.string().uuid(),
      quantity: z.number().positive(),
      unit: z.enum(["kg", "pcs", "bunches", "g"]),
    })
  ).min(1),
  deliveryAddressId: z.string().uuid(),
  preferredDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  isSubscription: z.boolean().default(false),
  subscriptionFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
});

export const validateCreateOrder: Middleware = async (ctx, next) => {
  try {
    const body = await ctx.request.body.json();
    const validated = createOrderSchema.parse(body);
    ctx.state.validatedBody = validated;
    await next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Validation Error",
        details: error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      };
    } else {
      throw error;
    }
  }
};
