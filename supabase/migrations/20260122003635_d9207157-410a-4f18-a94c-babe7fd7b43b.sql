
-- Drop existing permissive policies and create role-based RLS for education module

-- =============================================
-- ESCOLAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated can insert escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated can update escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated can delete escolas" ON public.escolas;

-- Secretaria: full access; Diretor: view/update own school; Professor/Responsavel: view only
CREATE POLICY "Secretaria full access escolas" ON public.escolas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor view own school" ON public.escolas FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Diretor update own school" ON public.escolas FOR UPDATE TO authenticated
  USING (public.has_education_role_in_school(auth.uid(), 'diretor', id));

CREATE POLICY "Professor view assigned school" ON public.escolas FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Responsavel view school" ON public.escolas FOR SELECT TO authenticated
  USING (public.has_education_role(auth.uid(), 'responsavel'));

-- =============================================
-- TURMAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated can insert turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated can update turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated can delete turmas" ON public.turmas;

CREATE POLICY "Secretaria full access turmas" ON public.turmas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school turmas" ON public.turmas FOR ALL TO authenticated
  USING (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id))
  WITH CHECK (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id));

CREATE POLICY "Professor view assigned turmas" ON public.turmas FOR SELECT TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Responsavel view child turmas" ON public.turmas FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT a.turma_id FROM public.alunos a
      JOIN public.responsaveis_alunos ra ON ra.aluno_id = a.id
      WHERE ra.responsavel_id = auth.uid()
    )
  );

-- =============================================
-- ALUNOS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated can update alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated can delete alunos" ON public.alunos;

CREATE POLICY "Secretaria full access alunos" ON public.alunos FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school alunos" ON public.alunos FOR ALL TO authenticated
  USING (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id))
  WITH CHECK (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id));

CREATE POLICY "Professor view school alunos" ON public.alunos FOR SELECT TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Responsavel view own children" ON public.alunos FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), id));

-- =============================================
-- PROFESSORES TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view professores" ON public.professores;
DROP POLICY IF EXISTS "Authenticated can insert professores" ON public.professores;
DROP POLICY IF EXISTS "Authenticated can update professores" ON public.professores;
DROP POLICY IF EXISTS "Authenticated can delete professores" ON public.professores;

CREATE POLICY "Secretaria full access professores" ON public.professores FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school professores" ON public.professores FOR ALL TO authenticated
  USING (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id))
  WITH CHECK (public.has_education_role_in_school(auth.uid(), 'diretor', escola_id));

CREATE POLICY "Professor view own profile" ON public.professores FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR escola_id IN (SELECT public.get_user_school_ids(auth.uid())));

-- =============================================
-- NOTAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view notas" ON public.notas;
DROP POLICY IF EXISTS "Authenticated can insert notas" ON public.notas;
DROP POLICY IF EXISTS "Authenticated can update notas" ON public.notas;
DROP POLICY IF EXISTS "Authenticated can delete notas" ON public.notas;

CREATE POLICY "Secretaria full access notas" ON public.notas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school notas" ON public.notas FOR ALL TO authenticated
  USING (
    turma_id IN (SELECT id FROM public.turmas WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    turma_id IN (SELECT id FROM public.turmas WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Professor manage class notas" ON public.notas FOR ALL TO authenticated
  USING (
    turma_id IN (SELECT id FROM public.turmas WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'professor')
  )
  WITH CHECK (
    turma_id IN (SELECT id FROM public.turmas WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'professor')
  );

CREATE POLICY "Responsavel view child notas" ON public.notas FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- FALTAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view faltas" ON public.faltas;
DROP POLICY IF EXISTS "Authenticated can insert faltas" ON public.faltas;
DROP POLICY IF EXISTS "Authenticated can update faltas" ON public.faltas;
DROP POLICY IF EXISTS "Authenticated can delete faltas" ON public.faltas;

CREATE POLICY "Secretaria full access faltas" ON public.faltas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school faltas" ON public.faltas FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Professor manage class faltas" ON public.faltas FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'professor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'professor')
  );

CREATE POLICY "Responsavel view child faltas" ON public.faltas FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- DISCIPLINAS TABLE (reference data - broader access)
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Authenticated can insert disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Authenticated can update disciplinas" ON public.disciplinas;
DROP POLICY IF EXISTS "Authenticated can delete disciplinas" ON public.disciplinas;

CREATE POLICY "Secretaria full access disciplinas" ON public.disciplinas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Education staff view disciplinas" ON public.disciplinas FOR SELECT TO authenticated
  USING (
    public.has_education_role(auth.uid(), 'diretor') OR 
    public.has_education_role(auth.uid(), 'professor') OR
    public.has_education_role(auth.uid(), 'responsavel')
  );

-- =============================================
-- CALENDARIO_ESCOLAR TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view calendario" ON public.calendario_escolar;
DROP POLICY IF EXISTS "Authenticated can insert calendario" ON public.calendario_escolar;
DROP POLICY IF EXISTS "Authenticated can update calendario" ON public.calendario_escolar;
DROP POLICY IF EXISTS "Authenticated can delete calendario" ON public.calendario_escolar;

CREATE POLICY "Secretaria full access calendario" ON public.calendario_escolar FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school calendario" ON public.calendario_escolar FOR ALL TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'))
  WITH CHECK (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'));

CREATE POLICY "Professor view school calendario" ON public.calendario_escolar FOR SELECT TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Responsavel view calendario" ON public.calendario_escolar FOR SELECT TO authenticated
  USING (public.has_education_role(auth.uid(), 'responsavel'));

-- =============================================
-- CARDAPIOS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view cardapios" ON public.cardapios;
DROP POLICY IF EXISTS "Authenticated can insert cardapios" ON public.cardapios;
DROP POLICY IF EXISTS "Authenticated can update cardapios" ON public.cardapios;
DROP POLICY IF EXISTS "Authenticated can delete cardapios" ON public.cardapios;

CREATE POLICY "Secretaria full access cardapios" ON public.cardapios FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school cardapios" ON public.cardapios FOR ALL TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'))
  WITH CHECK (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'));

CREATE POLICY "Staff view school cardapios" ON public.cardapios FOR SELECT TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())));

CREATE POLICY "Responsavel view cardapios" ON public.cardapios FOR SELECT TO authenticated
  USING (public.has_education_role(auth.uid(), 'responsavel'));

-- =============================================
-- ESTOQUE_ALIMENTOS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view estoque" ON public.estoque_alimentos;
DROP POLICY IF EXISTS "Authenticated can insert estoque" ON public.estoque_alimentos;
DROP POLICY IF EXISTS "Authenticated can update estoque" ON public.estoque_alimentos;
DROP POLICY IF EXISTS "Authenticated can delete estoque" ON public.estoque_alimentos;

CREATE POLICY "Secretaria full access estoque" ON public.estoque_alimentos FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school estoque" ON public.estoque_alimentos FOR ALL TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'))
  WITH CHECK (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'));

-- =============================================
-- CONSUMO_MERENDA TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view consumo_merenda" ON public.consumo_merenda;
DROP POLICY IF EXISTS "Authenticated can insert consumo_merenda" ON public.consumo_merenda;
DROP POLICY IF EXISTS "Authenticated can update consumo_merenda" ON public.consumo_merenda;
DROP POLICY IF EXISTS "Authenticated can delete consumo_merenda" ON public.consumo_merenda;

CREATE POLICY "Secretaria full access consumo_merenda" ON public.consumo_merenda FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school consumo" ON public.consumo_merenda FOR ALL TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'))
  WITH CHECK (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'));

-- =============================================
-- ROTAS_TRANSPORTE TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view rotas" ON public.rotas_transporte;
DROP POLICY IF EXISTS "Authenticated can insert rotas" ON public.rotas_transporte;
DROP POLICY IF EXISTS "Authenticated can update rotas" ON public.rotas_transporte;
DROP POLICY IF EXISTS "Authenticated can delete rotas" ON public.rotas_transporte;

CREATE POLICY "Secretaria full access rotas" ON public.rotas_transporte FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school rotas" ON public.rotas_transporte FOR ALL TO authenticated
  USING (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'))
  WITH CHECK (escola_id IN (SELECT public.get_user_school_ids(auth.uid())) AND public.has_education_role(auth.uid(), 'diretor'));

CREATE POLICY "Responsavel view child rotas" ON public.rotas_transporte FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT ar.rota_id FROM public.alunos_rotas ar
      JOIN public.responsaveis_alunos ra ON ra.aluno_id = ar.aluno_id
      WHERE ra.responsavel_id = auth.uid()
    )
  );

-- =============================================
-- VEICULOS_TRANSPORTE TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view veiculos" ON public.veiculos_transporte;
DROP POLICY IF EXISTS "Authenticated can insert veiculos" ON public.veiculos_transporte;
DROP POLICY IF EXISTS "Authenticated can update veiculos" ON public.veiculos_transporte;
DROP POLICY IF EXISTS "Authenticated can delete veiculos" ON public.veiculos_transporte;

CREATE POLICY "Secretaria full access veiculos" ON public.veiculos_transporte FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor view veiculos" ON public.veiculos_transporte FOR SELECT TO authenticated
  USING (public.has_education_role(auth.uid(), 'diretor'));

-- =============================================
-- ALUNOS_ROTAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view alunos_rotas" ON public.alunos_rotas;
DROP POLICY IF EXISTS "Authenticated can insert alunos_rotas" ON public.alunos_rotas;
DROP POLICY IF EXISTS "Authenticated can update alunos_rotas" ON public.alunos_rotas;
DROP POLICY IF EXISTS "Authenticated can delete alunos_rotas" ON public.alunos_rotas;

CREATE POLICY "Secretaria full access alunos_rotas" ON public.alunos_rotas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school alunos_rotas" ON public.alunos_rotas FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Responsavel view child rotas" ON public.alunos_rotas FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- RESTRICOES_ALIMENTARES TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view restricoes" ON public.restricoes_alimentares;
DROP POLICY IF EXISTS "Authenticated can insert restricoes" ON public.restricoes_alimentares;
DROP POLICY IF EXISTS "Authenticated can update restricoes" ON public.restricoes_alimentares;
DROP POLICY IF EXISTS "Authenticated can delete restricoes" ON public.restricoes_alimentares;

CREATE POLICY "Secretaria full access restricoes" ON public.restricoes_alimentares FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school restricoes" ON public.restricoes_alimentares FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Responsavel manage child restricoes" ON public.restricoes_alimentares FOR ALL TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id))
  WITH CHECK (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- ALERTAS_EDUCACIONAIS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view alertas" ON public.alertas_educacionais;
DROP POLICY IF EXISTS "Authenticated can insert alertas" ON public.alertas_educacionais;
DROP POLICY IF EXISTS "Authenticated can update alertas" ON public.alertas_educacionais;
DROP POLICY IF EXISTS "Authenticated can delete alertas" ON public.alertas_educacionais;

CREATE POLICY "Secretaria full access alertas" ON public.alertas_educacionais FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school alertas" ON public.alertas_educacionais FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Professor view class alertas" ON public.alertas_educacionais FOR SELECT TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'professor')
  );

CREATE POLICY "Responsavel view child alertas" ON public.alertas_educacionais FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- METAS_EDUCACAO TABLE (administrative - secretaria only write)
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view metas" ON public.metas_educacao;
DROP POLICY IF EXISTS "Authenticated can insert metas" ON public.metas_educacao;
DROP POLICY IF EXISTS "Authenticated can update metas" ON public.metas_educacao;
DROP POLICY IF EXISTS "Authenticated can delete metas" ON public.metas_educacao;

CREATE POLICY "Secretaria full access metas" ON public.metas_educacao FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor view metas" ON public.metas_educacao FOR SELECT TO authenticated
  USING (public.has_education_role(auth.uid(), 'diretor'));

-- =============================================
-- TRANSFERENCIAS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Authenticated can insert transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Authenticated can update transferencias" ON public.transferencias;
DROP POLICY IF EXISTS "Authenticated can delete transferencias" ON public.transferencias;

CREATE POLICY "Secretaria full access transferencias" ON public.transferencias FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school transferencias" ON public.transferencias FOR ALL TO authenticated
  USING (
    (escola_origem_id IN (SELECT public.get_user_school_ids(auth.uid())) OR
     escola_destino_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    (escola_origem_id IN (SELECT public.get_user_school_ids(auth.uid())) OR
     escola_destino_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Responsavel view child transferencias" ON public.transferencias FOR SELECT TO authenticated
  USING (public.is_responsavel_of_student(auth.uid(), aluno_id));

-- =============================================
-- CONFIGURACOES_ALERTAS TABLE (system config - secretaria only)
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view configuracoes" ON public.configuracoes_alertas;
DROP POLICY IF EXISTS "Authenticated can insert configuracoes" ON public.configuracoes_alertas;
DROP POLICY IF EXISTS "Authenticated can update configuracoes" ON public.configuracoes_alertas;

CREATE POLICY "Secretaria full access configuracoes" ON public.configuracoes_alertas FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Staff view configuracoes" ON public.configuracoes_alertas FOR SELECT TO authenticated
  USING (
    public.has_education_role(auth.uid(), 'diretor') OR 
    public.has_education_role(auth.uid(), 'professor')
  );

-- =============================================
-- RESPONSAVEIS_ALUNOS TABLE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view responsaveis_alunos" ON public.responsaveis_alunos;
DROP POLICY IF EXISTS "Authenticated can insert responsaveis_alunos" ON public.responsaveis_alunos;
DROP POLICY IF EXISTS "Authenticated can update responsaveis_alunos" ON public.responsaveis_alunos;
DROP POLICY IF EXISTS "Authenticated can delete responsaveis_alunos" ON public.responsaveis_alunos;

CREATE POLICY "Secretaria full access responsaveis_alunos" ON public.responsaveis_alunos FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Diretor manage school responsaveis" ON public.responsaveis_alunos FOR ALL TO authenticated
  USING (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  )
  WITH CHECK (
    aluno_id IN (SELECT id FROM public.alunos WHERE escola_id IN (SELECT public.get_user_school_ids(auth.uid())))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Responsavel view own links" ON public.responsaveis_alunos FOR SELECT TO authenticated
  USING (responsavel_id = auth.uid());

-- =============================================
-- USER_EDUCATION_ROLES TABLE (admin only)
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view education roles" ON public.user_education_roles;
DROP POLICY IF EXISTS "Authenticated can insert education roles" ON public.user_education_roles;
DROP POLICY IF EXISTS "Authenticated can update education roles" ON public.user_education_roles;
DROP POLICY IF EXISTS "Authenticated can delete education roles" ON public.user_education_roles;

CREATE POLICY "Secretaria full access roles" ON public.user_education_roles FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

CREATE POLICY "Users view own roles" ON public.user_education_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
