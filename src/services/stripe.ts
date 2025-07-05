'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// This is a lookup for your Stripe Price IDs.
// Create products and prices in your Stripe dashboard, then add the Price IDs here.
const priceIds: Record<string, string> = {
  // Replace with your actual Price ID for the Premium plan from your Stripe dashboard
  Premium: 'price_1PeVfPD1m8VoOYGM3sZzguu5', 
};


export async function createCheckoutSession(plan: string, customerEmail?: string) {
  const priceId = priceIds[plan];

  if (!priceId) {
    throw new Error(`Plan ${plan} not found in price IDs.`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // If you have the customer's email, you can pre-fill it
    customer_email: customerEmail,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`,
  });

  if (!session.url) {
    throw new Error('Could not create Stripe Checkout session.');
  }

  return session.url;
}
