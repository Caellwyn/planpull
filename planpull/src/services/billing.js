import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

/**
 * Create a Stripe checkout session and redirect to payment.
 * @param {string} priceId - The Stripe price ID to subscribe to
 */
export async function redirectToCheckout(priceId) {
  const createCheckout = httpsCallable(functions, 'create_checkout_session');

  try {
    const result = await createCheckout({ priceId });
    if (result.data?.url) {
      window.location.href = result.data.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Open the Stripe customer portal for subscription management.
 */
export async function openCustomerPortal() {
  const createPortal = httpsCallable(functions, 'create_portal_session');

  try {
    const result = await createPortal({});
    if (result.data?.url) {
      window.location.href = result.data.url;
    } else {
      throw new Error('No portal URL returned');
    }
  } catch (error) {
    console.error('Error opening customer portal:', error);
    throw error;
  }
}
