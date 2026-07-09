
CREATE POLICY "social_docs_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documentos-social' AND public.can_view_social(auth.uid()));

CREATE POLICY "social_docs_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos-social' AND public.can_manage_social(auth.uid()));

CREATE POLICY "social_docs_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documentos-social' AND public.can_manage_social(auth.uid()));

CREATE POLICY "social_docs_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documentos-social' AND (public.is_admin_municipal(auth.uid()) OR public.is_secretario_assistencia_social(auth.uid())));
