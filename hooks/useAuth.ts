'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, UserDto } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => (await apiRequest<{ user: UserDto }>('/me')).user,
    retry: false,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await authClient.signOut();
      } finally {
        qc.clear();
      }
    },
  });
}

export function roleHome(user?: UserDto | null) {
  if (!user) return '/auth/login';
  if (!user.isApproved) return '/auth/pending';
  if (user.role === 'superadmin') return '/superadmin';
  if (user.role === 'admin') return '/admin/dashboard';
  return '/user/dashboard';
}