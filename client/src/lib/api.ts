import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// VIDEO GENERATION API
// ============================================================================

export interface VideoGenerationRequest {
  prompt: string;
  style?: 'cinematic' | 'documentary' | 'animation' | 'abstract' | 'realistic';
  duration?: number;
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  resolution?: '720p' | '1080p' | '4k';
  model?: string;
  imageUrl?: string;
  negativePrompt?: string;
  characterId?: string;
  audioUrl?: string;
  endFrameUrl?: string;
}

export interface VideoJob {
  id: string;
  userId: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  prompt: string;
  provider: string;
  options: any;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  data: {
    job: VideoJob;
  };
  message: string;
}

export const videoApi = {
  // Générer une vidéo
  generateVideo: async (data: VideoGenerationRequest): Promise<VideoGenerationResponse> => {
    const response = await apiClient.post('/generate/video', data);
    return response.data;
  },

  // Récupérer le statut d'un job
  getJobStatus: async (jobId: string): Promise<{ success: boolean; data: { job: VideoJob } }> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Récupérer tous les jobs de l'utilisateur
  getUserJobs: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: { jobs: VideoJob[]; total: number } }> => {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  },

  // Supprimer un job
  deleteJob: async (jobId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Lister les modèles disponibles
  listModels: async (): Promise<{
    success: boolean;
    data: {
      models: {
        text: any[];
        image: any[];
        video: any[];
        audio: any[];
      };
    };
  }> => {
    const response = await apiClient.get('/generate/models');
    return response.data;
  },

  // Améliorer un prompt avec AI
  enhancePrompt: async (prompt: string, provider?: string): Promise<{
    success: boolean;
    data: { original: string; enhanced: string };
  }> => {
    const response = await apiClient.post('/generate/enhance-prompt', { prompt, provider });
    return response.data;
  },
};

// ============================================================================
// AUTH API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    localStorage.setItem('token', response.data.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  },

  me: async (): Promise<{ success: boolean; data: { user: any } }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  getProfile: async (): Promise<{ success: boolean; data: { user: any } }> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any): Promise<{ success: boolean; data: { user: any } }> => {
    const response = await apiClient.patch('/users/profile', data);
    return response.data;
  },

  getCredits: async (): Promise<{ success: boolean; data: { credits: number } }> => {
    const response = await apiClient.get('/users/credits');
    return response.data;
  },
};

export default apiClient;
