
CREATE POLICY "Admin municipal full access profissionais_saude"
ON public.profissionais_saude
FOR ALL
TO authenticated
USING (public.is_admin_municipal(auth.uid()))
WITH CHECK (public.is_admin_municipal(auth.uid()));
