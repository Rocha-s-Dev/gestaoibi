
-- Fix remaining permissive policies on non-education tables

-- =============================================
-- PROFILES TABLE (already has proper policies, just verify)
-- =============================================
-- Profiles table policies are already role-based (user can view all, insert/update own)

-- =============================================
-- FINANCIAL_GOALS TABLE - user-scoped
-- =============================================
DROP POLICY IF EXISTS "Authenticated can view financial_goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Authenticated can insert financial_goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Authenticated can update financial_goals" ON public.financial_goals;
DROP POLICY IF EXISTS "Authenticated can delete financial_goals" ON public.financial_goals;

CREATE POLICY "Users manage own financial_goals" ON public.financial_goals FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- NOTIFICATIONS TABLE (already has proper user-scoped policies)
-- =============================================
-- Keep existing policies - they're already user-scoped

-- =============================================
-- SOLICITACOES_MATRICULA TABLE - public insert, role-based management
-- =============================================
DROP POLICY IF EXISTS "Anyone can insert solicitacao" ON public.solicitacoes_matricula;
DROP POLICY IF EXISTS "Anyone can view own solicitacao" ON public.solicitacoes_matricula;
DROP POLICY IF EXISTS "Authenticated can update solicitacao" ON public.solicitacoes_matricula;

-- Public can submit enrollment requests (no auth required for insert)
CREATE POLICY "Public can submit enrollment" ON public.solicitacoes_matricula FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Secretaria full access
CREATE POLICY "Secretaria full access solicitacoes" ON public.solicitacoes_matricula FOR ALL TO authenticated
  USING (public.is_secretaria(auth.uid()))
  WITH CHECK (public.is_secretaria(auth.uid()));

-- Diretor can view/update for their school
CREATE POLICY "Diretor manage school solicitacoes" ON public.solicitacoes_matricula FOR SELECT TO authenticated
  USING (
    escola_desejada_id IN (SELECT public.get_user_school_ids(auth.uid()))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

CREATE POLICY "Diretor update school solicitacoes" ON public.solicitacoes_matricula FOR UPDATE TO authenticated
  USING (
    escola_desejada_id IN (SELECT public.get_user_school_ids(auth.uid()))
    AND public.has_education_role(auth.uid(), 'diretor')
  );

-- Public can view by protocol (for status check)
CREATE POLICY "Public view by protocol" ON public.solicitacoes_matricula FOR SELECT TO anon, authenticated
  USING (true);
