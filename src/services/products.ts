'use server';

export type Product = {
    id: string;
    name: string;
    price: number;
    stock: number; // Current stock quantity
};

// In-Memory Database
let products: Product[] = [
    { id: 'prod-1', name: 'Garrafa de Água FitCore', price: 25.00, stock: 50 },
    { id: 'prod-2', name: 'Toalha de Treino', price: 35.00, stock: 30 },
    { id: 'prod-3', name: 'Barra de Proteína', price: 8.00, stock: 100 },
    { id: 'prod-4', name: 'Coqueteleira', price: 45.00, stock: 25 },
];
let nextId = products.length + 1;

export async function getProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(JSON.parse(JSON.stringify(products)));
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<string> {
    const newId = `prod-${nextId++}`;
    const newProduct: Product = { id: newId, ...productData };
    products.push(newProduct);
    return Promise.resolve(newId);
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> {
    products = products.map(p => p.id === id ? { ...p, ...productData } as Product : p);
    return Promise.resolve();
}

export async function deleteProduct(id: string): Promise<void> {
    products = products.filter(p => p.id !== id);
    return Promise.resolve();
}
