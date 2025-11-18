
export interface FaceAnalysisResult {
  face_shape: string;
  hair_type: string;
  current_style: string;
  skin_undertone: string;
  confidence_score: number;
}

export interface HairstyleRecommendation {
  style_name: string;
  description: string;
  image_url?: string; // In a real app this might be pre-generated, here we might gen on fly
  confidence_score: number;
  salon_difficulty: 'easy' | 'medium' | 'hard';
  maintenance_level: 'low' | 'medium' | 'high';
}

export interface AnalysisResponse {
  face_analysis: FaceAnalysisResult;
  recommended_styles: HairstyleRecommendation[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export enum AppRoute {
  AUTH = 'auth',
  HOME = 'home',
  TRY_HAIR = 'try-hair',
  TRY_CLOTHES = 'try-clothes',
  MY_LOOKS = 'my-looks',
  CHAT = 'chat',
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  type: 'hair' | 'cloth';
  timestamp: number;
}
