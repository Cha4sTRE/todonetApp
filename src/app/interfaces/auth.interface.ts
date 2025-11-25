export interface User {
  id?: number;
  email: string;
  username?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
