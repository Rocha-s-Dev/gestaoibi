
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: "admin" | "gestor" | "colaborador" | "financeiro";
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error } | undefined>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      // For demo purposes, set a mock user until real user data is fetched
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: "admin", // Default role for testing
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
        });
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Update user when auth state changes
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: "admin", // Default role for testing
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
        });
      } else {
        setUser(null);
      }
      
      if (session && window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email); // Debug log
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase auth error:", error);
        return { error };
      }
      
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      return { data };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email.");
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
      console.error("Error signing up:", error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout.");
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
