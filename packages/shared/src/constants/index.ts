export const UID_PREFIX = 'WAO';
export const UID_LENGTH = 6;

export const CONVERSATION_STATUSES = [
  'new', 'engaged', 'qualified', 'converted', 'lost',
] as const;

export const AD_PLATFORMS = [
  'google_ads', 'meta_ads', 'tiktok_ads', 'linkedin_ads', 'microsoft_ads',
] as const;

export const WORKSPACE_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3,
};

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceCents: 2900,
    workspaceLimit: 1,
    features: [
      '1 workspace',
      '500 tracked clicks/mo',
      '100 conversations/mo',
      'Google Ads integration',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    priceCents: 7900,
    workspaceLimit: 5,
    features: [
      '5 workspaces',
      '5,000 tracked clicks/mo',
      '1,000 conversations/mo',
      'All ad platforms',
      'Revenue tracking',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 149,
    priceCents: 14900,
    workspaceLimit: 25,
    features: [
      '25 workspaces',
      '25,000 tracked clicks/mo',
      '5,000 conversations/mo',
      'All ad platforms',
      'White-label reports',
      'API access',
      'Dedicated support',
    ],
  },
] as const;

export const ATTRIBUTION_WINDOWS = {
  default: 30,
  min: 1,
  max: 90,
} as const;

export const TRACKING_SCRIPT_VERSION = '1.0.0';
