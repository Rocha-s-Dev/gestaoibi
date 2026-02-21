import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


export type CargoSaude =
  | "diretor_unidade"
  | "coordenador_atencao_basica"
  | "medico"
  | "enfermeiro"
  | "tecnico_enfermagem"
  | "agente_comunitario_saude"
  | "farmaceutico"
  | "psicologo"
  | "dentista"
  | "recepcionista"
  | "regulador_tfd"
  | "auxiliar_administrativo";

export const CARGOS_SAUDE_LABELS: Record<CargoSaude, string> = {
  diretor_unidade: "Diretor de Unidade",
  coordenador_atencao_basica: "Coordenador de Atenção Básica",
  medico: "Médico(a)",
  enfermeiro: "Enfermeiro(a)",
  tecnico_enfermagem: "Técnico(a) de Enfermagem",
  agente_comunitario_saude: "Agente Comunitário de Saúde",
  farmaceutico: "Farmacêutico(a)",
  psicologo: "Psicólogo(a)",
  dentista: "Dentista",
  recepcionista: "Recepcionista",
  regulador_tfd: "Regulador TFD",
  auxiliar_administrativo: "Auxiliar Administrativo",
};

export const CARGOS_CLINICOS: CargoSaude[] = [
  "medico",
  "enfermeiro",
  "dentista",
  "psicologo",
];

export const CARGOS_COM_ACESSO_PRONTUARIO: CargoSaude[] = [
  "medico",
  "enfermeiro",
  "dentista",
  "psicologo",
  "diretor_unidade",
  "coordenador_atencao_basica",
];

export const CARGOS_COM_ACESSO_SINAIS_VITAIS: CargoSaude[] = [
  "medico",
  "enfermeiro",
  "tecnico_enfermagem",
  "dentista",
  "psicologo",
];

interface CargoSaudeInfo {
  id: string;
  cargo: CargoSaude;
  unidade_id: string | null;
  status: string | null;
}

export function useCargoSaude() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: meusCargos = [], isLoading } = useQuery({
    queryKey: ["meus_cargos_saude", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("profissionais_saude")
        .select("id, cargo, unidade_id, status")
        .eq("user_id", userId)
        .eq("status", "ativo");
      if (error) throw error;
      return (data || []) as CargoSaudeInfo[];
    },
    enabled: !!userId,
  });

  const cargoPrincipal = meusCargos.length > 0 ? meusCargos[0].cargo : null;
  const unidadeVinculada = meusCargos.length > 0 ? meusCargos[0].unidade_id : null;

  const hasCargo = (cargo: CargoSaude) =>
    meusCargos.some((c) => c.cargo === cargo);

  const hasAnyCargo = (cargos: CargoSaude[]) =>
    meusCargos.some((c) => cargos.includes(c.cargo));

  const podeAcessarDadosClinicos = hasAnyCargo(CARGOS_CLINICOS);

  const podeAcessarProntuario = hasAnyCargo(CARGOS_COM_ACESSO_PRONTUARIO);

  const podeRegistrarSinaisVitais = hasAnyCargo(CARGOS_COM_ACESSO_SINAIS_VITAIS);

  const podeAcessarUnidade = (unidadeId: string) =>
    meusCargos.some((c) => c.unidade_id === unidadeId);

  const podeGerenciarTFD =
    hasCargo("regulador_tfd") ||
    hasCargo("diretor_unidade") ||
    hasCargo("coordenador_atencao_basica");

  const podeAgendar =
    hasCargo("recepcionista") ||
    hasCargo("diretor_unidade") ||
    hasCargo("coordenador_atencao_basica");

  const podeCadastrarPaciente =
    hasCargo("recepcionista") ||
    hasCargo("agente_comunitario_saude") ||
    hasCargo("diretor_unidade") ||
    hasCargo("coordenador_atencao_basica");

  return {
    meusCargos,
    cargoPrincipal,
    unidadeVinculada,
    isLoading,
    hasCargo,
    hasAnyCargo,
    podeAcessarDadosClinicos,
    podeAcessarProntuario,
    podeRegistrarSinaisVitais,
    podeAcessarUnidade,
    podeGerenciarTFD,
    podeAgendar,
    podeCadastrarPaciente,
  };
}
