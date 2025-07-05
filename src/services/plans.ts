'use server';

export type Plan = {
    id: string;
    name: string; // "Mensal", "Trimestral", "Anual"
    price: number; // 97.00, 277.00, 997.00
    durationDays: number; // 30, 90, 365
};

// In-Memory Database
let plans: Plan[] = [
    { id: 'plan-1', name: 'Mensal', price: 97.00, durationDays: 30 },
    { id: 'plan-2', name: 'Trimestral', price: 277.00, durationDays: 90 },
    { id: 'plan-3', name: 'Anual', price: 997.00, durationDays: 365 },
];
let nextId = plans.length + 1;

export async function getPlans(): Promise<Plan[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(JSON.parse(JSON.stringify(plans)));
}

export async function addPlan(planData: Omit<Plan, 'id'>): Promise<string> {
    const newId = `plan-${nextId++}`;
    const newPlan: Plan = { id: newId, ...planData };
    plans.push(newPlan);
    return Promise.resolve(newId);
}

export async function updatePlan(id: string, planData: Partial<Omit<Plan, 'id'>>): Promise<void> {
    plans = plans.map(p => p.id === id ? { ...p, ...planData } as Plan : p);
    return Promise.resolve();
}

export async function deletePlan(id: string): Promise<void> {
    plans = plans.filter(p => p.id !== id);
    return Promise.resolve();
}
