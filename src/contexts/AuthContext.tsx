
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ForcePasswordChange } from "@/components/auth/ForcePasswordChange";
import { AccessDeniedScreen } from "@/components/auth/AccessDeniedScreen";

interface UserProfile {
  status_cadastral: string | null;
  tipo_usuario: string | null;
  requer_troca_senha: boolean | null;
  primeiro_acesso: boolean | null;
  criado_pelo_rh: boolean | null;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error?: Error } | undefined>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("status_cadastral, tipo_usuario, requer_troca_senha, primeiro_acesso, criado_pelo_rh")
        .eq("user_id", userId)
        .single();
      setUserProfile(data);
    } catch {
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setUserProfile(null);
      }
      if (session && window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error };
      }
      
      // Update last login
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ data_ultimo_login: new Date().toISOString() })
          .eq("user_id", data.user.id);
      }

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      return { data };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    // Registration disabled - only RH can create users
    toast.error("O cadastro de novos usuários é realizado exclusivamente pelo Departamento de RH.");
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout.");
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, userProfile, signIn, signUp, signOut, refreshProfile }}>
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
  const { session, loading, userProfile, refreshProfile } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs to change password (first login)
  if (userProfile?.requer_troca_senha) {
    return (
      <ForcePasswordChange 
        userId={session.user.id} 
        onComplete={() => refreshProfile()}
      />
    );
  }

  // Check user status
  if (userProfile) {
    const status = userProfile.status_cadastral;
    
    if (status === 'bloqueado') {
      return <AccessDeniedScreen reason="blocked" />;
    }
    
    if (status === 'inativo') {
      return <AccessDeniedScreen reason="inactive" />;
    }

    // Admin always has access
    if (userProfile.tipo_usuario === 'administrador') {
      return <>{children}</>;
    }

    if (status === 'pendente_regularizacao') {
      return <AccessDeniedScreen reason="pending" />;
    }
  }

  return <>{children}</>;
}
