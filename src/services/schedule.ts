'use server';

export type ScheduledClass = {
    id: string;
    name: string; // Ex: "Ritbox", "Muay Thai"
    dayOfWeek: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    instructorId: string;
    instructorName: string;
    plan: "All-inclusive" | "Aeróbico" | "Lutas";
};

// --- In-Memory Database ---
let classes: ScheduledClass[] = [
    { id: 'c1', name: 'Ritbox', dayOfWeek: 'Terça', startTime: '08:00', endTime: '09:00', instructorId: '2', instructorName: 'Marcos Rocha', plan: 'Aeróbico' },
    { id: 'c2', name: 'Ritbox', dayOfWeek: 'Terça', startTime: '18:00', endTime: '19:00', instructorId: '4', instructorName: 'Fernando Costa', plan: 'Aeróbico' },
    { id: 'c3', name: 'Muay Thai', dayOfWeek: 'Terça', startTime: '21:00', endTime: '22:00', instructorId: '2', instructorName: 'Marcos Rocha', plan: 'Lutas' },
    { id: 'c4', name: 'Fit Dance', dayOfWeek: 'Quarta', startTime: '08:00', endTime: '09:00', instructorId: '4', instructorName: 'Fernando Costa', plan: 'All-inclusive' },
    { id: 'c5', name: 'Fit Dance', dayOfWeek: 'Quarta', startTime: '19:00', endTime: '20:00', instructorId: '2', instructorName: 'Marcos Rocha', plan: 'All-inclusive' },
];
let nextId = classes.length + 1;
// -------------------------

export async function getSchedule(): Promise<ScheduledClass[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve(JSON.parse(JSON.stringify(classes)));
}

export async function addClass(classData: Omit<ScheduledClass, 'id'>): Promise<string> {
    const newId = `c${nextId++}`;
    const newClass: ScheduledClass = {
        id: newId,
        ...classData,
    };
    classes.push(newClass);
    return Promise.resolve(newId);
}

export async function updateClass(id: string, classData: Partial<Omit<ScheduledClass, 'id'>>): Promise<void> {
    classes = classes.map(cls => 
        cls.id === id ? { ...cls, ...classData } as ScheduledClass : cls
    );
    return Promise.resolve();
}

export async function deleteClass(id: string): Promise<void> {
    classes = classes.filter(cls => cls.id !== id);
    return Promise.resolve();
}
