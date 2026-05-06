export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  isBanned: boolean;
  banReason?: string;
  lastLogin: any;
  createdAt: any;
}

export interface ImageMetadata {
  file_name: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  dominant_colors: string[];
  objects_detected: string[];
  mood: string;
  usage_suggestions: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  metadata?: ImageMetadata;
  error?: string;
}
