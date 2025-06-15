export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoImage: string;
  tapes: Tape[];
  createdAt: string;
  updatedAt: string;
}

export interface BoxSet {
  id: number;
  title: string;
  year?: number;
  label?: string;
  coverImage?: string;
  description?: string;
  tapes: Tape[];
  createdAt: string;
}

export interface Tape {
  id: string;
  title: string;
  year: number;
  genre?: string;
  format?: string;
  label?: string;
  coverImage?: string;
  notes?: string;
  condition?: string;
  publisherId?: string;
  publisher?: Publisher;
  boxSetId?: number;
  boxSet?: BoxSet;
  createdAt: string;
  updatedAt: string;
  edition?: string;
  releaseYear?: number;
  vhsReleaseYear?: number;
  runningTime?: number;
  videoStandard?: 'NTSC' | 'PAL' | 'SECAM' | 'Other';
  audioType?: string;
  packagingType?: 'slipcase' | 'clamshell' | 'big_box' | 'other';
  distributor?: string;
  productionCompany?: string;
  catalogNumber?: string;
  upcBarcode?: string;
  rating?: string;
  languages?: string[];
  subtitles?: string[];
  specialFeatures?: string;
  physicalCondition?: string;
}

export interface WantlistItem {
  id: string;
  tape: Tape;
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionItem {
  id: string;
  tape: Tape;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 