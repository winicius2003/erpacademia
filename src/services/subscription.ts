'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { addDays } from 'date-fns';

export type SubscriptionPlan = "Premium" | "Free";
export type SubscriptionStatus = "active" | "overdue" | "blocked";

export type Subscription = {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    expiresAt: Timestamp;
};

const subscriptionRef = doc(db, 'gym', 'main_subscription');

export async function getSubscription(): Promise<Subscription | null> {
    try {
        const docSnap = await getDoc(subscriptionRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                plan: data.plan,
                status: data.status,
                expiresAt: data.expiresAt,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching subscription:", error);
        throw new Error("Failed to fetch subscription data.");
    }
}

export async function updateSubscription(data: Partial<Omit<Subscription, 'id' | 'expiresAt'> & { expiresAt?: Date }>): Promise<void> {
    try {
        const updateData: { [key: string]: any } = { ...data };
        if (data.expiresAt) {
            updateData.expiresAt = Timestamp.fromDate(data.expiresAt);
        }
        await updateDoc(subscriptionRef, updateData);
    } catch (error) {
        console.error("Error updating subscription:", error);
        throw new Error("Failed to update subscription.");
    }
}

export async function initializeSubscription(): Promise<void> {
    const docSnap = await getDoc(subscriptionRef);
    if (!docSnap.exists()) {
        const initialData = {
            plan: 'Premium' as SubscriptionPlan,
            status: 'active' as SubscriptionStatus,
            expiresAt: Timestamp.fromDate(addDays(new Date(), 30)),
        };
        await setDoc(subscriptionRef, initialData);
    }
}
