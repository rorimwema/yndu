import type { Context } from '../../deps.ts';
import { getContainer } from '../../infrastructure/container.ts';
import { mapErrorToHttpStatus } from '../../shared/Result.ts';
import {
  CancelSubscriptionCommand,
  CreateSubscriptionCommand,
  ModifySubscriptionCommand,
  PauseSubscriptionCommand,
  ResumeSubscriptionCommand,
} from '../../application/commands/subscription/index.ts';

export async function getSubscriptions(ctx: Context) {
  try {
    const url = new URL(ctx.request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');

    if (!userId) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'userId is required' };
      return;
    }

    const container = getContainer();
    const subscriptions = await container.subscriptionRepository.findByUserId(userId);

    const filtered = status ? subscriptions.filter((s) => s.status === status) : subscriptions;

    ctx.response.body = {
      subscriptions: filtered.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        planName: sub.plan.name,
        planPrice: sub.plan.price.toDTO(),
        billingCycle: sub.billingCycle.value,
        status: sub.status,
        deliverySlot: {
          date: sub.deliverySlot.date.toISOString(),
          type: sub.deliverySlot.type,
        },
        items: sub.items,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        nextBillingDate: sub.nextBillingDate.toISOString(),
        pauseHistory: sub.pauseHistory.map((p) => p.toDTO()),
        version: sub.version,
      })),
    };
  } catch (error) {
    console.error('Get subscriptions error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to fetch subscriptions' };
  }
}

export async function getSubscriptionById(ctx: Context) {
  try {
    const id = ctx.params.id;

    const container = getContainer();
    const subscription = await container.subscriptionRepository.findById(id as string);

    if (!subscription) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Subscription not found' };
      return;
    }

    ctx.response.body = {
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        planName: subscription.plan.name,
        planDescription: subscription.plan.description,
        planPrice: subscription.plan.price.toDTO(),
        billingCycle: subscription.billingCycle.value,
        status: subscription.status,
        deliverySlot: {
          date: subscription.deliverySlot.date.toISOString(),
          type: subscription.deliverySlot.type,
        },
        deliveryAddressId: subscription.deliveryAddressId,
        items: subscription.items,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        nextBillingDate: subscription.nextBillingDate.toISOString(),
        pauseHistory: subscription.pauseHistory.map((p) => p.toDTO()),
        version: subscription.version,
      },
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to fetch subscription' };
  }
}

export async function createSubscription(ctx: Context) {
  try {
    const body = ctx.state.validatedBody;

    const command: CreateSubscriptionCommand = {
      userId: body.userId,
      planName: body.planName,
      planPriceCents: body.planPriceCents,
      billingCycle: body.billingCycle,
      deliveryAddressId: body.deliveryAddressId,
      preferredDeliveryDate: new Date(body.preferredDeliveryDate),
      items: body.items || [],
    };

    const container = getContainer();
    const result = await container.createSubscriptionHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.status = 201;
    ctx.response.body = {
      id: subscription.id,
      userId: subscription.userId,
      planName: subscription.plan.name,
      planPrice: subscription.plan.price.toDTO(),
      billingCycle: subscription.billingCycle.value,
      status: subscription.status,
      deliverySlot: {
        date: subscription.deliverySlot.date.toISOString(),
        type: subscription.deliverySlot.type,
      },
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
    };
  } catch (error) {
    console.error('Create subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to create subscription' };
  }
}

export async function pauseSubscription(ctx: Context) {
  try {
    const id = ctx.params.id;
    const body = ctx.state.validatedBody || await ctx.request.body.json();

    const command: PauseSubscriptionCommand = {
      subscriptionId: id,
      reason: body.reason || 'User requested pause',
      resumeDate: body.resumeDate ? new Date(body.resumeDate) : undefined,
    };

    const container = getContainer();
    const result = await container.pauseSubscriptionHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.body = {
      id: subscription.id,
      status: subscription.status,
      pauseHistory: subscription.pauseHistory.map((p) => p.toDTO()),
      version: subscription.version,
    };
  } catch (error) {
    console.error('Pause subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to pause subscription' };
  }
}

export async function resumeSubscription(ctx: Context) {
  try {
    const id = ctx.params.id;

    const command: ResumeSubscriptionCommand = {
      subscriptionId: id,
    };

    const container = getContainer();
    const result = await container.resumeSubscriptionHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.body = {
      id: subscription.id,
      status: subscription.status,
      version: subscription.version,
    };
  } catch (error) {
    console.error('Resume subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to resume subscription' };
  }
}

export async function cancelSubscription(ctx: Context) {
  try {
    const id = ctx.params.id;
    const body = ctx.state.validatedBody || await ctx.request.body.json();

    const command: CancelSubscriptionCommand = {
      subscriptionId: id,
      reason: body.reason || 'User requested cancellation',
    };

    const container = getContainer();
    const result = await container.cancelSubscriptionHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.body = {
      id: subscription.id,
      status: subscription.status,
      version: subscription.version,
    };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to cancel subscription' };
  }
}

export async function modifySubscription(ctx: Context) {
  try {
    const id = ctx.params.id;
    const body = ctx.state.validatedBody || await ctx.request.body.json();

    const command: ModifySubscriptionCommand = {
      subscriptionId: id,
      modificationType: body.modificationType,
      newPlanName: body.newPlanName,
      newPlanPriceCents: body.newPlanPriceCents,
      newBillingCycle: body.newBillingCycle,
      newDeliveryDate: body.newDeliveryDate ? new Date(body.newDeliveryDate) : undefined,
      newItems: body.newItems,
    };

    const container = getContainer();
    const result = await container.modifySubscriptionHandler.execute(command);

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.body = {
      id: subscription.id,
      planName: subscription.plan.name,
      planPrice: subscription.plan.price.toDTO(),
      billingCycle: subscription.billingCycle.value,
      deliverySlot: {
        date: subscription.deliverySlot.date.toISOString(),
        type: subscription.deliverySlot.type,
      },
      version: subscription.version,
    };
  } catch (error) {
    console.error('Modify subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to modify subscription' };
  }
}

export async function generateOrderFromSubscription(ctx: Context) {
  try {
    const id = ctx.params.id;

    const container = getContainer();
    const result = await container.generateOrderFromSubscriptionHandler.execute({
      subscriptionId: id,
    });

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const order = result.getValue();
    ctx.response.status = 201;
    ctx.response.body = {
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice.toDTO(),
      deliverySlot: {
        date: order.deliverySlot.date.toISOString(),
        type: order.deliverySlot.type,
      },
    };
  } catch (error) {
    console.error('Generate order error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to generate order from subscription' };
  }
}

export async function renewSubscription(ctx: Context) {
  try {
    const id = ctx.params.id;

    const container = getContainer();
    const result = await container.processSubscriptionRenewalHandler.execute({
      subscriptionId: id,
    });

    if (result.isFailure()) {
      ctx.response.status = mapErrorToHttpStatus(result.getError());
      ctx.response.body = {
        error: result.getError().message,
        code: result.getError().code,
      };
      return;
    }

    const subscription = result.getValue();
    ctx.response.body = {
      id: subscription.id,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      version: subscription.version,
    };
  } catch (error) {
    console.error('Renew subscription error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to renew subscription' };
  }
}
