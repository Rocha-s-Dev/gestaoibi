
-- =============================================
-- TFD - Tratamento Fora do Domicílio
-- Sistema de transporte de pacientes para outras cidades
-- =============================================

-- Viagens TFD (solicitação criada pela Saúde)
CREATE TABLE public.viagens_tfd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT NOT NULL UNIQUE,
  data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_viagem DATE NOT NULL,
  horario_saida TIME,
  horario_retorno_previsto TIME,
  status TEXT NOT NULL DEFAULT 'solicitada' CHECK (status IN ('solicitada','aprovada_saude','veiculos_designados','em_andamento','concluida','cancelada')),
  motivo_cancelamento TEXT,
  observacoes TEXT,
  custo_estimado NUMERIC(12,2) DEFAULT 0,
  custo_real NUMERIC(12,2),
  diarias_valor NUMERIC(12,2) DEFAULT 0,
  relatorio_retorno TEXT,
  data_retorno_real TIMESTAMP WITH TIME ZONE,
  solicitante_id UUID REFERENCES auth.users(id),
  aprovado_por UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  secretaria_saude_id UUID REFERENCES public.secretarias(id),
  secretaria_transporte_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Destinos da viagem (múltiplos destinos por viagem)
CREATE TABLE public.destinos_tfd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens_tfd(id) ON DELETE CASCADE,
  cidade_destino TEXT NOT NULL,
  uf_destino TEXT NOT NULL DEFAULT 'SP',
  hospital_unidade TEXT,
  endereco TEXT,
  tipo_atendimento TEXT CHECK (tipo_atendimento IN ('consulta','exame','cirurgia','tratamento','retorno','outro')),
  horario_previsto TIME,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pacientes vinculados à viagem
CREATE TABLE public.pacientes_tfd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens_tfd(id) ON DELETE CASCADE,
  destino_id UUID REFERENCES public.destinos_tfd(id),
  paciente_id UUID REFERENCES public.pacientes(id),
  nome_paciente TEXT NOT NULL,
  cpf_paciente TEXT,
  cartao_sus TEXT,
  tipo_atendimento TEXT,
  especialidade TEXT,
  acompanhante_nome TEXT,
  acompanhante_cpf TEXT,
  acompanhante_parentesco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Veículos designados pela Secretaria de Transporte
CREATE TABLE public.veiculos_tfd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES public.viagens_tfd(id) ON DELETE CASCADE,
  veiculo_id UUID REFERENCES public.veiculos_frota(id),
  motorista_id UUID REFERENCES public.motoristas(id),
  capacidade_pacientes INTEGER NOT NULL DEFAULT 4,
  km_saida NUMERIC(10,1),
  km_retorno NUMERIC(10,1),
  observacoes TEXT,
  designado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pacientes por veículo (distribuição)
CREATE TABLE public.pacientes_veiculo_tfd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_tfd_id UUID NOT NULL REFERENCES public.veiculos_tfd(id) ON DELETE CASCADE,
  paciente_tfd_id UUID NOT NULL REFERENCES public.pacientes_tfd(id) ON DELETE CASCADE,
  inclui_acompanhante BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(veiculo_tfd_id, paciente_tfd_id)
);

-- Enable RLS
ALTER TABLE public.viagens_tfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinos_tfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_tfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos_tfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_veiculo_tfd ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "viagens_tfd_select" ON public.viagens_tfd FOR SELECT TO authenticated
  USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), secretaria_transporte_id));

CREATE POLICY "viagens_tfd_insert" ON public.viagens_tfd FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_saude_id));

CREATE POLICY "viagens_tfd_update" ON public.viagens_tfd FOR UPDATE TO authenticated
  USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), secretaria_transporte_id));

CREATE POLICY "destinos_tfd_all" ON public.destinos_tfd FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.viagens_tfd v WHERE v.id = viagem_id AND (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), v.secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), v.secretaria_transporte_id))));

CREATE POLICY "pacientes_tfd_all" ON public.pacientes_tfd FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.viagens_tfd v WHERE v.id = viagem_id AND (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), v.secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), v.secretaria_transporte_id))));

CREATE POLICY "veiculos_tfd_all" ON public.veiculos_tfd FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.viagens_tfd v WHERE v.id = viagem_id AND (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), v.secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), v.secretaria_transporte_id))));

CREATE POLICY "pacientes_veiculo_tfd_all" ON public.pacientes_veiculo_tfd FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.veiculos_tfd vt JOIN public.viagens_tfd v ON v.id = vt.viagem_id WHERE vt.id = veiculo_tfd_id AND (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), v.secretaria_saude_id) OR public.has_secretaria_access(auth.uid(), v.secretaria_transporte_id))));

-- Protocolo generator
CREATE OR REPLACE FUNCTION public.gerar_protocolo_tfd()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.viagens_tfd;
  RETURN CONCAT('TFD-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END; $$;

-- Audit triggers
CREATE TRIGGER audit_viagens_tfd AFTER INSERT OR UPDATE OR DELETE ON public.viagens_tfd
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

-- Updated_at trigger
CREATE TRIGGER update_viagens_tfd_updated_at BEFORE UPDATE ON public.viagens_tfd
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
