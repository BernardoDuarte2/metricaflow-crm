import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserSessionData {
  session: any;
  profile: any;
  companyId: string | undefined;
  theme: string;
  role: string | undefined;
  mustChangePassword: boolean | undefined;
}

export const useUserSession = () => {
  return useQuery({
    queryKey: ["user-session-full"],
    queryFn: async () => {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      // 2. Parallel fetch for Profile (+Company) and Role
      // We use Promise.all to run them concurrently if we can't join everything perfectly
      // But we can try to join everything from profiles if relations exist.
      // Based on previous files, profiles has company_id. 
      // user_roles has user_id.

      // Let's try to fetch Profile and expand Company
      const profilePromise = supabase
        .from("profiles")
        .select(`
          *,
          companies (
            id,
            theme,
            name
          )
        `)
        .eq("id", session.user.id)
        .single();

      // Fetch Role separately or via join if relation exists. 
      // In LeadDetail.tsx it fetches from 'user_roles' table directly matching user_id.
      // It's safer to fetch it separately if we are not sure about FK relationship direction 
      // (usually user_roles -> profiles, but sometimes profiles -> user_roles isn't defined in PostgREST).
      const rolePromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no role

      const [profileResult, roleResult] = await Promise.all([profilePromise, rolePromise]);

      const profile = profileResult.data;
      const roleData = roleResult.data;

      const theme = profile?.companies?.theme || "futurista";
      const companyId = profile?.companies?.id;
      const role = roleData?.role;

      return {
        session,
        profile,
        companyId,
        theme,
        role,
        mustChangePassword: profile?.must_change_password
      } as UserSessionData;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
};
