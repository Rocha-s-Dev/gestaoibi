-- Permitir admin municipal gerenciar todas as unidades de saúde
CREATE POLICY "Admin municipal full access unidades_saude"
ON public.unidades_saude
FOR ALL
TO authenticated
USING (public.is_admin_municipal(auth.uid()))
WITH CHECK (public.is_admin_municipal(auth.uid()));