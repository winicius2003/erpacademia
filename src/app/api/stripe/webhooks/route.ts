import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { format } from 'date-fns';

import { updateSubscription, type SubscriptionPlan } from '@/services/subscription';
import { addAcademy } from '@/services/academies';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleNewAcademySignup(session: Stripe.Checkout.Session) {
    const { plan, gymName, adminName } = session.metadata || {};
    const adminEmail = session.customer_details?.email;

    if (!plan || !gymName || !adminName || !adminEmail) {
        console.error('Webhook Error: Missing metadata for new academy signup.', session.metadata);
        throw new Error('Missing metadata for new academy signup.');
    }
    
    // In a real app, send this password via a secure email service (e.g., SendGrid, Postmark).
    // For this demo, we'll generate it and log it to the console.
    const temporaryPassword = Math.random().toString(36).slice(-8);

    if (!session.subscription) {
        console.error('Webhook Error: Subscription ID not found in session for new academy.');
        throw new Error('Subscription ID not found for new academy.');
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const expiresAt = new Date(subscription.current_period_end * 1000);

    const academyData = {
        name: gymName,
        adminName: adminName,
        adminEmail: adminEmail,
        subscriptionPlan: plan as any, // The plan names are validated in the stripe service
        expiresAt: format(expiresAt, 'yyyy-MM-dd'),
    };
    
    try {
        await addAcademy(academyData, temporaryPassword);
        console.log("✅ Nova academia criada com sucesso via Stripe!");
        console.log(`   - Academia: ${gymName}`);
        console.log(`   - Admin: ${adminName} <${adminEmail}>`);
        console.log(`   - Senha Provisória: ${temporaryPassword}`);
        console.log("   - AÇÃO NECESSÁRIA: Enviar um e-mail de boas-vindas com essas credenciais.");
    } catch (error) {
        console.error("❌ Erro ao criar academia no banco de dados:", error);
        // Here you might want to send an alert to your dev team.
        throw error; // Throw to let Stripe know the webhook failed.
    }
}

async function handleSubscriptionUpdate(session: Stripe.Checkout.Session) {
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;

    const subscriptionId = session.subscription;
    if (typeof subscriptionId !== 'string') {
        console.error('Subscription ID not found in checkout session.');
        throw new Error('Subscription ID not found');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const newExpiryDate = new Date(subscription.current_period_end * 1000);
    
    if (!plan) {
        console.error('Plan not found in checkout session metadata.');
        throw new Error('Plan not found in metadata');
    }
    
    await updateSubscription({
        plan: plan,
        expiresAt: newExpiryDate,
        status: 'active',
    });
    
    console.log(`✅ Subscription updated successfully for plan: ${plan}. Expires at: ${newExpiryDate}`);
}

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
    
    try {
        if (session.metadata?.isNewAcademy === 'true') {
            await handleNewAcademySignup(session);
        } else {
            await handleSubscriptionUpdate(session);
        }
    } catch (error: any) {
        console.error("Error handling checkout session:", error.message);
        return NextResponse.json({ error: `Failed to process webhook: ${error.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
