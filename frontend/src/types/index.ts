export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tape {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  coverImage: string;
  condition: string;
  price: number;
  sellerId: string;
  seller: User;
  publisherId: string | null;
  publisher: Publisher | null;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  description: string;
  logoImage: string;
  tapes: Tape[];
  createdAt: string;
  updatedAt: string;
} 