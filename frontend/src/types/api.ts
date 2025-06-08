export interface Tape {
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

export interface WantlistItem {
  id: string;
  tape: Tape;
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 