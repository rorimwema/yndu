// Initiate Payment API route — proxies to Deno backend
export default defineEventHandler(async (event) => {
  const { denoApiUrl } = useRuntimeConfig();
  const body = await readBody(event);

  // Validate input
  if (!body?.orderId || !body?.phoneNumber) {
    throw createError({
      statusCode: 400,
      message: 'Order ID and phone number are required',
    });
  }

  try {
    const response = await $fetch<{
      paymentId: string;
      checkoutId: string;
      reference: string;
      expiresAt: string;
      phone: string;
    }>(`${denoApiUrl}/api/payments/initiate`, {
      method: 'POST',
      body: {
        orderId: body.orderId,
        phoneNumber: body.phoneNumber,
      },
    });

    return response;
  } catch (error: unknown) {
    const statusCode = error?.statusCode || error?.response?.status || 500;
    const message = error?.data?.message || error?.message || 'Payment initiation failed';

    throw createError({
      statusCode,
      message,
    });
  }
});
