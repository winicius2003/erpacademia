'use server';

import { format } from 'date-fns';

export type Role = "Admin" | "Gestor" | "Professor" | "Recepção" | "Estagiário";

export type Employee = {
    id: string;
    name: string;
    email: string;
    login: string;
    password: string;
    role: Role;
    status: "Ativo" | "Inativo";
    salary: number;
    workHours: string; // Ex: "08:00 - 17:00"
};

// --- In-Memory Database ---
let employees: Employee[] = [
    { id: '1', name: 'Carla Silva', email: 'carla.silva@fitcore.com', login: 'carla', password: '123', role: 'Gestor', status: 'Ativo', salary: 5000, workHours: '09:00 - 18:00' },
    { id: '2', name: 'Marcos Rocha', email: 'marcos.rocha@fitcore.com', login: 'marcos', password: '123', role: 'Professor', status: 'Ativo', salary: 3500, workHours: '06:00 - 15:00' },
    { id: '3', name: 'Juliana Alves', email: 'juliana.alves@fitcore.com', login: 'juliana', password: '123', role: 'Recepção', status: 'Ativo', salary: 1800, workHours: '13:00 - 22:00' },
    { id: '4', name: 'Fernando Costa', email: 'fernando.costa@fitcore.com', login: 'fernando', password: '123', role: 'Professor', status: 'Inativo', salary: 3500, workHours: '15:00 - 23:00' },
    { id: '5', name: 'Beatriz Lima', email: 'beatriz.lima@fitcore.com', login: 'bia', password: '123', role: 'Estagiário', status: 'Ativo', salary: 900, workHours: '18:00 - 22:00' },
];
let nextId = employees.length + 1;
// -------------------------

export async function getEmployees(): Promise<Employee[]> {
    return Promise.resolve(employees);
}

export async function getEmployeeByLogin(login: string): Promise<Employee | null> {
    const employee = employees.find(e => e.login.toLowerCase() === login.toLowerCase());
    return Promise.resolve(employee || null);
}

export async function addEmployee(employeeData: Omit<Employee, 'id'>): Promise<string> {
    const newId = (nextId++).toString();
    const newEmployee: Employee = {
        id: newId,
        ...employeeData,
    };
    employees.push(newEmployee);
    return Promise.resolve(newId);
}

export async function updateEmployee(id: string, employeeData: Partial<Omit<Employee, 'id'>>): Promise<void> {
    employees = employees.map(emp => 
        emp.id === id ? { ...emp, ...employeeData } : emp
    );
    return Promise.resolve();
}

export async function deleteEmployee(id: string): Promise<void> {
    employees = employees.filter(emp => emp.id !== id);
    return Promise.resolve();
}
