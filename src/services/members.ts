
'use server';

import { format, addMonths, differenceInDays, parseISO } from 'date-fns';

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
  dob: string, // "yyyy-MM-dd"
  professor: string,
  attendanceStatus: "Presente" | "Faltante",
  workoutStatus: "Completo" | "Pendente",
  goal: string,
  notes: string,
  accessPin?: string,
  fingerprintRegistered?: boolean,
};


// --- In-Memory Database ---
// Status is now dynamically calculated in getMembers(), no need to hardcode it here.
let members: Omit<Member, 'status'>[] = [
  { id: '1', name: 'João da Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321', plan: 'Anual', expires: format(addMonths(new Date(), 10), 'yyyy-MM-dd'), cpf: "111.222.333-44", rg: "12.345.678-9", dob: '1990-05-10', professor: 'Marcos Rocha', attendanceStatus: 'Presente', workoutStatus: 'Completo', goal: 'Hipertrofia', notes: 'Relatou dor no ombro esquerdo.', accessPin: '1234', fingerprintRegistered: true },
  { id: '2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', phone: '(21) 91234-5678', plan: 'Mensal', expires: format(new Date(), 'yyyy-MM-dd'), cpf: "222.333.444-55", rg: "23.456.789-0", dob: format(new Date(), 'yyyy-MM-dd'), professor: 'Fernando Costa', attendanceStatus: 'Faltante', workoutStatus: 'Pendente', goal: 'Emagrecimento', notes: 'Aniversariante de hoje.', accessPin: '5678', fingerprintRegistered: false },
  { id: '3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', phone: '(31) 95555-4444', plan: 'Trimestral', expires: format(addMonths(new Date(), -1), 'yyyy-MM-dd'), cpf: "333.444.555-66", rg: "34.567.890-1", dob: '1985-11-23', professor: 'Marcos Rocha', attendanceStatus: 'Presente', workoutStatus: 'Completo', goal: 'Definição muscular', notes: 'Asma, usar bombinha se necessário.', accessPin: '9012', fingerprintRegistered: true },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@example.com', phone: '(41) 98888-7777', plan: 'Anual', expires: format(addMonths(new Date(), 6), 'yyyy-MM-dd'), cpf: "444.555.666-77", rg: "45.678.901-2", dob: '2000-02-15', professor: 'Marcos Rocha', attendanceStatus: 'Faltante', workoutStatus: 'Pendente', goal: 'Condicionamento físico', notes: '', accessPin: '4444', fingerprintRegistered: false },
  { id: '5', name: 'Bruno Santos', email: 'bruno.santos@example.com', phone: '(51) 97777-6666', plan: 'Mensal', expires: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), cpf: "555.666.777-88", rg: "56.789.012-3", dob: '1998-09-30', professor: 'Fernando Costa', attendanceStatus: 'Presente', workoutStatus: 'Pendente', goal: 'Ganho de força', notes: '', accessPin: '4321', fingerprintRegistered: false },
  { id: '6', name: 'Débora Martins', email: 'debora.martins@example.com', phone: '(61) 96666-5555', plan: 'Mensal', expires: format(addMonths(new Date(), -2), 'yyyy-MM-dd'), cpf: "666.777.888-99", rg: "67.890.123-4", dob: '1995-03-20', professor: 'Marcos Rocha', attendanceStatus: 'Faltante', workoutStatus: 'Completo', goal: 'Manutenção', notes: '', accessPin: '1122', fingerprintRegistered: true },
];
let nextId = members.length + 1;
// -------------------------

export async function getMembers(): Promise<Member[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    const updatedMembers = members.map(member => {
        const expiresDate = parseISO(member.expires);
        const diff = differenceInDays(expiresDate, today);

        let newStatus: Member['status'];

        if (diff >= 0) {
            newStatus = 'Ativo';
        } else if (diff < 0 && diff >= -3) {
            newStatus = 'Atrasado';
        } else { // diff < -3
            newStatus = 'Inativo';
        }

        return { ...member, status: newStatus };
    });

    return Promise.resolve(updatedMembers);
}


export async function getMemberById(id: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const member = members.find(m => m.id === id);
    if (!member) return null;

    // Also apply dynamic status for single member fetch
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiresDate = parseISO(member.expires);
    const diff = differenceInDays(expiresDate, today);
    
    let status: Member['status'];
    if (diff >= 0) {
        status = 'Ativo';
    } else if (diff < 0 && diff >= -3) {
        status = 'Atrasado';
    } else {
        status = 'Inativo';
    }

    return Promise.resolve({ ...member, status });
}

export async function getMemberByPin(pin: string): Promise<Member | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const member = members.find(m => m.accessPin === pin);
    if (!member) return null;
    
    // Also apply dynamic status for single member fetch
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiresDate = parseISO(member.expires);
    const diff = differenceInDays(expiresDate, today);

    let status: Member['status'];
    if (diff >= 0) {
        status = 'Ativo';
    } else if (diff < 0 && diff >= -3) {
        status = 'Atrasado';
    } else {
        status = 'Inativo';
    }
    
    return Promise.resolve({ ...member, status });
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
