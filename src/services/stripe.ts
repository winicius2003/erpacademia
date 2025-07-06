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
  "Iniciante": "price_1PfA9aD1m8VoOYGMY0vj9gXF", 
  // Product Profissional: prod_ScZBWwtINHYUvN
  "Profissional": "price_1PfAABD1m8VoOYGMt008S4K3",
  "Business": "price_1PfABcD1m8VoOYGMy9rO2Vl5",
  "Enterprise": "price_1PfACGD1m8VoOYGM4xK3n8gE",
  // This was the old default, can be removed if no longer needed.
  "Premium": "price_1PeVfPD1m8VoOYGM3sZzguu5", 
};


// This function is for existing users renewing or changing their plan
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
        isNewAcademy: 'false', // Explicitly mark as not new
    },
    customer_email: customerEmail,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`,
  });

  if (!session.url) {
    throw new Error('Could not create Stripe Checkout session.');
  }

  return session.url;
}

// This new function is for the public signup flow
export async function createSignupCheckoutSession(plan: string, gymName: string, adminName: string, adminEmail: string) {
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
        gymName: gymName,
        adminName: adminName,
        isNewAcademy: 'true', // Flag for the webhook
    },
    customer_email: adminEmail,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?signup=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?plan=${plan}&canceled=true`,
  });

  if (!session.url) {
    throw new Error('Could not create Stripe Checkout session.');
  }

  return session.url;
}
