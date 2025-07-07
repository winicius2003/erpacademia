
'use server';

import { format } from 'date-fns';

export type ExpenseCategory = "Fornecedores" | "Salários" | "Manutenção" | "Marketing" | "Outros";

export type Expense = {
    id: string;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string; // "yyyy-MM-dd"
    time: string; // "HH:mm"
    registeredById: string;
    registeredByName: string;
};

// --- In-Memory Database ---
let expenses: Expense[] = [
    {
        id: 'e1',
        description: 'Pagamento de fornecedor de suplementos',
        amount: 1250.75,
        category: 'Fornecedores',
        date: '2024-07-20',
        time: '10:00',
        registeredById: '1',
        registeredByName: 'Carla Silva'
    },
    {
        id: 'e2',
        description: 'Material de limpeza',
        amount: 150.00,
        category: 'Manutenção',
        date: format(new Date(), "yyyy-MM-dd"),
        time: '11:30',
        registeredById: '1',
        registeredByName: 'Carla Silva'
    }
];
let nextId = expenses.length + 1;
// -------------------------

export async function getExpenses(): Promise<Expense[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(JSON.parse(JSON.stringify(expenses)));
}

export async function addExpense(expenseData: Omit<Expense, 'id'>): Promise<Expense> {
    const newId = `e${nextId++}`;
    const newExpense: Expense = {
        id: newId,
        ...expenseData
    };
    expenses.unshift(newExpense);
    return Promise.resolve(newExpense);
}
