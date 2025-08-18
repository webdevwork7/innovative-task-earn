import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  // Use admin auth endpoint with development fallbacks
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Disable caching to ensure fresh auth state
    gcTime: 0, // Disable cache entirely
    networkMode: 'always',
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/auth/user", {
          credentials: "include",
        });
        
        if (!res.ok) {
          return { user: null };
        }
        
        const data = await res.json();
        return data; // Admin endpoint already returns { user: {...} } format
      } catch (error) {
        // Don't provide fallback during errors - let the hook handle it
        return { user: null };
      }
    },
  });
  
  // Force loading to false after reasonable timeout
  const effectiveIsLoading = isLoading && !isError;

  // Extract admin user from response
  let adminUser = (data as any)?.user || null;
  
  // No development fallback - admins must login properly

  return {
    adminUser,
    isLoading: effectiveIsLoading,
    isAdminAuthenticated: !!adminUser,
    refetch
  };
}