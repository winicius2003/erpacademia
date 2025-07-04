'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { Member } from '@/app/dashboard/members/page';

const membersCollection = collection(db, 'members');

// Helper function to convert Firestore doc to Member
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Member => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        plan: data.plan,
        status: data.status,
        expires: data.expires,
        cpf: data.cpf,
        rg: data.rg,
        professor: data.professor,
        attendanceStatus: data.attendanceStatus,
        workoutStatus: data.workoutStatus,
    };
};

export async function getMembers(): Promise<Member[]> {
    try {
        const snapshot = await getDocs(membersCollection);
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
}

export async function addMember(memberData: Omit<Member, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(membersCollection, memberData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding member:", error);
        throw new Error("Failed to add member");
    }
}

export async function updateMember(id: string, memberData: Partial<Omit<Member, 'id'>>): Promise<void> {
    try {
        const memberDoc = doc(db, 'members', id);
        await updateDoc(memberDoc, memberData);
    } catch (error) {
        console.error("Error updating member:", error);
        throw new Error("Failed to update member");
    }
}

export async function deleteMember(id: string): Promise<void> {
    try {
        const memberDoc = doc(db, 'members', id);
        await deleteDoc(memberDoc);
    } catch (error) {
        console.error("Error deleting member:", error);
        throw new Error("Failed to delete member");
    }
}
