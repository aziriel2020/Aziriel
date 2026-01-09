import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoApi, VideoGenerationRequest } from '@/lib/api';
import { toast } from 'sonner';

// ============================================================================
// VIDEO GENERATION HOOKS
// ============================================================================

export function useGenerateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VideoGenerationRequest) => videoApi.generateVideo(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-jobs'] });
      toast.success('Video generation started!', {
        description: `Job ID: ${data.data.job.id}`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to generate video', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useJobStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ['job-status', jobId],
    queryFn: () => videoApi.getJobStatus(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (data) => {
      // Stop polling si le job est complété ou failed
      const status = data?.data?.job?.status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false;
      }
      // Sinon poll toutes les 3 secondes
      return 3000;
    },
  });
}

export function useUserJobs(params?: { status?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['user-jobs', params],
    queryFn: () => videoApi.getUserJobs(params),
    refetchInterval: 10000, // Refresh every 10s
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => videoApi.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete job', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => videoApi.listModels(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useEnhancePrompt() {
  return useMutation({
    mutationFn: ({ prompt, provider }: { prompt: string; provider?: string }) =>
      videoApi.enhancePrompt(prompt, provider),
    onError: (error: any) => {
      toast.error('Failed to enhance prompt', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
