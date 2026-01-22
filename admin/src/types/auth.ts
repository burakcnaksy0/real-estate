export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
    name?: string;
    surname?: string;
    profilePicture?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    name: string;
    surname: string;
    profilePicture: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}
