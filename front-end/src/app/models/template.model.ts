export interface EmailTemplate {
  id: number;
  user_id: number;
  nom: string;
  sujet: string;
  html_content: string;
  css_content: string;
  full_html?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  version_count: number;
  metadata?: TemplateMetadata;
  versions?: TemplateVersion[];
}

export interface TemplateMetadata {
  id: number;
  template_id: number;
  category?: string;
  tags: string[];
  usage_count: number;
  last_used?: string;
  favorite: boolean;
  shared: boolean;
  shared_with: number[];
}

export interface TemplateVersion {
  id: number;
  template_id: number;
  version_number: number;
  html_content: string;
  css_content: string;
  change_description?: string;
  created_at: string;
  created_by: number;
}

export interface TemplateCreateRequest {
  nom: string;
  sujet: string;
  html_content: string;
  css_content?: string;
  category?: string;
  tags?: string[];
}

export interface TemplateUpdateRequest {
  nom?: string;
  sujet?: string;
  html_content?: string;
  css_content?: string;
  change_description?: string;
}

export interface TemplateListResponse {
  success: boolean;
  data: {
    templates: EmailTemplate[];
    total: number;
    pages: number;
    page: number;
    per_page: number;
  };
}

export interface ValidationResult {
  is_valid: boolean;
  html_valid: boolean;
  css_valid: boolean;
  errors: Array<{ type: string; message: string }>;
  warnings: Array<{ type: string; message: string }>;
  error_count: number;
  warning_count: number;
}
