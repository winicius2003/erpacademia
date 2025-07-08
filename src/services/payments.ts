
'use server';

import { format, addDays, isAfter, parseISO } from 'date-fns';
import { getMemberById, updateMember } from './members';
import { getPlans, type Plan } from './plans';
import { addExpense } from './expenses';

export type PaymentItem = {
    id: number;
    description: string;
    quantity: number;
    price: number;
};

export type PaymentMethod = "Dinheiro" | "Pix" | "Cartão de Débito" | "Cartão de Crédito" | "Boleto";
export type PaymentStatus = "Pago" | "Pendente" | "Vencida" | "Estornado";

export type Payment = {
    id: string;
    studentId: string;
    student: string;
    items: PaymentItem[];
    amount: string;
    date: string; // "yyyy-MM-dd"
    time: string; // "HH:mm"
    status: PaymentStatus;
    registeredById: string;
    registeredByName: string;
    paymentMethod: PaymentMethod;
    transactionId?: string;
};

// --- In-Memory Database ---
let payments: Payment[] = [
    { id: 'p1', studentId: '1', student: 'João da Silva', items: [{ id: 1, description: 'Plano Anual', quantity: 1, price: 997.00 }], amount: '997.00', date: '2023-08-15', time: '09:30', status: 'Pago', registeredById: '3', registeredByName: 'Juliana Alves', paymentMethod: 'Cartão de Crédito', transactionId: '123456789' },
    { id: 'p2', studentId: '2', student: 'Maria Oliveira', items: [{ id: 1, description: 'Plano Mensal', quantity: 1, price: 97.00 }], amount: '97.00', date: '2024-07-05', time: '14:15', status: 'Pago', registeredById: '3', registeredByName: 'Juliana Alves', paymentMethod: 'Pix' },
    { id: 'p3', studentId: '3', student: 'Carlos Pereira', items: [{ id: 1, description: 'Plano Trimestral', quantity: 1, price: 277.00 }], amount: '277.00', date: '2024-05-10', time: '11:00', status: 'Pago', registeredById: '6', registeredByName: 'Ricardo Mendes', paymentMethod: 'Dinheiro' },
    { id: 'p4', studentId: '4', student: 'Ana Costa', items: [{ id: 1, description: 'Avaliação Física', quantity: 1, price: 150.00 }], amount: '150.00', date: '2024-06-20', time: '16:45', status: 'Pago', registeredById: '3', registeredByName: 'Juliana Alves', paymentMethod: 'Cartão de Débito', transactionId: '987654321' },
    { id: 'p5', studentId: '1', student: 'João da Silva', items: [{ id: 1, description: 'Garrafa de Água', quantity: 2, price: 25.00 }], amount: '50.00', date: '2024-07-18', time: '10:05', status: 'Pago', registeredById: '6', registeredByName: 'Ricardo Mendes', paymentMethod: 'Dinheiro' },
];
let nextId = payments.length + 1;
// -------------------------

export async function getPayments(): Promise<Payment[]> {
    // To make sure there is at least one payment for today for demonstration
    const today = format(new Date(), "yyyy-MM-dd");
    const hasTodayPayment = payments.some(p => p.date === today);

    if (!hasTodayPayment) {
        payments.unshift({
            id: `p${nextId++}`, 
            studentId: '5', 
            student: 'Bruno Santos', 
            items: [{ id: 1, description: 'Barra de Proteína', quantity: 1, price: 8.00 }], 
            amount: '8.00', 
            date: today, 
            time: '08:45', 
            status: 'Pago',
            registeredById: '3',
            registeredByName: 'Juliana Alves',
            paymentMethod: 'Pix'
        });
    }
    return Promise.resolve(payments);
}

export async function getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const studentPayments = payments.filter(p => p.studentId === studentId);
    return Promise.resolve(studentPayments);
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
    const newId = `p${nextId++}`;
    const newPayment: Payment = {
        id: newId,
        ...paymentData,
    };
    payments.unshift(newPayment); // Add to the beginning of the list

    // --- Update Member Status and Expiry ---
    try {
        const member = await getMemberById(paymentData.studentId);
        if (member) {
            const allPlans = await getPlans();
            let maxDuration = 0;
            
            // Find the plan with the longest duration in the purchase
            paymentData.items.forEach(item => {
                const purchasedPlan = allPlans.find(p => p.name === item.description);
                if (purchasedPlan && purchasedPlan.durationDays > maxDuration) {
                    maxDuration = purchasedPlan.durationDays;
                }
            });

            if (maxDuration > 0) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const currentExpires = parseISO(member.expires);
                
                // If current plan is still active, add days to the expiry date. Otherwise, add to today.
                const startDateForRenewal = isAfter(currentExpires, today) ? currentExpires : today;
                
                const newExpiryDate = addDays(startDateForRenewal, maxDuration);

                // Update member's expiry and set status to active
                await updateMember(member.id, {
                    expires: format(newExpiryDate, "yyyy-MM-dd"),
                    status: 'Ativo' 
                });
            }
        }
    } catch (error) {
        console.error("Failed to update member status after payment:", error);
        // Don't block payment from being saved, but log the error.
    }
    // ------------------------------------

    return Promise.resolve(newPayment);
}

export async function reversePayment(paymentId: string, userId: string, userName: string): Promise<void> {
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
        throw new Error("Pagamento não encontrado.");
    }

    const payment = payments[paymentIndex];
    if (payment.status === 'Estornado') {
        throw new Error("Este pagamento já foi estornado.");
    }

    // Mark the payment as reversed
    payments[paymentIndex].status = 'Estornado';

    // Create a corresponding expense for cash flow balance
    await addExpense({
        description: `Estorno do Pagamento #${payment.id} (Aluno: ${payment.student})`,
        amount: parseFloat(payment.amount),
        category: 'Outros',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        registeredById: userId,
        registeredByName: userName,
    });
    
    return Promise.resolve();
}
