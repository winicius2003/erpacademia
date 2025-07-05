'use server';

import { format } from 'date-fns';

export type PaymentItem = {
    id: number;
    description: string;
    quantity: number;
    price: number;
};

export type Payment = {
    id: string;
    studentId: string;
    student: string;
    items: PaymentItem[];
    amount: string;
    date: string; // "yyyy-MM-dd"
    status: "Pago" | "Pendente" | "Vencida";
};

// --- In-Memory Database ---
let payments: Payment[] = [
    { id: 'p1', studentId: '1', student: 'João da Silva', items: [{ id: 1, description: 'Plano Anual', quantity: 1, price: 997.00 }], amount: '997.00', date: '2023-08-15', status: 'Pago' },
    { id: 'p2', studentId: '2', student: 'Maria Oliveira', items: [{ id: 1, description: 'Plano Mensal', quantity: 1, price: 97.00 }], amount: '97.00', date: '2024-07-05', status: 'Pago' },
    { id: 'p3', studentId: '3', student: 'Carlos Pereira', items: [{ id: 1, description: 'Plano Trimestral', quantity: 1, price: 277.00 }], amount: '277.00', date: '2024-05-10', status: 'Pago' },
    { id: 'p4', studentId: '4', student: 'Ana Costa', items: [{ id: 1, description: 'Avaliação Física', quantity: 1, price: 150.00 }], amount: '150.00', date: '2024-06-20', status: 'Pago' },
    { id: 'p5', studentId: '1', student: 'João da Silva', items: [{ id: 1, description: 'Garrafa de Água', quantity: 2, price: 25.00 }], amount: '50.00', date: '2024-07-18', status: 'Pago' },
];
let nextId = payments.length + 1;
// -------------------------

export async function getPayments(): Promise<Payment[]> {
    return Promise.resolve(payments);
}

export async function getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const studentPayments = payments.filter(p => p.studentId === studentId);
    return Promise.resolve(studentPayments);
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<string> {
    const newId = `p${nextId++}`;
    const newPayment: Payment = {
        id: newId,
        ...paymentData,
    };
    payments.unshift(newPayment); // Add to the beginning of the list
    return Promise.resolve(newId);
}
