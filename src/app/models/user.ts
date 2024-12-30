export interface Task {
    id: string;
    name: string;
    description?: string;
    dueDate?: Date; // ISO date string format (e.g., "2024-01-01T12:00:00Z")
    status?: string;
}

export interface UserProfile {
    uid: string;
    fullName?: string;
    email?: string;
    tasks?: Task[]; // Array of tasks
    changes?: string[];
}