-- Adicionar colunas faltantes em messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS attachment JSONB;

-- Adicionar storage bucket para chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para chat attachments - usuários podem fazer upload
CREATE POLICY "Users can upload own attachments" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'chat_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy para chat attachments - usuários podem ler de conversas que participam
CREATE POLICY "Users can view attachments" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat_attachments');