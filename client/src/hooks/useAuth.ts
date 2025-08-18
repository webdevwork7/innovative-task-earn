import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  
  // Use traditional auth for our demo login system with retry disabled to prevent infinite loops
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
    refetchOnWindowFocus: true, // Enable refetch on focus to pick up login changes
    refetchOnReconnect: true,
    staleTime: 0, // Disable caching to ensure fresh auth state
    gcTime: 0, // Disable cache entirely (TanStack Query v5 uses gcTime instead of cacheTime)
    networkMode: 'always', // Always try to fetch, even if offline
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include",
        });
        
        if (!res.ok) {
          return { user: null };
        }
        
        const data = await res.json();
        return data;
      } catch (error) {
        // Don't provide fallback during errors - let the hook handle it
        return { user: null };
      }
    },
  });
  
  // Force loading to false after reasonable timeout to prevent infinite loading
  const effectiveIsLoading = isLoading && !isError;

  // Extract user from the response data OR provide demo user fallback
  let user = (data as any)?.user || null;
  
  // No development fallback - users must login properly

  // Removed persistent hourly bonus notification to prevent spam
  // The bonus is still awarded automatically, but won't show repeated notifications

  return {
    user,
    isLoading: effectiveIsLoading,
    isAuthenticated: !!user,
  };
}
