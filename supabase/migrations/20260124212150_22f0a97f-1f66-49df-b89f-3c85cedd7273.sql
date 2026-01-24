-- =====================================================
-- TABELAS FALTANTES - Goals, Tasks e ajustes em Profiles
-- =====================================================

-- Enums para goals e tasks
CREATE TYPE goal_term AS ENUM ('short', 'medium', 'long');
CREATE TYPE goal_status AS ENUM ('pending', 'in_progress', 'delayed', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- =====================================================
-- Tabela de Metas Gerais (goals)
-- =====================================================

CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  term goal_term NOT NULL DEFAULT 'short',
  status goal_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Associação goals-departments (M:N)
CREATE TABLE public.goal_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT goal_department_unique UNIQUE (goal_id, department_id)
);

-- =====================================================
-- Tabela de Tarefas (tasks)
-- =====================================================

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atribuição de tarefas a usuários
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT task_user_unique UNIQUE (task_id, user_id)
);

-- =====================================================
-- Triggers de updated_at
-- =====================================================

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Índices
-- =====================================================

CREATE INDEX idx_goals_secretaria ON public.goals(secretaria_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goal_departments_goal ON public.goal_departments(goal_id);
CREATE INDEX idx_goal_departments_department ON public.goal_departments(department_id);
CREATE INDEX idx_tasks_goal ON public.tasks(goal_id);
CREATE INDEX idx_tasks_secretaria ON public.tasks(secretaria_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_user ON public.task_assignments(user_id);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Admin full access goals" ON public.goals
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage goals" ON public.goals
  FOR ALL USING (
    secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    OR created_by = auth.uid()
  )
  WITH CHECK (
    secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated view goals" ON public.goals
  FOR SELECT USING (auth.role() = 'authenticated');

-- Goal departments policies
CREATE POLICY "Admin full access goal_depts" ON public.goal_departments
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage goal_depts" ON public.goal_departments
  FOR ALL USING (
    goal_id IN (
      SELECT id FROM public.goals 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  )
  WITH CHECK (
    goal_id IN (
      SELECT id FROM public.goals 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  );

-- Tasks policies  
CREATE POLICY "Admin full access tasks" ON public.tasks
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage tasks" ON public.tasks
  FOR ALL USING (
    secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    OR created_by = auth.uid()
    OR id IN (SELECT task_id FROM public.task_assignments WHERE user_id = auth.uid())
  )
  WITH CHECK (
    secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated view tasks" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Task assignments policies
CREATE POLICY "Admin full access task_assign" ON public.task_assignments
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage task_assign" ON public.task_assignments
  FOR ALL USING (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  );

CREATE POLICY "User view own assignments" ON public.task_assignments
  FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- Ajustar tabela financial_goals para ter user_id
-- =====================================================

ALTER TABLE public.financial_goals 
ADD COLUMN IF NOT EXISTS secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL;