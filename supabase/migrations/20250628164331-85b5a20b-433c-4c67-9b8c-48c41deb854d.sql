
-- Criar tabela de alunos
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  data_nascimento DATE NOT NULL,
  genero VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  numero_endereco VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  numero_matricula VARCHAR(50) UNIQUE NOT NULL,
  data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
  escola_id UUID REFERENCES escolas(id) NOT NULL,
  turma_atual_id UUID REFERENCES turmas(id),
  status status_aluno DEFAULT 'matriculado',
  observacoes TEXT,
  necessidades_especiais TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de responsáveis
CREATE TABLE responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE,
  genero VARCHAR(20),
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  endereco TEXT,
  numero_endereco VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  profissao VARCHAR(100),
  local_trabalho VARCHAR(255),
  telefone_trabalho VARCHAR(20),
  grau_parentesco VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relacionamento alunos-responsáveis
CREATE TABLE alunos_responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE CASCADE NOT NULL,
  responsavel_principal BOOLEAN DEFAULT false,
  autorizado_buscar BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, responsavel_id)
);

-- Criar tabela de relacionamento professores-disciplinas
CREATE TABLE professores_disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE NOT NULL,
  disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professor_id, disciplina_id)
);

-- Criar tabela de notas
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  disciplina_id UUID REFERENCES disciplinas(id) NOT NULL,
  professor_id UUID REFERENCES professores(id) NOT NULL,
  turma_id UUID REFERENCES turmas(id) NOT NULL,
  bimestre INTEGER CHECK (bimestre BETWEEN 1 AND 4) NOT NULL,
  ano_letivo INTEGER NOT NULL,
  nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 10),
  tipo_avaliacao VARCHAR(50) DEFAULT 'prova',
  data_avaliacao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de faltas
CREATE TABLE faltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE NOT NULL,
  disciplina_id UUID REFERENCES disciplinas(id) NOT NULL,
  professor_id UUID REFERENCES professores(id) NOT NULL,
  turma_id UUID REFERENCES turmas(id) NOT NULL,
  data_falta DATE NOT NULL,
  tipo tipo_falta DEFAULT 'injustificada',
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de chamados de manutenção
CREATE TABLE chamados_manutencao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES escolas(id) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  local_problema VARCHAR(255),
  prioridade prioridade_chamado DEFAULT 'media',
  status status_chamado DEFAULT 'aberto',
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  responsavel_abertura VARCHAR(255),
  responsavel_resolucao VARCHAR(255),
  observacoes_resolucao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de calendário escolar
CREATE TABLE calendario_escolar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES escolas(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tipo_evento VARCHAR(50) NOT NULL,
  turmas_especificas UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos_responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE faltas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados_manutencao ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendario_escolar ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas para todas as tabelas
CREATE POLICY "Authenticated users can view alunos" ON alunos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alunos" ON alunos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alunos" ON alunos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete alunos" ON alunos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view responsaveis" ON responsaveis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert responsaveis" ON responsaveis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update responsaveis" ON responsaveis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete responsaveis" ON responsaveis FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view alunos_responsaveis" ON alunos_responsaveis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alunos_responsaveis" ON alunos_responsaveis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alunos_responsaveis" ON alunos_responsaveis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete alunos_responsaveis" ON alunos_responsaveis FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view professores_disciplinas" ON professores_disciplinas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert professores_disciplinas" ON professores_disciplinas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update professores_disciplinas" ON professores_disciplinas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete professores_disciplinas" ON professores_disciplinas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view notas" ON notas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert notas" ON notas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update notas" ON notas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete notas" ON notas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view faltas" ON faltas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert faltas" ON faltas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update faltas" ON faltas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete faltas" ON faltas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view chamados_manutencao" ON chamados_manutencao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert chamados_manutencao" ON chamados_manutencao FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update chamados_manutencao" ON chamados_manutencao FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete chamados_manutencao" ON chamados_manutencao FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view calendario_escolar" ON calendario_escolar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert calendario_escolar" ON calendario_escolar FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update calendario_escolar" ON calendario_escolar FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete calendario_escolar" ON calendario_escolar FOR DELETE TO authenticated USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_responsaveis_updated_at BEFORE UPDATE ON responsaveis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON notas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chamados_manutencao_updated_at BEFORE UPDATE ON chamados_manutencao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendario_escolar_updated_at BEFORE UPDATE ON calendario_escolar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de matrícula automaticamente
CREATE OR REPLACE FUNCTION gerar_numero_matricula()
RETURNS TEXT AS $$
DECLARE
    ano_atual TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    sequencial TEXT;
    numero_matricula TEXT;
BEGIN
    -- Gerar sequencial baseado no ano atual
    SELECT LPAD((COUNT(*) + 1)::TEXT, 4, '0')
    INTO sequencial
    FROM alunos
    WHERE EXTRACT(YEAR FROM data_matricula) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    numero_matricula := ano_atual || sequencial;
    
    -- Verificar se já existe
    WHILE EXISTS (SELECT 1 FROM alunos WHERE numero_matricula = numero_matricula) LOOP
        sequencial := LPAD((sequencial::INTEGER + 1)::TEXT, 4, '0');
        numero_matricula := ano_atual || sequencial;
    END LOOP;
    
    RETURN numero_matricula;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo para responsáveis
INSERT INTO responsaveis (nome, cpf, telefone, grau_parentesco) VALUES 
('Maria Santos Silva', '123.456.789-01', '(11) 98765-4321', 'Mãe'),
('João Carlos Pereira', '987.654.321-09', '(11) 99876-5432', 'Pai'),
('Ana Paula Costa', '456.789.123-45', '(11) 97654-3210', 'Mãe');
