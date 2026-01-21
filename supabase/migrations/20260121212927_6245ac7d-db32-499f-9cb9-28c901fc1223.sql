-- =============================================
-- TABELAS BASE DO MÓDULO EDUCAÇÃO
-- =============================================

-- 1. ESCOLAS
CREATE TABLE public.escolas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  diretor TEXT,
  tipo TEXT DEFAULT 'municipal',
  capacidade INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view escolas" ON public.escolas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert escolas" ON public.escolas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update escolas" ON public.escolas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete escolas" ON public.escolas FOR DELETE TO authenticated USING (true);

-- 2. TURMAS
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE NOT NULL,
  ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  serie TEXT,
  turno TEXT,
  sala TEXT,
  capacidade INTEGER,
  professor_responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert turmas" ON public.turmas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update turmas" ON public.turmas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete turmas" ON public.turmas FOR DELETE TO authenticated USING (true);

-- 3. ALUNOS
CREATE TABLE public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  numero_matricula TEXT UNIQUE NOT NULL,
  data_nascimento DATE,
  cpf TEXT,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  responsavel_nome TEXT,
  responsavel_telefone TEXT,
  responsavel_email TEXT,
  endereco TEXT,
  situacao TEXT DEFAULT 'ativo',
  data_matricula DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view alunos" ON public.alunos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert alunos" ON public.alunos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update alunos" ON public.alunos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete alunos" ON public.alunos FOR DELETE TO authenticated USING (true);

-- 4. PROFESSORES
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  especialidade TEXT,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view professores" ON public.professores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert professores" ON public.professores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update professores" ON public.professores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete professores" ON public.professores FOR DELETE TO authenticated USING (true);

-- 5. DISCIPLINAS
CREATE TABLE public.disciplinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT,
  carga_horaria INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view disciplinas" ON public.disciplinas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert disciplinas" ON public.disciplinas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update disciplinas" ON public.disciplinas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete disciplinas" ON public.disciplinas FOR DELETE TO authenticated USING (true);

-- 6. NOTAS
CREATE TABLE public.notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE CASCADE NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  bimestre INTEGER NOT NULL CHECK (bimestre BETWEEN 1 AND 4),
  nota DECIMAL(4,2),
  ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  fechada BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, disciplina_id, bimestre, ano_letivo)
);

ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view notas" ON public.notas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert notas" ON public.notas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update notas" ON public.notas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete notas" ON public.notas FOR DELETE TO authenticated USING (true);

-- 7. FALTAS
CREATE TABLE public.faltas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  justificada BOOLEAN DEFAULT FALSE,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faltas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view faltas" ON public.faltas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert faltas" ON public.faltas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update faltas" ON public.faltas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete faltas" ON public.faltas FOR DELETE TO authenticated USING (true);

-- 8. SOLICITACOES_MATRICULA
CREATE TABLE public.solicitacoes_matricula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT UNIQUE NOT NULL,
  nome_aluno TEXT NOT NULL,
  data_nascimento DATE,
  cpf_aluno TEXT,
  nome_responsavel TEXT NOT NULL,
  cpf_responsavel TEXT,
  email_responsavel TEXT,
  telefone_responsavel TEXT,
  endereco TEXT,
  escola_desejada_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  serie_desejada TEXT,
  turno_desejado TEXT,
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  motivo_recusa TEXT,
  documentos JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_matricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view own solicitacao" ON public.solicitacoes_matricula FOR SELECT USING (true);
CREATE POLICY "Anyone can insert solicitacao" ON public.solicitacoes_matricula FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update solicitacao" ON public.solicitacoes_matricula FOR UPDATE TO authenticated USING (true);

-- 9. TRANSFERENCIAS
CREATE TABLE public.transferencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  escola_origem_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  escola_destino_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  turma_destino_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
  motivo TEXT,
  status TEXT DEFAULT 'pendente',
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_efetivacao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view transferencias" ON public.transferencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert transferencias" ON public.transferencias FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update transferencias" ON public.transferencias FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete transferencias" ON public.transferencias FOR DELETE TO authenticated USING (true);

-- 10. CARDÁPIOS
CREATE TABLE public.cardapios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  refeicao TEXT NOT NULL,
  itens JSONB NOT NULL DEFAULT '[]'::JSONB,
  calorias_estimadas INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cardapios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view cardapios" ON public.cardapios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert cardapios" ON public.cardapios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update cardapios" ON public.cardapios FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete cardapios" ON public.cardapios FOR DELETE TO authenticated USING (true);

-- 11. ESTOQUE ALIMENTOS
CREATE TABLE public.estoque_alimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL,
  data_validade DATE,
  fornecedor TEXT,
  lote TEXT,
  preco_unitario DECIMAL(10,2),
  estoque_minimo DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque_alimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view estoque" ON public.estoque_alimentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert estoque" ON public.estoque_alimentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update estoque" ON public.estoque_alimentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete estoque" ON public.estoque_alimentos FOR DELETE TO authenticated USING (true);

-- 12. RESTRIÇÕES ALIMENTARES
CREATE TABLE public.restricoes_alimentares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  tipo_restricao TEXT NOT NULL,
  descricao TEXT,
  alimentos_proibidos TEXT[],
  orientacoes_medicas TEXT,
  documento_medico_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.restricoes_alimentares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view restricoes" ON public.restricoes_alimentares FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert restricoes" ON public.restricoes_alimentares FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update restricoes" ON public.restricoes_alimentares FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete restricoes" ON public.restricoes_alimentares FOR DELETE TO authenticated USING (true);

-- 13. VEÍCULOS TRANSPORTE
CREATE TABLE public.veiculos_transporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  placa TEXT UNIQUE NOT NULL,
  modelo TEXT,
  capacidade INTEGER,
  ano INTEGER,
  motorista TEXT,
  telefone_motorista TEXT,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.veiculos_transporte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view veiculos" ON public.veiculos_transporte FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert veiculos" ON public.veiculos_transporte FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update veiculos" ON public.veiculos_transporte FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete veiculos" ON public.veiculos_transporte FOR DELETE TO authenticated USING (true);

-- 14. ROTAS TRANSPORTE
CREATE TABLE public.rotas_transporte (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos_transporte(id) ON DELETE SET NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  horario_saida TIME,
  horario_chegada TIME,
  pontos_parada JSONB DEFAULT '[]'::JSONB,
  distancia_km DECIMAL(10,2),
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rotas_transporte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view rotas" ON public.rotas_transporte FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert rotas" ON public.rotas_transporte FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update rotas" ON public.rotas_transporte FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete rotas" ON public.rotas_transporte FOR DELETE TO authenticated USING (true);

-- 15. ALUNOS ROTAS (vínculo)
CREATE TABLE public.alunos_rotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  rota_id UUID REFERENCES public.rotas_transporte(id) ON DELETE CASCADE NOT NULL,
  ponto_embarque TEXT,
  horario_embarque TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, rota_id)
);

ALTER TABLE public.alunos_rotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view alunos_rotas" ON public.alunos_rotas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert alunos_rotas" ON public.alunos_rotas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update alunos_rotas" ON public.alunos_rotas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete alunos_rotas" ON public.alunos_rotas FOR DELETE TO authenticated USING (true);

-- 16. RESPONSÁVEIS ALUNOS (vínculo para portal)
CREATE TABLE public.responsaveis_alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  responsavel_id UUID NOT NULL,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  parentesco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (responsavel_id, aluno_id)
);

ALTER TABLE public.responsaveis_alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view responsaveis_alunos" ON public.responsaveis_alunos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert responsaveis_alunos" ON public.responsaveis_alunos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update responsaveis_alunos" ON public.responsaveis_alunos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete responsaveis_alunos" ON public.responsaveis_alunos FOR DELETE TO authenticated USING (true);

-- 17. NOTIFICAÇÕES
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 18. CALENDARIO ESCOLAR
CREATE TABLE public.calendario_escolar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tipo TEXT,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
  ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calendario_escolar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view calendario" ON public.calendario_escolar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert calendario" ON public.calendario_escolar FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update calendario" ON public.calendario_escolar FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete calendario" ON public.calendario_escolar FOR DELETE TO authenticated USING (true);

-- 19. ALERTAS EDUCACIONAIS
CREATE TABLE public.alertas_educacionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  nivel TEXT DEFAULT 'warning',
  resolvido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alertas_educacionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view alertas" ON public.alertas_educacionais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert alertas" ON public.alertas_educacionais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update alertas" ON public.alertas_educacionais FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete alertas" ON public.alertas_educacionais FOR DELETE TO authenticated USING (true);

-- 20. METAS EDUCACIONAIS
CREATE TABLE public.metas_educacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  meta_valor DECIMAL(10,2),
  valor_atual DECIMAL(10,2) DEFAULT 0,
  unidade TEXT,
  prazo DATE,
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.metas_educacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view metas" ON public.metas_educacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert metas" ON public.metas_educacao FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update metas" ON public.metas_educacao FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete metas" ON public.metas_educacao FOR DELETE TO authenticated USING (true);

-- FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_escolas_updated_at BEFORE UPDATE ON public.escolas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON public.notas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_solicitacoes_matricula_updated_at BEFORE UPDATE ON public.solicitacoes_matricula FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transferencias_updated_at BEFORE UPDATE ON public.transferencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cardapios_updated_at BEFORE UPDATE ON public.cardapios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_estoque_alimentos_updated_at BEFORE UPDATE ON public.estoque_alimentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restricoes_alimentares_updated_at BEFORE UPDATE ON public.restricoes_alimentares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_veiculos_transporte_updated_at BEFORE UPDATE ON public.veiculos_transporte FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rotas_transporte_updated_at BEFORE UPDATE ON public.rotas_transporte FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metas_educacao_updated_at BEFORE UPDATE ON public.metas_educacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();