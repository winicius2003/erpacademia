

'use server';

import { format, addMonths, differenceInDays, parseISO, subDays } from 'date-fns';
import type { Address } from './employees';

export type Member = {
  id: string,
  name: string,
  email: string,
  phone: string,
  plan: string,
  status: "Ativo" | "Inativo" | "Atrasado",
  expires: string, // yyyy-MM-dd
  cpf: string,
  rg: string,
  rgIssuer?: string,
  dob: string, // "yyyy-MM-dd"
  createdAt: string, // "yyyy-MM-dd"
  address: Address,
  professor: string,
  attendanceStatus: "Presente" | "Faltante",
  lastSeen: string, // "yyyy-MM-dd"
  workoutStatus: "Completo" | "Pendente",
  goal: string,
  notes: string,
  accessPin?: string,
  fingerprintRegistered?: boolean,
  password?: string;
  loginMethod?: 'google' | 'password';
  assignedPlanId?: string;
  guardian?: {
    name: string;
    cpf: string;
    phone: string;
  };
  medicalNotes?: string;
  theme?: 'light' | 'dark';
};

const defaultAddress: Address = { street: 'Rua Fictícia', number: '123', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01000-000' };

// --- In-Memory Database ---
// status and attendanceStatus are now calculated dynamically.
let members: Omit<Member, 'status' | 'attendanceStatus'>[] = [
  { id: '1', name: 'João da Silva', email: 'joao.silva@example.com', password: '123', loginMethod: 'password', phone: '(11) 98765-4321', plan: 'Anual', expires: format(addMonths(new Date(), 10), 'yyyy-MM-dd'), createdAt: '2023-08-15', cpf: "111.222.333-44", rg: "12.345.678-9", rgIssuer: "SSP/SP", dob: '1990-05-10', address: defaultAddress, professor: 'Marcos Rocha', lastSeen: format(new Date(), 'yyyy-MM-dd'), workoutStatus: 'Completo', goal: 'Hipertrofia', notes: 'Relatou dor no ombro esquerdo.', accessPin: '1234', fingerprintRegistered: true, assignedPlanId: '1', medicalNotes: 'Atestado médico válido até 2025-01-01. Liberado para atividades de alto impacto.', theme: 'dark' },
  { id: '2', name: 'Maria Oliveira', email: 'maria.oliveira@gmail.com', loginMethod: 'google', phone: '(21) 91234-5678', plan: 'Mensal', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), createdAt: '2024-06-01', cpf: "222.333.444-55", rg: "23.456.789-0", rgIssuer: "SSP/RJ", dob: '1995-07-22', address: defaultAddress, professor: 'Fernando Costa', lastSeen: format(subDays(new Date(), 5), 'yyyy-MM-dd'), workoutStatus: 'Pendente', goal: 'Emagrecimento', notes: '', accessPin: '5678', fingerprintRegistered: false, theme: 'light' },
  { id: '3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', password: '123', loginMethod: 'password', phone: '(31) 95555-4444', plan: 'Trimestral', expires: format(addMonths(new Date(), 2), 'yyyy-MM-dd'), createdAt: '2024-05-10', cpf: "333.444.555-66", rg: "34.567.890-1", rgIssuer: "SSP/MG", dob: '1985-11-23', address: defaultAddress, professor: 'Marcos Rocha', lastSeen: format(subDays(new Date(), 2), 'yyyy-MM-dd'), workoutStatus: 'Completo', goal: 'Definição muscular', notes: 'Asma, usar bombinha se necessário.', accessPin: '9012', fingerprintRegistered: true, theme: 'light' },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@example.com', password: '123', loginMethod: 'password', phone: '(41) 98888-7777', plan: 'Anual', expires: format(addMonths(new Date(), 6), 'yyyy-MM-dd'), createdAt: '2024-07-01', cpf: "444.555.666-77", rg: "45.678.901-2", rgIssuer: "SSP/PR", dob: '2000-02-15', address: defaultAddress, professor: 'Marcos Rocha', lastSeen: format(subDays(new Date(), 10), 'yyyy-MM-dd'), workoutStatus: 'Pendente', goal: 'Condicionamento físico', notes: '', accessPin: '4444', fingerprintRegistered: false, theme: 'light' },
  { id: '5', name: 'Bruno Santos', email: 'bruno.santos@gmail.com', loginMethod: 'google', phone: '(51) 97777-6666', plan: 'Mensal', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), createdAt: '2024-07-18', cpf: "555.666.777-88", rg: "56.789.012-3", rgIssuer: "SSP/RS", dob: '1998-09-30', address: defaultAddress, professor: 'Fernando Costa', lastSeen: format(subDays(new Date(), 1), 'yyyy-MM-dd'), workoutStatus: 'Pendente', goal: 'Ganho de força', notes: '', accessPin: '4321', fingerprintRegistered: false, theme: 'light' },
  { id: '6', name: 'Débora Martins', email: 'debora.martins@example.com', password: '123', loginMethod: 'password', phone: '(61) 96666-5555', plan: 'Mensal', expires: format(addMonths(new Date(), -2), 'yyyy-MM-dd'), createdAt: '2024-01-20', cpf: "666.777.888-99", rg: "67.890.123-4", rgIssuer: "SSP/DF", dob: '1995-03-20', address: defaultAddress, professor: 'Marcos Rocha', lastSeen: format(subDays(new Date(), 60), 'yyyy-MM-dd'), workoutStatus: 'Completo', goal: 'Manutenção', notes: '', accessPin: '1122', fingerprintRegistered: true, theme: 'light' },
  { id: '7', name: 'Pedro Junior', email: 'pedro.junior@example.com', password: '123', loginMethod: 'password', phone: '(71) 91111-2222', plan: 'Mensal', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), createdAt: '2024-07-15', cpf: "777.888.999-00", rg: "78.901.234-5", rgIssuer: "SSP/BA", dob: '2010-08-15', address: defaultAddress, professor: 'Marcos Rocha', lastSeen: format(new Date(), 'yyyy-MM-dd'), workoutStatus: 'Pendente', goal: 'Iniciação Esportiva', notes: '', accessPin: '7788', fingerprintRegistered: false, guardian: { name: 'Pedro Pai', cpf: '123.456.789-00', phone: '(71) 93333-4444' }, theme: 'light' },
];
let nextId = members.length + 1;
// -------------------------

// Helper function to calculate dynamic statuses
function calculateStatuses(member: Omit<Member, 'status' | 'attendanceStatus'>): { status: Member['status'], attendanceStatus: Member['attendanceStatus'] } {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    // Calculate plan status
    const expiresDate = parseISO(member.expires);
    const planDiff = differenceInDays(expiresDate, today);
    let status: Member['status'];
    if (planDiff >= 0) {
        status = 'Ativo';
    } else if (planDiff < 0 && planDiff >= -3) {
        status = 'Atrasado';
    } else { // planDiff < -3
        status = 'Inativo';
    }

    // Calculate attendance status
    const lastSeenDate = parseISO(member.lastSeen);
    const attendanceDiff = differenceInDays(today, lastSeenDate);
    const attendanceStatus: Member['attendanceStatus'] = attendanceDiff > 4 ? 'Faltante' : 'Presente';

    return { status, attendanceStatus };
}


export async function getMembers(): Promise<Member[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedMembers = members.map(member => ({
        ...member,
        ...calculateStatuses(member)
    }));

    return Promise.resolve(updatedMembers as Member[]);
}


export async function getMemberById(id: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const member = members.find(m => m.id === id);
    if (!member) return null;

    return Promise.resolve({ ...member, ...calculateStatuses(member) } as Member);
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const memberData = members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (!memberData) return null;
    
    return Promise.resolve({ ...memberData, ...calculateStatuses(memberData) } as Member);
}


export async function getMemberByPin(pin: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!pin) return Promise.resolve(null);
    const memberData = members.find(m => m.accessPin === pin);
    if (!memberData) return null;
    
    return Promise.resolve({ ...memberData, ...calculateStatuses(memberData) } as Member);
}

export async function addMember(memberData: Omit<Member, 'id' | 'password' | 'loginMethod' | 'status' | 'attendanceStatus' | 'createdAt'>): Promise<Member> {
    const newId = (nextId++).toString();
    const newMember: Partial<Member> = {
        id: newId,
        ...memberData,
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        lastSeen: memberData.lastSeen || format(new Date(), 'yyyy-MM-dd'),
        theme: 'light', // Default theme
    };

    if (newMember.email?.toLowerCase().endsWith('@gmail.com')) {
        newMember.loginMethod = 'google';
        // No password needed for Google sign-in
    } else {
        newMember.loginMethod = 'password';
        newMember.password = Math.random().toString(36).slice(-8);
    }
    
    const statuses = calculateStatuses(newMember as Omit<Member, 'status' | 'attendanceStatus'>);
    const finalNewMember = { ...newMember, ...statuses } as Member;

    members.push(finalNewMember as any); // Use 'as any' to bypass strict Omit check in mock DB
    return Promise.resolve(finalNewMember);
}

export async function updateMember(id: string, memberData: Partial<Omit<Member, 'id' | 'status' | 'attendanceStatus'>>): Promise<void> {
    members = members.map(mem => 
        mem.id === id ? { ...mem, ...memberData } as Member : mem
    );
    return Promise.resolve();
}

export async function deleteMember(id: string): Promise<void> {
    members = members.filter(mem => mem.id !== id);
    return Promise.resolve();
}
