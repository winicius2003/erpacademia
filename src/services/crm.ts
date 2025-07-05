'use server';

export type LeadStatus = "Novo Lead" | "Contato Iniciado" | "Negociação" | "Vendido" | "Perdido";

export type Lead = {
    id: string;
    name: string;
    contact: string; // Phone or email
    source: string; // Ex: "Instagram", "Indicação"
    status: LeadStatus;
    createdAt: Date;
};

// --- In-Memory Database ---
let leads: Lead[] = [
    { id: 'l1', name: 'Mariana Costa', contact: '(11) 91111-1111', source: 'Instagram', status: 'Novo Lead', createdAt: new Date() },
    { id: 'l2', name: 'Ricardo Souza', contact: 'ricardo.s@email.com', source: 'Indicação', status: 'Novo Lead', createdAt: new Date() },
    { id: 'l3', name: 'Beatriz Lima', contact: '(21) 92222-2222', source: 'Site', status: 'Contato Iniciado', createdAt: new Date() },
    { id: 'l4', name: 'Lucas Martins', contact: '(31) 93333-3333', source: 'Visita', status: 'Negociação', createdAt: new Date() },
    { id: 'l5', name: 'Gabriela Dias', contact: 'gabi.dias@email.com', source: 'Instagram', status: 'Vendido', createdAt: new Date() },
    { id: 'l6', name: 'Felipe Almeida', contact: '(41) 94444-4444', source: 'Site', status: 'Perdido', createdAt: new Date() },
];
let nextId = leads.length + 1;
// -------------------------

export async function getLeads(): Promise<Lead[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(JSON.parse(JSON.stringify(leads)));
}

export async function addLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<string> {
    const newId = `l${nextId++}`;
    const newLead: Lead = {
        id: newId,
        ...leadData,
        createdAt: new Date(),
    };
    leads.push(newLead);
    return Promise.resolve(newId);
}

export async function updateLead(id: string, leadData: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<void> {
    leads = leads.map(l => 
        l.id === id ? { ...l, ...leadData } as Lead : l
    );
    return Promise.resolve();
}

export async function deleteLead(id: string): Promise<void> {
    leads = leads.filter(l => l.id !== id);
    return Promise.resolve();
}
