export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoImage?: string;
  tapes: Tape[];
}

export interface BoxSet {
  id: string;
  title: string;
  year?: number;
  label?: string;
  coverImage?: string;
  description?: string;
  tapes: Tape[];
}

export interface Tape {
  id: number;
  title: string;
  year: number;
  genre?: string;
  format?: string;
  label?: string;
  coverImage?: string;
  notes?: string;
  publisherId?: string;
  publisher?: Publisher;
  boxSetId?: number;
  boxSet?: BoxSet;
  createdAt: string;
  updatedAt: string;
}

export interface WantlistItem {
  id: string;
  tape: Tape;
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 