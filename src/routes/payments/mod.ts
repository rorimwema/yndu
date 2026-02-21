// Payments API routes
import { Router } from 'oak';
import { getHashPayService, PhoneUtils } from '../../infrastructure/payments/HashPayService.ts';
import { db } from '../../infrastructure/config/database.ts';
import { z } from 'zod';
const uuidv4 = () => crypto.randomUUID();

type RouteContext = {
  params: Record<string, string>;
  state: Record<string, unknown>;
  request: Request;
  response: Response;
};

export const paymentsRouter = new Router();

const initiateSchema = z.object({
  orderId: z.string().uuid(),
  phoneNumber: z.string().min(10),
});

// POST /api/payments/initiate - Initiate M-Pesa STK Push
paymentsRouter.post('/initiate', async (ctx: RouteContext) => {
  try {
    const authHeader = ctx.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Unauthorized' };
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const { verifyAccessToken } = await import('../../infrastructure/auth/jwt.ts');
    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Invalid token' };
      return;
    }

    const userId = payload.sub;
    const body = await ctx.request.body.json();
    const { orderId, phoneNumber } = initiateSchema.parse(body);

    const hashPayService = getHashPayService();

    // Validate order exists and belongs to user
    const order = await db('orders').where('id', orderId).first();
    if (!order) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Order not found' };
      return;
    }

    // Verify ownership
    if (order.user_id !== userId) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Order not found' };
      return;
    }

    // Check if order is in valid status for payment
    const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PROCESSING'];
    if (!validStatuses.includes(order.status)) {
      ctx.response.status = 400;
      ctx.response.body = { error: `Order is already ${order.status.toLowerCase()}` };
      return;
    }

    // Normalize phone number
    const normalizedPhone = PhoneUtils.normalize(phoneNumber);
    if (!PhoneUtils.isValidKenyanPhone(normalizedPhone)) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'Invalid phone number format. Use: 2547XXXXXXXX' };
      return;
    }

    // Calculate amount in KES
    const amountKES = Math.ceil(order.total_price_cents / 100);
    const amountValidation = PhoneUtils.validateAmountKES(order.total_price_cents);
    if (!amountValidation.valid) {
      ctx.response.status = 400;
      ctx.response.body = { error: amountValidation.error };
      return;
    }

    // Generate reference and expiry
    const reference = hashPayService.generateReference(orderId);
    const expiresAt = hashPayService.getExpiryTime(15);

    // Initiate with HashPay
    const stkResponse = await hashPayService.initiateSTK({
      amount: String(amountKES),
      msisdn: normalizedPhone,
      reference,
    });

    if (!stkResponse.success) {
      ctx.response.status = 502;
      ctx.response.body = { error: stkResponse.message || 'Payment provider error' };
      return;
    }

    // Create payment record in database
    const [payment] = await db('payments')
      .insert({
        id: uuidv4(),
        order_id: orderId,
        user_id: userId,
        amount_cents: order.total_price_cents,
        currency: 'KES',
        channel: 'mpesa',
        hashpay_checkout_id: stkResponse.checkout_id,
        hashpay_reference: reference,
        mpesa_phone: normalizedPhone,
        status: 'pending',
        initiated_at: new Date(),
        expires_at: expiresAt,
      })
      .returning('*');

    // Update order with payment ID
    await db('orders')
      .where('id', orderId)
      .update({
        payment_id: payment.id,
        payment_status: 'PROCESSING',
        updated_at: new Date(),
      });

    // Record status history
    await db('payment_status_history').insert({
      id: uuidv4(),
      payment_id: payment.id,
      from_status: null,
      to_status: 'pending',
      reason: 'Payment initiated',
    });

    ctx.response.status = 200;
    ctx.response.body = {
      paymentId: payment.id,
      checkoutId: payment.hashpay_checkout_id,
      reference: payment.hashpay_reference,
      expiresAt: expiresAt.toISOString(),
      phone: PhoneUtils.mask(normalizedPhone),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.errors[0].message };
      return;
    }
    console.error('[Payment Initiate] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to initiate payment' };
  }
});

// GET /api/payments/status - Check payment status
paymentsRouter.get('/status', async (ctx: RouteContext) => {
  try {
    const checkoutId = ctx.request.url.searchParams.get('checkout_id');
    const reference = ctx.request.url.searchParams.get('reference');

    if (!checkoutId && !reference) {
      ctx.response.status = 400;
      ctx.response.body = { error: 'checkout_id or reference required' };
      return;
    }

    const hashPayService = getHashPayService();

    // Find payment
    let payment;
    if (checkoutId) {
      payment = await db('payments').where('hashpay_checkout_id', checkoutId).first();
    } else {
      payment = await db('payments').where('hashpay_reference', reference).first();
    }

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Payment not found' };
      return;
    }

    // Return cached status if terminal
    if (['completed', 'failed', 'cancelled', 'timeout'].includes(payment.status)) {
      ctx.response.body = {
        status: payment.status.toUpperCase(),
        success: payment.status === 'completed',
        paymentId: payment.id,
      };
      return;
    }

    // Check with HashPay for pending payments
    const status = await hashPayService.checkStatus(payment.hashpay_checkout_id);

    if (hashPayService.isTransactionSuccess(status)) {
      // Update payment status
      await db('payments')
        .where('id', payment.id)
        .update({
          status: 'completed',
          completed_at: new Date(),
          hashpay_merchant_request_id: status.MerchantRequestID,
          version: payment.version + 1,
        });

      // Update order status
      await db('orders')
        .where('id', payment.order_id)
        .update({
          payment_status: 'PAID',
          status: 'CONFIRMED',
          paid_at: new Date(),
          updated_at: new Date(),
        });

      // Record history
      await db('payment_status_history').insert({
        id: uuidv4(),
        payment_id: payment.id,
        from_status: payment.status,
        to_status: 'completed',
        reason: 'Payment successful',
      });

      ctx.response.body = {
        status: 'COMPLETED',
        success: true,
        paymentId: payment.id,
      };
    } else if (status.ResultCode && status.ResultCode !== '0') {
      // Failed
      await db('payments')
        .where('id', payment.id)
        .update({
          status: 'failed',
          failed_at: new Date(),
          version: payment.version + 1,
        });

      await db('payment_status_history').insert({
        id: uuidv4(),
        payment_id: payment.id,
        from_status: payment.status,
        to_status: 'failed',
        reason: status.ResultDesc,
      });

      ctx.response.body = {
        status: 'FAILED',
        success: false,
        message: status.ResultDesc,
        paymentId: payment.id,
      };
    } else {
      // Still pending
      ctx.response.body = {
        status: 'PENDING',
        success: false,
        paymentId: payment.id,
      };
    }
  } catch (error) {
    console.error('[Payment Status] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to check payment status' };
  }
});

// GET /api/payments/:id - Get payment details
paymentsRouter.get('/:id', async (ctx: RouteContext) => {
  try {
    const { id } = ctx.params;

    const authHeader = ctx.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Unauthorized' };
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const { verifyAccessToken } = await import('../../infrastructure/auth/jwt.ts');
    let payload;
    try {
      payload = await verifyAccessToken(token);
    } catch {
      ctx.response.status = 401;
      ctx.response.body = { error: 'Invalid token' };
      return;
    }

    const userId = payload.sub;

    const payment = await db('payments').where('id', id).first();

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Payment not found' };
      return;
    }

    // Verify ownership
    if (payment.user_id !== userId) {
      ctx.response.status = 403;
      ctx.response.body = { error: 'Payment not found' };
      return;
    }

    ctx.response.body = {
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount_cents,
      currency: payment.currency,
      status: payment.status,
      phone: PhoneUtils.mask(payment.mpesa_phone),
      checkoutId: payment.hashpay_checkout_id,
      initiatedAt: payment.initiated_at,
      completedAt: payment.completed_at,
      expiresAt: payment.expires_at,
    };
  } catch (error) {
    console.error('[Payment Get] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to get payment' };
  }
});
