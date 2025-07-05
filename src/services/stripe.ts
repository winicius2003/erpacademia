'use server';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// This is a lookup for your Stripe Price IDs.
// Create products and prices in your Stripe dashboard, then add the Price IDs here.
// IMPORTANT: You need to provide Price IDs (e.g., price_xyz), not Product IDs (e.g., prod_xyz).
// I have created placeholders below based on the plans on your landing page.
// Please replace them with your actual Price IDs from your Stripe dashboard.
const priceIds: Record<string, string> = {
  // Product Iniciante: prod_ScZElDg0AY4b9b
  "Iniciante": "price_REPLACE_WITH_YOUR_INICIANTE_PRICE_ID", 
  // Product Profissional: prod_ScZBWwtINHYUvN
  "Profissional": "price_REPLACE_WITH_YOUR_PROFISSIONAL_PRICE_ID",
  "Business": "price_REPLACE_WITH_YOUR_BUSINESS_PRICE_ID",
  // This was the old default, can be removed if no longer needed.
  "Premium": "price_1PeVfPD1m8VoOYGM3sZzguu5", 
};


export async function createCheckoutSession(plan: string, customerEmail?: string) {
  const priceId = priceIds[plan];

  if (!priceId || priceId.includes('REPLACE_WITH')) {
    throw new Error(`Price ID for plan '${plan}' not found or not configured in src/services/stripe.ts.`);
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
    metadata: {
        plan: plan,
    },
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
