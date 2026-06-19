// IMPORTANT : ces champs correspondent EXACTEMENT à ce que retourne
// GET /api/apps/{id} — vérifié par test curl réel le 19/06/2026.
// Ne pas "deviner" ou "améliorer" les noms de champs : app_name (pas name),
// rating est une STRING ("4.6"), pas un number.

export interface AppCategory {
  id: number;
  name: string;
  name_arabic: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  subcategories: string[] | null;
  is_active: boolean;
  apps_count: number;
}

export interface AppDeveloper {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  is_verified: boolean;
}

export type AppPricingModel = 'free' | 'paid' | 'freemium';
export type AppLicenseType = 'monthly' | 'yearly' | 'one_time' | 'free';
export type SupportedPlatform = 'web' | 'android' | 'iOS';

export interface NoujoumApp {
  id: number;
  app_name: string;
  tagline: string | null;
  description: string;
  detailed_description: string | null;

  user_id: number;
  developer_name: string | null;
  developer_email: string | null;
  developer_phone: string | null;
  developer_whatsapp: string | null;
  company_name: string | null;
  developer_website: string | null;

  app_type: string | null;
  supported_platforms: SupportedPlatform[] | null;
  current_version: string | null;

  icon_url: string | null;
  screenshots: string[] | null;
  demo_videos: string[] | null;
  live_demo: string | null;
  download_link: string | null;

  license_type: AppLicenseType | null;
  pricing_model: AppPricingModel | null;
  pricing: string | null;
  has_free_trial: boolean;
  trial_days: number | null;
  is_open_source: boolean;

  target_audience: string | null;
  business_sectors: string[] | null;
  business_value: string | null;
  key_features: string[] | null;
  technical_requirements: string | null;

  has_documentation: boolean;
  documentation_url: string | null;
  support_options: string[] | null;
  languages: string[] | null;

  downloads: number;
  active_users: number | null;
  rating: string;
  view_count: number;

  publish_date: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_approved: boolean;

  category_id: number;
  subcategory: string | null;
  tags: string[] | null;
  search_keywords: string | null;

  created_at: string;
  updated_at: string;

  user?: AppDeveloper;
  category?: AppCategory;
}

export interface AppCreatePayload {
  app_name: string;
  tagline?: string;
  description: string;
  detailed_description?: string;
  category_id: number;
  subcategory?: string;
  target_audience?: string;
  icon_url?: string;
  screenshots?: string[];
  download_link?: string;
  developer_website?: string;
  app_type?: string;
  supported_platforms?: SupportedPlatform[];
  current_version?: string;
  pricing_model?: AppPricingModel;
  license_type?: AppLicenseType;
  pricing?: string;
  has_free_trial?: boolean;
  trial_days?: number;
  business_value?: string;
  key_features?: string[];
  business_sectors?: string[];
  support_options?: string[];
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// La pagination native Laravel (utilisée par GET /apps, /my-apps,
// /subscription/transactions) imbrique le tableau sous data.data,
// avec current_page/last_page au même niveau — vérifié par test curl
// le 19/06/2026. Les listes "convenience" (categories, packages,
// featured/most-downloaded/top-rated) renvoient un tableau brut sous data.
// PaginatedResponse couvre les deux cas réels ; utiliser unwrapPage() pour
// en extraire les éléments sans avoir à distinguer le format à la main.
export interface LaravelPage<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[] | LaravelPage<T>;
  message?: string;
}
