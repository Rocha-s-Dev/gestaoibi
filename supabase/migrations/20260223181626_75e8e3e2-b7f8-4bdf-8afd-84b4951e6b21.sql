
-- Update profiles UPDATE policy to include prefeito role
DROP POLICY IF EXISTS "rh_profiles_update" ON public.profiles;

CREATE POLICY "rh_profiles_update" ON public.profiles
FOR UPDATE
USING (
  is_admin_municipal(auth.uid()) 
  OR is_gestor_rh(auth.uid()) 
  OR has_papel_sistemico(auth.uid(), 'prefeito')
  OR (user_id = auth.uid())
)
WITH CHECK (
  is_admin_municipal(auth.uid()) 
  OR is_gestor_rh(auth.uid()) 
  OR has_papel_sistemico(auth.uid(), 'prefeito')
  OR (user_id = auth.uid())
);
