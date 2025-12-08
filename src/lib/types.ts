
import type { Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export type FirestoreCursor = QueryDocumentSnapshot<DocumentData, DocumentData> | null;

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export type WorkType = 'full_time' | 'part_time' | 'freelance' | 'remote';
export type PostType = 'seeking_worker' | 'seeking_job';
export type SortByType = 'latest' | 'oldest';

export interface Job {
  id: string;
  userId: string;
  postType: PostType;
  title: string;
  categoryId?: string;
  categoryName?: string;
  country: string;
  city: string;
  workType?: WorkType;
  description?: string;
  experience?: string;
  salary?: string;
  companyName?: string;
  openPositions?: number;
  availablePositions?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  rating?: number;
  likes?: number;
  postedAt: string; // This is a derived string like "2 days ago"
  createdAt: Timestamp;
  createdAtISO?: string;
  ownerName: string;
  ownerAvatarColor?: string;
  ownerPhotoURL?: string | null;
  applyUrl?: string;
  qualifications?: string;
  conditions?: string;
  tasks?: string;
  featuresAndOpportunities?: string;
  education?: string;
  status?: 'open' | 'closed';
  howToApply?: string;
  isNew?: boolean;
}

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  positionsAvailable?: string | number | null;
  availablePositions?: string;
  deadline: string; // last day for registration
  officialLink: string;
  email?: string;
  howToApply?: string;

  // Optional fields for more detail
  description?: string;
  trainingFeatures?: string;
  fileUrl?: string;
  
  jobProspects?: string; // أفق العمل
  requirements?: string; // الشروط (can include qualifications, age, etc.)
  competitionStages?: string; // مراحل المباراة
  documentsNeeded?: string;
  
  // New date fields
  registrationStartDate?: string;
  competitionDate?: string;

  // New optional fields
  competitionType?: string;
  location?: string;
  
  // Timestamps
  postedAt: string;
  createdAt: Timestamp;
  createdAtISO?: string;
  isNew?: boolean;
}

export type ImmigrationProgramType = 
  | 'work' 
  | 'study' 
  | 'seasonal' 
  | 'training' 
  | 'volunteer'
  | 'crafts'
  | 'health'
  | 'tech'
  | 'transport'
  | 'hospitality'
  | 'education'
  | 'agriculture'
  | 'livestock'
  | 'beauty';

export interface ImmigrationPost {
  id: string;
  title: string;
  slug?: string;
  targetCountry: string;
  city?: string;
  positionsAvailable?: string;
  availablePositions?: string;
  programType: ImmigrationProgramType;
  iconName?: string;
  targetAudience: string;
  salary?: string;
  deadline?: string;
  description?: string;
  requirements?: string;
  qualifications?: string;
  experience?: string;
  tasks?: string;
  featuresAndOpportunities?: string;
  howToApply?: string;
  applyUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  createdAt: Timestamp;
  createdAtISO?: string;
  postedAt: string;
  isNew?: boolean;
}


export interface Organizer {
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id:string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string | null;
  avatarColor?: string;
  createdAt?: Timestamp;
  isAdmin?: boolean;
}

export interface Testimonial {
    id: string;
    userId: string;
    userName: string;
    userAvatarColor: string;
    content: string;
    rating: number;
    createdAt: Timestamp;
    createdAtISO?: string;
    postedAt: string;
}

export interface Article {
    id: string;
    slug: string;
    title: string;
    author: string;
    imageUrl: string;
    summary: string;
    content: string;
    createdAt?: Timestamp; // Optional for static articles
    date?: string; // Optional for static articles
    postedAt?: string;
}

export interface Report {
    id: string;
    adId: string;
    adUrl: string;
    reason: string;
    details?: string;
    createdAt: Timestamp;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: Timestamp;
}


export interface Country {
  name: string;
  cities: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount?: number;
  lastDoc: FirestoreCursor;
}
