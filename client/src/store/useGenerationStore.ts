import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GenerationSettings {
  prompt: string;
  model: string;
  duration: number;
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  resolution: '720p' | '1080p' | '4k';
  style?: 'cinematic' | 'documentary' | 'animation' | 'abstract' | 'realistic';
  imageUrl?: string;
  audioUrl?: string;
  endFrameUrl?: string;
  characterId?: string;
  negativePrompt?: string;
}

interface GenerationStore {
  // Settings
  settings: GenerationSettings;
  updateSettings: (updates: Partial<GenerationSettings>) => void;
  resetSettings: () => void;

  // Generation state
  isGenerating: boolean;
  currentJobId: string | null;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentJobId: (jobId: string | null) => void;

  // History
  recentPrompts: string[];
  addRecentPrompt: (prompt: string) => void;

  // Favorites
  favoriteModels: string[];
  toggleFavoriteModel: (modelId: string) => void;
}

const defaultSettings: GenerationSettings = {
  prompt: '',
  model: 'auto',
  duration: 5,
  quality: 'standard',
  aspectRatio: '16:9',
  resolution: '1080p',
};

export const useGenerationStore = create<GenerationStore>()(
  devtools(
    persist(
      (set) => ({
        // Settings
        settings: defaultSettings,
        updateSettings: (updates) =>
          set((state) => ({
            settings: { ...state.settings, ...updates },
          })),
        resetSettings: () => set({ settings: defaultSettings }),

        // Generation state
        isGenerating: false,
        currentJobId: null,
        setIsGenerating: (isGenerating) => set({ isGenerating }),
        setCurrentJobId: (jobId) => set({ currentJobId: jobId }),

        // History
        recentPrompts: [],
        addRecentPrompt: (prompt) =>
          set((state) => ({
            recentPrompts: [prompt, ...state.recentPrompts.filter((p) => p !== prompt)].slice(0, 10),
          })),

        // Favorites
        favoriteModels: [],
        toggleFavoriteModel: (modelId) =>
          set((state) => ({
            favoriteModels: state.favoriteModels.includes(modelId)
              ? state.favoriteModels.filter((id) => id !== modelId)
              : [...state.favoriteModels, modelId],
          })),
      }),
      {
        name: 'generation-storage',
        partialize: (state) => ({
          settings: state.settings,
          recentPrompts: state.recentPrompts,
          favoriteModels: state.favoriteModels,
        }),
      }
    ),
    { name: 'GenerationStore' }
  )
);
