
ALTER TABLE public.pacientes_tfd
  ADD COLUMN numero_ordem integer,
  ADD COLUMN telefone text,
  ADD COLUMN endereco text,
  ADD COLUMN procedimento text,
  ADD COLUMN local_atendimento text,
  ADD COLUMN horario_atendimento text;
