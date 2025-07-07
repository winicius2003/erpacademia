'use server';

import { format, addMonths } from 'date-fns';

export type Member = {
  id: string,
  name: string,
  email: string,
  phone: string,
  plan: string,
  status: "Ativo" | "Inativo" | "Atrasado",
  expires: string,
  cpf: string,
  rg: string,
  professor: string,
  attendanceStatus: "Presente" | "Faltante",
  workoutStatus: "Completo" | "Pendente",
  goal: string,
  notes: string,
  accessPin?: string,
  fingerprintRegistered?: boolean,
};


// --- In-Memory Database ---
let members: Member[] = [
  { id: '1', name: 'João da Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321', plan: 'Anual', status: 'Ativo', expires: format(addMonths(new Date(), 10), 'yyyy-MM-dd'), cpf: "111.222.333-44", rg: "12.345.678-9", professor: 'Marcos Rocha', attendanceStatus: 'Presente', workoutStatus: 'Completo', goal: 'Hipertrofia', notes: 'Relatou dor no ombro esquerdo.', accessPin: '1234', fingerprintRegistered: true },
  { id: '2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', phone: '(21) 91234-5678', plan: 'Mensal', status: 'Ativo', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), cpf: "222.333.444-55", rg: "23.456.789-0", professor: 'Fernando Costa', attendanceStatus: 'Faltante', workoutStatus: 'Pendente', goal: 'Emagrecimento', notes: 'Nenhuma observação.', accessPin: '5678', fingerprintRegistered: false },
  { id: '3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', phone: '(31) 95555-4444', plan: 'Trimestral', status: 'Atrasado', expires: format(addMonths(new Date(), -1), 'yyyy-MM-dd'), cpf: "333.444.555-66", rg: "34.567.890-1", professor: 'Marcos Rocha', attendanceStatus: 'Presente', workoutStatus: 'Completo', goal: 'Definição muscular', notes: 'Asma, usar bombinha se necessário.', accessPin: '9012', fingerprintRegistered: true },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@example.com', phone: '(41) 98888-7777', plan: 'Anual', status: 'Inativo', expires: format(addMonths(new Date(), -2), 'yyyy-MM-dd'), cpf: "444.555.666-77", rg: "45.678.901-2", professor: 'Não atribuído', attendanceStatus: 'Faltante', workoutStatus: 'Pendente', goal: 'Condicionamento físico', notes: '', accessPin: '', fingerprintRegistered: false },
  { id: '5', name: 'Bruno Santos', email: 'bruno.santos@example.com', phone: '(51) 97777-6666', plan: 'Mensal', status: 'Ativo', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), cpf: "555.666.777-88", rg: "56.789.012-3", professor: 'Fernando Costa', attendanceStatus: 'Presente', workoutStatus: 'Pendente', goal: 'Ganho de força', notes: '', accessPin: '4321', fingerprintRegistered: false },
];
let nextId = members.length + 1;
// -------------------------

export async function getMembers(): Promise<Member[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(members);
}

export async function getMemberById(id: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const member = members.find(m => m.id === id);
    return Promise.resolve(member || null);
}

export async function getMemberByPin(pin: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const member = members.find(m => m.accessPin === pin);
    return Promise.resolve(member || null);
}

export async function addMember(memberData: Omit<Member, 'id'>): Promise<Member> {
    const newId = (nextId++).toString();
    const newMember: Member = {
        id: newId,
        ...memberData,
    };
    members.push(newMember);
    return Promise.resolve(newMember);
}

export async function updateMember(id: string, memberData: Partial<Omit<Member, 'id'>>): Promise<void> {
    members = members.map(mem => 
        mem.id === id ? { ...mem, ...memberData } as Member : mem
    );
    return Promise.resolve();
}

export async function deleteMember(id: string): Promise<void> {
    members = members.filter(mem => mem.id !== id);
    return Promise.resolve();
}
