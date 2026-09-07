export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string;
  details?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  idea: string;
  product_service: string;
  target_audience: string;
  age_group?: string;
  location?: string;
  interests?: string;
  pain_points?: string;
  goal: string;
  tone: string;
  language: string;
  key_points?: string;
  cta?: string;
  keywords?: string;
  hashtag_preference?: string;
  additional_instructions?: string;
  created_at: string;
  updated_at: string;
  generation_count?: number;
}

export interface CampaignListResponse {
  total: number;
  items: Campaign[];
}

export interface ImagePromptDetails {
  subject?: string;
  environment?: string;
  composition?: string;
  lighting?: string;
  color_palette?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
}

export interface VideoScene {
  scene_number: number;
  timestamp: string;
  visual: string;
  camera: string;
  voiceover: string;
  text_overlay?: string;
}

export interface VideoScriptDetails {
  concept: string;
  duration: string;
  scenes: VideoScene[];
  audio_direction: string;
  end_cta: string;
}

export interface AudioScriptDetails {
  voiceover_text: string;
  voice_profile: string;
  pacing: string;
  bgm_direction: string;
  sound_effects: string[];
}

export interface EmailDetails {
  subject_line: string;
  preview_text: string;
  greeting?: string;
  body_html_or_text: string;
  sign_off?: string;
  cta_button_text: string;
}

export interface BlogDetails {
  seo_title: string;
  meta_description: string;
  introduction: string;
  sections: Array<{ heading: string; content: string }>;
  conclusion: string;
  cta: string;
}

export interface GeneratedContent {
  title?: string;
  hook?: string;
  caption?: string;
  body?: string;
  cta?: string;
  hashtags?: string[];
  emojis?: string[];
  twitter_thread?: string[];
  email_details?: EmailDetails;
  blog_details?: BlogDetails;
  sms_message?: string;
  media_prompt?: string;
  image_prompt_details?: ImagePromptDetails;
  video_script?: VideoScriptDetails;
  audio_script?: AudioScriptDetails;
  variations?: string[];
}

export interface ContentVariation {
  id: string;
  generation_id: string;
  title?: string;
  content: any;
  is_favorite: boolean;
  created_at: string;
}

export interface Generation {
  id: string;
  campaign_id: string;
  user_id: string;
  platform: string;
  media_type: string;
  input_data: Record<string, any>;
  generated_content: GeneratedContent;
  status: "completed" | "failed" | "generating";
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost?: number;
  generation_time_ms?: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  campaign_name?: string;
  variations?: ContentVariation[];
}

export interface MultiGenerationResponse {
  total_generated: number;
  generations: Generation[];
}

export interface DashboardStats {
  total_campaigns: number;
  total_generations: number;
  total_favorites: number;
  most_used_platform: string;
  platform_breakdown: Record<string, number>;
  recent_campaigns: Array<{
    id: string;
    name: string;
    product_service: string;
    goal: string;
    tone: string;
    created_at: string;
  }>;
  recent_generations: Array<{
    id: string;
    campaign_id: string;
    platform: string;
    media_type: string;
    hook: string;
    is_favorite: boolean;
    created_at: string;
  }>;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  brand_name: string;
  description?: string;
  industry?: string;
  target_audience?: string;
  brand_voice?: string;
  preferred_tone?: string;
  products_services?: string;
  brand_values?: string;
  default_cta?: string;
  forbidden_words?: string[];
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformRule {
  id: string;
  name: string;
  icon: string;
  description: string;
  char_limit?: number;
  includes_hashtags: boolean;
  recommended_hashtags_count: number;
  includes_emojis: boolean;
  requires_visual: boolean;
  supported_media: string[];
  best_practices: string[];
}

export interface MediaTypeRule {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields_generated: string[];
}
