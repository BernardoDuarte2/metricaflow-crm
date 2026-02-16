import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import WhatsAppButton from "@/components/support/WhatsAppButton";
import { useTheme } from "@/hooks/useTheme";
import { useUserSession } from "@/hooks/useUserSession";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Apply theme on mount (now uses cached session internally)
  useTheme();

  // Load consolidated session data
  const { data: sessionData, isLoading } = useUserSession();

  // Handle redirects based on session state
  useEffect(() => {
    if (!isLoading) {
      if (!sessionData?.session) {
        navigate("/auth");
        return;
      }

      if (sessionData.mustChangePassword) {
        navigate("/change-password");
        return;
      }
    }
  }, [sessionData, isLoading, navigate]);

  // Listen for auth changes to invalidate cache and redirect
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        queryClient.removeQueries({ queryKey: ["user-session-full"] });
        navigate("/auth");
      } else if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ["user-session-full"] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If no session data yet (and not loading), return null while redirect happens
  if (!sessionData?.session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pt-16">
        <main className="min-h-[calc(100vh-4rem)] overflow-y-auto p-6">{children}</main>
      </div>
      <OnboardingTour />
      <WhatsAppButton />
    </div>
  );
};

export default ProtectedRoute;
