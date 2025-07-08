'use server';

import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type AccessLog = {
    id: string;
    timestamp: Date;
    userName: string;
    userEmail: string;
    userType: 'Aluno' | 'Funcionário';
    status: 'Permitido' | 'Bloqueado';
    blockReason: string | null;
    identificationMethod: 'PIN' | 'Biometria' | 'Facial';
    collector: string;
    liberator: string;
};

// --- In-Memory Database for Access Logs ---
const initialLogs: AccessLog[] = [
    { id: 'log1', timestamp: subDays(new Date(), 1), userName: 'João da Silva', userEmail: 'joao.silva@example.com', userType: 'Aluno', status: 'Permitido', blockReason: null, identificationMethod: 'PIN', collector: 'Catraca Principal', liberator: 'Sistema' },
    { id: 'log2', timestamp: subDays(new Date(), 2), userName: 'Maria Oliveira', userEmail: 'maria.oliveira@example.com', userType: 'Aluno', status: 'Permitido', blockReason: null, identificationMethod: 'Biometria', collector: 'Catraca Principal', liberator: 'Sistema' },
    { id: 'log3', timestamp: new Date(), userName: 'Carlos Pereira', userEmail: 'carlos.pereira@example.com', userType: 'Aluno', status: 'Bloqueado', blockReason: 'Plano vencido', identificationMethod: 'PIN', collector: 'Catraca Principal', liberator: 'Sistema' },
    { id: 'log4', timestamp: new Date(), userName: 'Carla Silva', userEmail: 'carla.silva@fitcore.com', userType: 'Funcionário', status: 'Permitido', blockReason: null, identificationMethod: 'PIN', collector: 'Catraca Principal', liberator: 'Sistema' },
];

let accessLogs: AccessLog[] = [...initialLogs];
let nextId = accessLogs.length + 1;
// ----------------------------------------

export async function logAccess(data: Omit<AccessLog, 'id' | 'timestamp'>): Promise<void> {
    const newLog: AccessLog = {
        id: `log${nextId++}`,
        timestamp: new Date(),
        ...data
    };
    accessLogs.unshift(newLog);
    return Promise.resolve();
}

export async function getRecentAccessLogs(limit: number = 10): Promise<AccessLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const sortedLogs = accessLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(JSON.parse(JSON.stringify(sortedLogs.slice(0, limit))));
}

export async function getAccessLogsByPeriod(from: Date, to: Date): Promise<AccessLog[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const periodLogs = accessLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfDay(from) && logDate <= endOfDay(to);
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return Promise.resolve(JSON.parse(JSON.stringify(periodLogs)));
}
