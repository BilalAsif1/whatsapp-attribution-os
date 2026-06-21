export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type ConversationStatus =
  | 'new'
  | 'active'
  | 'qualified'
  | 'proposal_sent'
  | 'converted'
  | 'lost'
  | 'archived';

export type AdPlatform =
  | 'google_ads'
  | 'meta_ads'
  | 'tiktok_ads'
  | 'linkedin_ads'
  | 'microsoft_ads';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export type PlanId = 'starter' | 'growth' | 'agency';

export type AttributionModel =
  | 'first_touch'
  | 'last_touch'
  | 'linear'
  | 'time_decay'
  | 'position_based';

export type UploadStatus = 'pending' | 'queued' | 'uploaded' | 'failed' | 'skipped';

export interface ClickIds {
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  li_fat_id?: string;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardOverview {
  clicks: number;
  conversations: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  avgRevenuePerConversion: number;
  clicksChange: number;
  conversationsChange: number;
  conversionsChange: number;
  revenueChange: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  adPlatform: AdPlatform;
  clicks: number;
  conversations: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  costPerConversion?: number;
}
