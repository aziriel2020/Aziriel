import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi, LoginRequest, RegisterRequest } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ============================================================================
// AUTH HOOKS
// ============================================================================

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Welcome back!', {
        description: `Logged in as ${data.data.user.email}`,
      });
      router.push('/studio');
    },
    onError: (error: any) => {
      toast.error('Login failed', {
        description: error.response?.data?.message || 'Invalid credentials',
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Welcome to NeuraField!', {
        description: `Account created for ${data.data.user.email}`,
      });
      router.push('/studio');
    },
    onError: (error: any) => {
      toast.error('Registration failed', {
        description: error.response?.data?.message || 'Could not create account',
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(authApi.logout()),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/');
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// ============================================================================
// USER PROFILE HOOKS
// ============================================================================

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: () => userApi.getCredits(),
    refetchInterval: 30000, // Refresh every 30s
  });
}
