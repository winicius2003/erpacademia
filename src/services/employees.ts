'use server';

import { format } from 'date-fns';

export type Role = "Admin" | "Gerente" | "Gestor" | "Professor" | "Recepção" | "Estagiário" | "Personal Trainer Externo";

export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    login: string;
    password: string;
    role: Role;
    status: "Ativo" | "Inativo";
    salary: number;
    workHours: string; // Ex: "08:00 - 17:00"
    cpf: string;
    rg?: string;
    rgIssuer?: string;
    cref?: string;
    accessPin?: string;
    universityInfo?: {
      universityName: string;
      course: string;
      expectedGraduation: string; // "MM/AAAA"
      contractStartDate: string; // "yyyy-MM-dd"
      contractEndDate: string; // "yyyy-MM-dd"
    };
};

// --- In-Memory Database ---
let employees: Employee[] = [
    { id: 'admin-master', name: 'Administrador Master', email: 'admin@admin', phone: '(11) 99999-0000', address: 'Rua Principal, 1', login: 'admin@admin', password: 'uUmope5Z', role: 'Admin', status: 'Ativo', salary: 10000, workHours: 'Integral', cpf: "000.000.000-00", rg: "12.345.678-9", rgIssuer: "SSP/SP" },
    { id: '1', name: 'Carla Silva', email: 'carla.silva@fitcore.com', phone: '(11) 99999-0001', address: 'Rua das Flores, 123', login: 'carla', password: '123', role: 'Gestor', status: 'Ativo', salary: 5000, workHours: '09:00 - 18:00', cpf: "111.111.111-11", accessPin: '9901' },
    { id: '2', name: 'Marcos Rocha', email: 'marcos.rocha@fitcore.com', phone: '(11) 99999-0002', address: 'Avenida Brasil, 456', login: 'marcos', password: '123', role: 'Professor', status: 'Ativo', salary: 3500, workHours: '06:00 - 15:00', cpf: "222.222.222-22", cref: '12345-G/SP', accessPin: '9902' },
    { id: '3', name: 'Juliana Alves', email: 'juliana.alves@fitcore.com', phone: '(11) 99999-0003', address: 'Praça da Sé, 789', login: 'juliana', password: '123', role: 'Recepção', status: 'Ativo', salary: 1800, workHours: '13:00 - 22:00', cpf: "333.333.333-33", accessPin: '9903' },
    { id: '4', name: 'Fernando Costa', email: 'fernando.costa@fitcore.com', phone: '(11) 99999-0004', address: 'Rua Augusta, 101', login: 'fernando', password: '123', role: 'Professor', status: 'Inativo', salary: 3500, workHours: '15:00 - 23:00', cpf: "444.444.444-44", cref: '54321-G/RJ', accessPin: '' },
    { id: '5', name: 'Beatriz Lima', email: 'beatriz.lima@fitcore.com', phone: '(11) 99999-0005', address: 'Alameda Santos, 202', login: 'bia', password: '123', role: 'Estagiário', status: 'Ativo', salary: 900, workHours: '18:00 - 22:00', cpf: "555.555.555-55", cref: '123456-E/SP', accessPin: '9905', universityInfo: { universityName: 'Universidade Fictícia', course: 'Educação Física', expectedGraduation: '12/2025', contractStartDate: '2024-01-15', contractEndDate: '2024-12-15' } },
    { id: '6', name: 'Ricardo Mendes', email: 'ricardo.mendes@fitcore.com', phone: '(11) 99999-0006', address: 'Rua Oscar Freire, 303', login: 'ricardo', password: '123', role: 'Recepção', status: 'Ativo', salary: 1800, workHours: '07:00 - 16:00', cpf: "666.666.666-66", accessPin: '9906' },
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

export async function getEmployeeByPin(pin: string): Promise<Employee | null> {
    if (!pin) return Promise.resolve(null);
    const employee = employees.find(e => e.accessPin === pin);
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
        emp.id === id ? { ...emp, ...employeeData } as Employee: emp
    );
    return Promise.resolve();
}

export async function deleteEmployee(id: string): Promise<void> {
    employees = employees.filter(emp => emp.id !== id);
    return Promise.resolve();
}
