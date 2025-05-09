
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check for authentication hash parameters after OAuth redirect
    const handleAuthRedirect = async () => {
      // Handle hash in URL (potential OAuth callback)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log("Detected auth redirect hash, setting session...");
        await supabase.auth.getSession();
      }
    };

    handleAuthRedirect();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
