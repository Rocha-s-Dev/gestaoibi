import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Secretaria {
  id: string;
  municipio_id: string;
  nome: string;
  sigla: string;
  tipo: "finalistico" | "administrativo";
  codigo_orcamentario: string | null;
  nivel_hierarquico: number;
  responsavel_id: string | null;
  email_institucional: string | null;
  telefone_principal: string | null;
  endereco: string | null;
  status: string;
  icone: string | null;
  cor_tema: string | null;
  ordem_exibicao: number;
}

export interface UserSecretariaRole {
  id: string;
  user_id: string;
  secretaria_id: string | null;
  unidade_id: string | null;
  role: string;
  is_primary: boolean;
  secretaria?: Secretaria;
}

export interface Municipio {
  id: string;
  nome: string;
  uf: string;
  cnpj: string | null;
  codigo_ibge: string | null;
  prefeito: string | null;
  vice_prefeito: string | null;
  email_institucional: string | null;
  status: string;
}

interface SecretariaContextType {
  secretariaAtiva: Secretaria | null;
  secretariasDisponiveis: Secretaria[];
  userRoles: UserSecretariaRole[];
  municipio: Municipio | null;
  loading: boolean;
  isAdmin: boolean;
  setSecretariaAtiva: (secretaria: Secretaria | null) => void;
  refreshSecretarias: () => Promise<void>;
  hasAccessToSecretaria: (secretariaId: string) => boolean;
  getUserRoleInSecretaria: (secretariaId: string) => string | null;
}

const SecretariaContext = createContext<SecretariaContextType | undefined>(undefined);

const SECRETARIA_STORAGE_KEY = "secretaria_ativa_id";

export function SecretariaProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [secretariaAtiva, setSecretariaAtivaState] = useState<Secretaria | null>(null);
  const [secretariasDisponiveis, setSecretariasDisponiveis] = useState<Secretaria[]>([]);
  const [userRoles, setUserRoles] = useState<UserSecretariaRole[]>([]);
  const [municipio, setMunicipio] = useState<Municipio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMunicipio = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("municipios")
        .select("*")
        .eq("status", "ativo")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao buscar município:", error);
        return null;
      }
      return data as Municipio | null;
    } catch (error) {
      console.error("Erro ao buscar município:", error);
      return null;
    }
  }, []);

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_secretaria_roles")
        .select(`
          *,
          secretaria:secretarias(*)
        `)
        .eq("user_id", userId);

      if (error) {
        console.error("Erro ao buscar roles:", error);
        return [];
      }
      return (data || []) as UserSecretariaRole[];
    } catch (error) {
      console.error("Erro ao buscar roles:", error);
      return [];
    }
  }, []);

  const fetchSecretarias = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("secretarias")
        .select("*")
        .eq("status", "ativa")
        .order("ordem_exibicao", { ascending: true });

      if (error) {
        console.error("Erro ao buscar secretarias:", error);
        return [];
      }
      return (data || []) as Secretaria[];
    } catch (error) {
      console.error("Erro ao buscar secretarias:", error);
      return [];
    }
  }, []);

  const refreshSecretarias = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const [mun, roles, secretarias] = await Promise.all([
        fetchMunicipio(),
        fetchUserRoles(session.user.id),
        fetchSecretarias(),
      ]);

      setMunicipio(mun);
      setUserRoles(roles);

      // Check if user is admin
      const adminRole = roles.find((r) => r.role === "admin_municipal");
      setIsAdmin(!!adminRole);

      // If admin, show all secretarias; otherwise only assigned ones
      if (adminRole) {
        setSecretariasDisponiveis(secretarias);
      } else {
        const userSecretariaIds = new Set(
          roles.map((r) => r.secretaria_id).filter(Boolean)
        );
        const available = secretarias.filter((s) => userSecretariaIds.has(s.id));
        setSecretariasDisponiveis(available);
      }

      // Restore last selected secretaria from storage
      const savedSecretariaId = localStorage.getItem(SECRETARIA_STORAGE_KEY);
      const availableToSet = adminRole ? secretarias : secretarias.filter((s) => 
        roles.some((r) => r.secretaria_id === s.id)
      );

      if (savedSecretariaId) {
        const saved = availableToSet.find((s) => s.id === savedSecretariaId);
        if (saved) {
          setSecretariaAtivaState(saved);
        } else if (availableToSet.length > 0) {
          // Find primary or first available
          const primary = roles.find((r) => r.is_primary)?.secretaria;
          setSecretariaAtivaState(primary || availableToSet[0]);
        }
      } else if (availableToSet.length > 0) {
        const primary = roles.find((r) => r.is_primary)?.secretaria;
        setSecretariaAtivaState(primary || availableToSet[0]);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, fetchMunicipio, fetchUserRoles, fetchSecretarias]);

  useEffect(() => {
    if (session?.user?.id) {
      refreshSecretarias();
    } else {
      setSecretariaAtivaState(null);
      setSecretariasDisponiveis([]);
      setUserRoles([]);
      setMunicipio(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [session?.user?.id, refreshSecretarias]);

  const setSecretariaAtiva = useCallback((secretaria: Secretaria | null) => {
    setSecretariaAtivaState(secretaria);
    if (secretaria) {
      localStorage.setItem(SECRETARIA_STORAGE_KEY, secretaria.id);
    } else {
      localStorage.removeItem(SECRETARIA_STORAGE_KEY);
    }
  }, []);

  const hasAccessToSecretaria = useCallback(
    (secretariaId: string) => {
      if (isAdmin) return true;
      return userRoles.some((r) => r.secretaria_id === secretariaId);
    },
    [isAdmin, userRoles]
  );

  const getUserRoleInSecretaria = useCallback(
    (secretariaId: string) => {
      if (isAdmin) return "admin_municipal";
      const role = userRoles.find((r) => r.secretaria_id === secretariaId);
      return role?.role || null;
    },
    [isAdmin, userRoles]
  );

  return (
    <SecretariaContext.Provider
      value={{
        secretariaAtiva,
        secretariasDisponiveis,
        userRoles,
        municipio,
        loading,
        isAdmin,
        setSecretariaAtiva,
        refreshSecretarias,
        hasAccessToSecretaria,
        getUserRoleInSecretaria,
      }}
    >
      {children}
    </SecretariaContext.Provider>
  );
}

export function useSecretariaContext() {
  const context = useContext(SecretariaContext);
  if (context === undefined) {
    throw new Error("useSecretariaContext must be used within a SecretariaProvider");
  }
  return context;
}
