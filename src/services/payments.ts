'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, query, where } from 'firebase/firestore';

export type PaymentItem = {
    id: number;
    description: string;
    quantity: number;
    price: number;
};

export type Payment = {
    id: string;
    student: string;
    items: PaymentItem[];
    amount: string;
    date: string; // "yyyy-MM-dd"
    status: "Pago" | "Pendente" | "Vencida";
};

const paymentsCollection = collection(db, 'payments');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Payment => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        student: data.student,
        items: data.items,
        amount: data.amount,
        date: data.date,
        status: data.status,
    };
};

export async function getPayments(): Promise<Payment[]> {
    try {
        const snapshot = await getDocs(paymentsCollection);
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return [];
    }
}

export async function getPaymentsByStudent(studentName: string): Promise<Payment[]> {
    try {
        const q = query(paymentsCollection, where("student", "==", studentName));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error(`Error fetching payments for student ${studentName}:`, error);
        return [];
    }
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(paymentsCollection, paymentData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding payment:", error);
        throw new Error("Failed to add payment");
    }
}
