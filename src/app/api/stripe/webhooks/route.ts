import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

import { updateSubscription, type SubscriptionPlan } from '@/services/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // The plan name is stored in metadata
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;

    // Get the subscription details from Stripe
    const subscriptionId = session.subscription;
    if (typeof subscriptionId !== 'string') {
        console.error('Subscription ID not found in checkout session.');
        return NextResponse.json({ error: 'Subscription ID not found' }, { status: 400 });
    }

    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const newExpiryDate = new Date(subscription.current_period_end * 1000);
        
        if (!plan) {
            console.error('Plan not found in checkout session metadata.');
            return NextResponse.json({ error: 'Plan not found in metadata' }, { status: 400 });
        }
        
        // Update your database
        await updateSubscription({
            plan: plan,
            expiresAt: newExpiryDate,
            status: 'active',
        });
        
        console.log(`✅ Subscription updated successfully for plan: ${plan}. Expires at: ${newExpiryDate}`);

    } catch (error) {
        console.error("Error updating subscription in DB:", error);
        return NextResponse.json({ error: 'Failed to update subscription in database.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
