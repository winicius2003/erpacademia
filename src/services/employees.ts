'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, where, query } from 'firebase/firestore';

export type Role = "Admin" | "Gestor" | "Professor" | "Recepção";

export type Employee = {
    id: string;
    name: string;
    email: string;
    login: string;
    password: string;
    role: Role;
    status: "Ativo" | "Inativo";
};

const employeesCollection = collection(db, 'employees');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Employee => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        login: data.login,
        password: data.password,
        role: data.role as Role,
        status: data.status,
    };
};

export async function getEmployees(): Promise<Employee[]> {
    try {
        const snapshot = await getDocs(employeesCollection);
        return snapshot.docs.map(fromFirestore);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
}

export async function getEmployeeByLogin(login: string): Promise<Employee | null> {
    try {
        const q = query(employeesCollection, where("login", "==", login));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        return fromFirestore(snapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching employee by login:", error);
        return null;
    }
}

export async function addEmployee(employeeData: Omit<Employee, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(employeesCollection, employeeData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding employee:", error);
        throw new Error("Failed to add employee");
    }
}

export async function updateEmployee(id: string, employeeData: Partial<Omit<Employee, 'id'>>): Promise<void> {
    try {
        const employeeDoc = doc(db, 'employees', id);
        await updateDoc(employeeDoc, employeeData);
    } catch (error) {
        console.error("Error updating employee:", error);
        throw new Error("Failed to update employee");
    }
}

export async function deleteEmployee(id: string): Promise<void> {
    try {
        const employeeDoc = doc(db, 'employees', id);
        await deleteDoc(employeeDoc);
    } catch (error) {
        console.error("Error deleting employee:", error);
        throw new Error("Failed to delete employee");
    }
}
