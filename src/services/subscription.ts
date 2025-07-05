'use server';

import { addDays } from 'date-fns';

export type SubscriptionPlan = "Premium" | "Free" | "Iniciante" | "Profissional" | "Business";
export type SubscriptionStatus = "active" | "overdue" | "blocked";

export type Subscription = {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: Date;
};

// --- In-Memory Database for Subscription ---
let subscription: Subscription | null = null;

function initializeInMemorySubscription() {
    if (!subscription) {
        subscription = {
            id: 'main_subscription',
            plan: 'Premium',
            status: 'active',
            expiresAt: addDays(new Date(), 30),
        };
    }
}
// -----------------------------------------

export async function getSubscription(): Promise<Subscription | null> {
    initializeInMemorySubscription();
    return Promise.resolve(subscription);
}

export async function updateSubscription(data: Partial<Omit<Subscription, 'id'>>): Promise<void> {
    if (subscription) {
        subscription = { ...subscription, ...data };
    }
    return Promise.resolve();
}

export async function initializeSubscription(): Promise<void> {
    initializeInMemorySubscription();
    return Promise.resolve();
}
