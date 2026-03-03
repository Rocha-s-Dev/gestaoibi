-- Allow admin_municipal full access to escolas
CREATE POLICY "Admin full access escolas"
ON public.escolas
FOR ALL
TO authenticated
USING (is_admin_municipal(auth.uid()))
WITH CHECK (is_admin_municipal(auth.uid()));