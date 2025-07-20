'use server';
import { format } from 'date-fns';
import { addEmployee } from './employees';
import { getMembers } from './members';

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
    createdAt: string; // yyyy-MM-dd
};

// --- In-Memory Database for Academies ---
let academies: Omit<Academy, 'studentCount'>[] = [
    { id: 'gym-1', name: 'Academia Exemplo', status: 'Ativa', adminName: 'Administrador Master', adminEmail: 'admin@admin', subscriptionPlan: 'Business', expiresAt: '2025-07-20', createdAt: '2023-01-15' },
    { id: 'gym-2', name: 'Maromba Fit', status: 'Ativa', adminName: 'Carlos Silva', adminEmail: 'carlos@marombafit.com', subscriptionPlan: 'Iniciante', expiresAt: '2024-08-15', createdAt: '2024-02-20' },
    { id: 'gym-3', name: 'Corpo & Ação', status: 'Suspensa', adminName: 'Juliana Paes', adminEmail: 'juliana@corpoeacao.com', subscriptionPlan: 'Profissional', expiresAt: '2024-06-30', createdAt: '2024-03-10' },
    { id: 'gym-4', name: 'Power House Gym', status: 'Ativa', adminName: 'Roberto Lima', adminEmail: 'roberto@powerhouse.com', subscriptionPlan: 'Enterprise', expiresAt: '2025-05-01', createdAt: '2024-05-01' },
];
let nextId = academies.length + 1;
// -----------------------------------------

export async function getAcademies(): Promise<Academy[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real multi-tenant app, you'd filter members by academyId.
    // Here, we'll assign all members to the first academy for demo purposes.
    const allMembers = await getMembers();

    const academiesWithCounts = academies.map((academy, index) => ({
        ...academy,
        studentCount: index === 0 ? allMembers.length : 0 // Assign all students to the main academy
    }));

    return Promise.resolve(JSON.parse(JSON.stringify(academiesWithCounts)));
}

export async function addAcademy(academyData: Omit<Academy, 'id' | 'status' | 'studentCount' | 'createdAt'>, adminPassword: string): Promise<string> {
    const newId = `gym-${nextId++}`;
    const newAcademy: Omit<Academy, 'studentCount'> = {
        id: newId,
        status: 'Ativa',
        createdAt: format(new Date(), 'yyyy-MM-dd'),
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

export async function updateAcademy(id: string, academyData: Partial<Omit<Academy, 'id' | 'studentCount'>>): Promise<void> {
    academies = academies.map(a => a.id === id ? { ...a, ...academyData } as Academy : a);
    return Promise.resolve();
}

export async function deleteAcademy(id: string): Promise<void> {
    academies = academies.filter(a => a.id !== id);
    // In a real scenario, you'd also delete all associated data (users, students, etc.)
    return Promise.resolve();
}

    