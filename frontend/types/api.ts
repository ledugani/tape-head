export interface Tape {
  id: string;
  title: string;
  director: string;
  year: number;
  coverImage: string;
}

export interface WantlistItem {
  id: string;
  tape: Tape;
  addedAt: string;
} 