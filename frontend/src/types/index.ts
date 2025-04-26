// Content types supported by the API
export enum ContentType {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  FACEBOOK = 'facebook',
  THUMBNAIL = 'thumbnail',
  TWITTER_IMAGE = 'twitter_image',
  INSTAGRAM_IMAGE = 'instagram_image',
}

// Job status
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Job output
export interface JobOutput {
  id: string;
  content_type: ContentType;
  content: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

// Job
export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error_message: string | null;
  job_metadata: {
    content_types: ContentType[];
    tone?: string;
    hashtags?: string[];
    [key: string]: any;
  };
  outputs: JobOutput[];
}

// Content submission form
export interface ContentSubmissionForm {
  title: string;
  content: string;
  content_types: ContentType[];
  metadata?: {
    tone?: string;
    hashtags?: string[];
    style?: string;
  };
}

// User
export interface User {
  id: string;
  email: string;
  full_name: string;
}

// Auth
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
