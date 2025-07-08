
'use server';

export type GympassCheckin = {
    id: string;
    userId: string;
    userName: string;
    timestamp: Date;
};

// --- In-Memory Database for Gympass Check-ins ---
let checkins: GympassCheckin[] = [
    { id: 'gc1', userId: 'gympass_user_123', userName: 'Joana Doe', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 'gc2', userId: 'gympass_user_456', userName: 'Carlos Mendes', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
];
let nextId = checkins.length + 1;
// --------------------------------------------------

export async function getGympassCheckins(): Promise<GympassCheckin[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Sort by most recent
    const sortedCheckins = checkins.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return Promise.resolve(JSON.parse(JSON.stringify(sortedCheckins)));
}

export async function logGympassCheckin({ userId, userName }: { userId: string, userName: string }): Promise<string> {
    const newId = `gc${nextId++}`;
    const newCheckin: GympassCheckin = {
        id: newId,
        userId,
        userName,
        timestamp: new Date(),
    };
    checkins.unshift(newCheckin);
    return Promise.resolve(newId);
}
