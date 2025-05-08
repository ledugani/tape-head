export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VHSTape {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  label: string;
  format: string;
  notes?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCollection {
  id: string;
  userId: string;
  vhsTapeId: string;
  condition: string;
  notes?: string;
  acquiredDate?: Date;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWantlist {
  id: string;
  userId: string;
  vhsTapeId: string;
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
} 