import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoordenacaoPedagogica } from "@/hooks/useCoordenacaoPedagogica";
import { useAuth } from "@/contexts/AuthContext";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { DashboardPedagogico } from "@/components/coordenacao/DashboardPedagogico";
import { SupervisaoProfessores } from "@/components/coordenacao/SupervisaoProfessores";
import { AlunosEmRisco } from "@/components/coordenacao/AlunosEmRisco";
import { IntervencoesPedagogicas } from "@/components/coordenacao/IntervencoesPedagogicas";
import { RelatoriosPedagogicos } from "@/components/coordenacao/RelatoriosPedagogicos";
import { AgendaPedagogica } from "@/components/coordenacao/AgendaPedagogica";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CoordenacaoPedagogica() {
  const { session } = useAuth();
  const { isAdmin, isPrefeito } = useSecretariaContext();

  // Determine user's school access
  const { data: userEducationRoles = [] } = useQuery({
    queryKey: ["user-education-roles", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_education_roles")
        .select("*")
        .eq("user_id", session!.user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Check if user is secretario of education
  const isSecretario = useMemo(() => {
    return userEducationRoles.some((r: any) => r.role === "secretaria");
  }, [userEducationRoles]);

  // Coordenador only sees their school
  const isCoordenador = useMemo(() => {
    return userEducationRoles.some((r: any) => r.role === "coordenador");
  }, [userEducationRoles]);

  const isDiretor = useMemo(() => {
    return userEducationRoles.some((r: any) => r.role === "diretor" || r.role === "vice_diretor");
  }, [userEducationRoles]);

  const hasGlobalAccess = isAdmin || isPrefeito || isSecretario;

  const userSchoolId = useMemo(() => {
    if (hasGlobalAccess) return null;
    const role = userEducationRoles.find((r: any) => r.escola_id);
    return role?.escola_id || null;
  }, [hasGlobalAccess, userEducationRoles]);

  const [selectedEscola, setSelectedEscola] = useState<string | null>(null);
  const effectiveEscolaId = hasGlobalAccess ? (selectedEscola === "all" ? null : selectedEscola) : userSchoolId;

  const {
    alunos, notas, faltas, turmas, disciplinas, professores, escolas,
    intervencoes, eventos,
    createIntervencao, updateIntervencao,
    createEvento, updateEvento, deleteEvento,
  } = useCoordenacaoPedagogica(effectiveEscolaId);

  const [activeTab, setActiveTab] = useState("dashboard");

  // For "Registrar Intervenção" from AlunosEmRisco
  const handleRegistrarIntervencao = (aluno: any) => {
    setActiveTab("intervencoes");
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Coordenação Pedagógica</h1>
            <p className="text-muted-foreground mt-1">Acompanhamento pedagógico, supervisão e intervenções</p>
          </div>
          {hasGlobalAccess && (
            <Select value={selectedEscola || "all"} onValueChange={setSelectedEscola}>
              <SelectTrigger className="w-[250px]"><SelectValue placeholder="Selecionar escola" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {escolas.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="supervisao" className="text-xs md:text-sm">Supervisão</TabsTrigger>
            <TabsTrigger value="risco" className="text-xs md:text-sm">Alunos em Risco</TabsTrigger>
            <TabsTrigger value="intervencoes" className="text-xs md:text-sm">Intervenções</TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs md:text-sm">Relatórios</TabsTrigger>
            <TabsTrigger value="agenda" className="text-xs md:text-sm">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardPedagogico
              alunos={alunos} notas={notas} faltas={faltas}
              turmas={turmas} disciplinas={disciplinas} escolas={escolas}
              escolaId={effectiveEscolaId}
            />
          </TabsContent>

          <TabsContent value="supervisao" className="mt-6">
            <SupervisaoProfessores
              professores={professores} turmas={turmas}
              disciplinas={disciplinas} notas={notas} faltas={faltas}
            />
          </TabsContent>

          <TabsContent value="risco" className="mt-6">
            <AlunosEmRisco
              alunos={alunos} notas={notas} faltas={faltas} turmas={turmas}
              onRegistrarIntervencao={handleRegistrarIntervencao}
            />
          </TabsContent>

          <TabsContent value="intervencoes" className="mt-6">
            <IntervencoesPedagogicas
              intervencoes={intervencoes} alunos={alunos}
              escolaId={effectiveEscolaId}
              createIntervencao={createIntervencao}
              updateIntervencao={updateIntervencao}
            />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatoriosPedagogicos
              alunos={alunos} notas={notas} faltas={faltas}
              turmas={turmas} disciplinas={disciplinas} escolas={escolas}
              escolaId={effectiveEscolaId}
            />
          </TabsContent>

          <TabsContent value="agenda" className="mt-6">
            <AgendaPedagogica
              eventos={eventos} escolaId={effectiveEscolaId}
              createEvento={createEvento} updateEvento={updateEvento}
              deleteEvento={deleteEvento}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
