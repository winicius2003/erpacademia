'use server';

export type Notification = {
    id: string;
    academyId: string; // 'all' for broadcast or specific academy ID like 'gym-1'
    title: string;
    description: string;
    createdAt: Date;
    isRead: boolean;
};

// --- In-Memory Database for Notifications ---
let notifications: Notification[] = [
    {
        id: 'n1',
        academyId: 'all',
        title: 'Atualização do Sistema',
        description: 'O sistema será atualizado hoje às 23h para melhorias de performance.',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        isRead: false,
    },
    {
        id: 'n2',
        academyId: 'gym-1',
        title: 'Assinatura a vencer',
        description: 'Sua assinatura FitCore expira em 3 dias. Renove para evitar interrupções.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: true,
    }
];
let nextId = notifications.length + 1;
// ------------------------------------------

/**
 * Adds a new notification. Called by the Superadmin.
 * @param notificationData - The data for the new notification.
 */
export async function addNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const newId = `n${nextId++}`;
    const newNotification: Notification = {
        id: newId,
        ...notificationData,
        createdAt: new Date(),
        isRead: false,
    };
    notifications.unshift(newNotification); // Add to the top
    return Promise.resolve(newId);
}

/**
 * Retrieves notifications for a specific academy, including broadcast messages.
 * @param academyId - The ID of the academy to fetch notifications for.
 */
export async function getNotificationsForAcademy(academyId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    const academyNotifications = notifications.filter(n => n.academyId === academyId || n.academyId === 'all');
    
    return Promise.resolve(JSON.parse(JSON.stringify(academyNotifications)));
}

/**
 * Marks a specific notification as read.
 * @param notificationId - The ID of the notification to mark as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
    notifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
    );
    return Promise.resolve();
}
