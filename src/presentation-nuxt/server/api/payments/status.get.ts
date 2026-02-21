// Payment Status API route — proxies to Deno backend
export default defineEventHandler(async (event) => {
  const { denoApiUrl } = useRuntimeConfig();
  const query = getQuery(event);

  const checkoutId = query.checkout_id as string;
  const reference = query.reference as string;

  if (!checkoutId && !reference) {
    throw createError({
      statusCode: 400,
      message: 'checkout_id or reference is required',
    });
  }

  try {
    const response = await $fetch<{
      status: string;
      success: boolean;
      paymentId: string;
      message?: string;
    }>(`${denoApiUrl}/api/payments/status`, {
      method: 'GET',
      params: {
        checkout_id: checkoutId,
        reference,
      },
    });

    return response;
  } catch (error: unknown) {
    const statusCode = error?.statusCode || error?.response?.status || 500;
    const message = error?.data?.message || error?.message || 'Failed to check payment status';

    throw createError({
      statusCode,
      message,
    });
  }
});
