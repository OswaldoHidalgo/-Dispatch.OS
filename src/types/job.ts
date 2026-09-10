export type JobStatus = 'new' | 'saved' | 'applied';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  publishedAt: string;
  source: string;
  tags: string[];
  logoUrl?: string;
  contactEmail?: string;
  status: JobStatus;
}