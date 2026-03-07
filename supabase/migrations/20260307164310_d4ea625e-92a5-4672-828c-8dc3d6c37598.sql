
-- 1. Add new columns to professores
ALTER TABLE public.professores 
  ADD COLUMN IF NOT EXISTS tipo_professor text DEFAULT 'professor_regente',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS data_inicio date DEFAULT CURRENT_DATE;

-- 2. Create professor_turma junction table
CREATE TABLE public.professor_turma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  disciplina_id uuid REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  turno text,
  ano_letivo integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.professor_turma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view professor_turma"
  ON public.professor_turma FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert professor_turma"
  ON public.professor_turma FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update professor_turma"
  ON public.professor_turma FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete professor_turma"
  ON public.professor_turma FOR DELETE TO authenticated USING (true);

-- 3. Create auxiliares_classe table
CREATE TABLE public.auxiliares_classe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo_profissional text DEFAULT 'auxiliar_turma',
  escola_id uuid REFERENCES public.escolas(id) ON DELETE SET NULL,
  status text DEFAULT 'ativo',
  data_inicio date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.auxiliares_classe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view auxiliares_classe"
  ON public.auxiliares_classe FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert auxiliares_classe"
  ON public.auxiliares_classe FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update auxiliares_classe"
  ON public.auxiliares_classe FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete auxiliares_classe"
  ON public.auxiliares_classe FOR DELETE TO authenticated USING (true);

-- 4. Create auxiliar_turma junction table
CREATE TABLE public.auxiliar_turma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auxiliar_id uuid REFERENCES public.auxiliares_classe(id) ON DELETE CASCADE NOT NULL,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  tipo_auxiliar text NOT NULL,
  aluno_id uuid REFERENCES public.alunos(id) ON DELETE SET NULL,
  turno text,
  ano_letivo integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.auxiliar_turma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view auxiliar_turma"
  ON public.auxiliar_turma FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert auxiliar_turma"
  ON public.auxiliar_turma FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update auxiliar_turma"
  ON public.auxiliar_turma FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete auxiliar_turma"
  ON public.auxiliar_turma FOR DELETE TO authenticated USING (true);
