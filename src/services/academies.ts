'use server';
import { addEmployee } from './employees';

export type AcademyStatus = "Ativa" | "Suspensa";

export type Academy = {
    id: string;
    name: string;
    status: AcademyStatus;
    adminName: string;
    adminEmail: string;
    studentCount: number;
    subscriptionPlan: "Iniciante" | "Profissional" | "Business" | "Enterprise";
    expiresAt: string; // yyyy-MM-dd
};

// --- In-Memory Database for Academies ---
let academies: Academy[] = [
    { id: 'gym-1', name: 'Academia Exemplo', status: 'Ativa', adminName: 'Administrador Master', adminEmail: 'admin@admin', studentCount: 250, subscriptionPlan: 'Business', expiresAt: '2025-07-20' },
    { id: 'gym-2', name: 'Maromba Fit', status: 'Ativa', adminName: 'Carlos Silva', adminEmail: 'carlos@marombafit.com', studentCount: 45, subscriptionPlan: 'Iniciante', expiresAt: '2024-08-15' },
    { id: 'gym-3', name: 'Corpo & Ação', status: 'Suspensa', adminName: 'Juliana Paes', adminEmail: 'juliana@corpoeacao.com', studentCount: 150, subscriptionPlan: 'Profissional', expiresAt: '2024-06-30' },
];
let nextId = academies.length + 1;
// -----------------------------------------

export async function getAcademies(): Promise<Academy[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(JSON.parse(JSON.stringify(academies)));
}

export async function addAcademy(academyData: Omit<Academy, 'id' | 'status' | 'studentCount'>, adminPassword: string): Promise<string> {
    const newId = `gym-${nextId++}`;
    const newAcademy: Academy = {
        id: newId,
        status: 'Ativa',
        studentCount: 0,
        ...academyData,
    };
    academies.push(newAcademy);

    // Also create the admin user for this new academy
    await addEmployee({
        name: academyData.adminName,
        email: academyData.adminEmail,
        login: academyData.adminEmail, // Use email as login for simplicity
        password: adminPassword,
        role: 'Admin', // This is the gym's admin, not the superadmin
        status: 'Ativo',
        salary: 0, // N/A for this context
        workHours: 'N/A',
    });

    return Promise.resolve(newId);
}

export async function updateAcademy(id: string, academyData: Partial<Omit<Academy, 'id'>>): Promise<void> {
    academies = academies.map(a => a.id === id ? { ...a, ...academyData } as Academy : a);
    return Promise.resolve();
}

export async function deleteAcademy(id: string): Promise<void> {
    academies = academies.filter(a => a.id !== id);
    // In a real scenario, you'd also delete all associated data (users, students, etc.)
    return Promise.resolve();
}
