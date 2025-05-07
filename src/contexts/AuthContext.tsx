
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User, Provider } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signInWithSocialProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // First sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name } // Store name in user metadata
        }
      });
      
      if (error) {
        toast.error(error.message);
        return { error, data: null };
      }
      
      if (data.user) {
        console.log("User created in auth, now inserting into users table:", data.user.id);
        
        // Also insert the user data into the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            // Don't store the actual password in the users table - Supabase Auth handles this securely
            password: 'MANAGED_BY_SUPABASE_AUTH' // This is just a placeholder
          });
          
        if (insertError) {
          console.error('Error inserting user into users table:', insertError);
          toast.error(`Account created but profile setup failed: ${insertError.message}`);
          // We won't return an error here since the auth signup succeeded
        } else {
          console.log("Successfully inserted user into users table");
          toast.success("Account created successfully! Please check your email for verification.");
          navigate("/login");
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(`Registration failed: ${(error as Error).message}`);
      return { error: error as Error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Show specific error message for invalid login credentials
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message);
        }
        return { error, data: null };
      }
      
      toast.success("Logged in successfully!");
      navigate("/");
      return { data, error: null };
    } catch (error) {
      toast.error("An unexpected error occurred during login");
      return { error: error as Error, data: null };
    }
  };

  const signInWithSocialProvider = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin, // Redirect to home page after login
        },
      });
      
      if (error) {
        toast.error(`Login with ${provider} failed: ${error.message}`);
      }
    } catch (error) {
      toast.error(`An unexpected error occurred during ${provider} login`);
      console.error(`${provider} login error:`, error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out successfully!");
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        isLoading, 
        signUp, 
        signIn, 
        signInWithSocialProvider, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
