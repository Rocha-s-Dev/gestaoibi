

## Corrigir Constraint de Chave Estrangeira em `unidades_saude`

### Problema
O campo `responsavel_id` na tabela `unidades_saude` possui uma foreign key apontando para `profissionais_saude`. Porem, o componente `VincularUsuarioRH` seleciona usuarios do registro geral de RH (tabela `profiles`), que podem nao estar cadastrados como profissionais de saude. Isso causa o erro:

> insert or update on table "unidades_saude" violates foreign key constraint "unidades_saude_responsavel_id_fkey"

### Solucao

**Migracaoo SQL:**
1. Remover a foreign key existente `unidades_saude_responsavel_id_fkey` que aponta para `profissionais_saude`
2. Criar uma nova foreign key no mesmo campo `responsavel_id` apontando para `profiles(user_id)`

Isso permite que qualquer usuario registrado no sistema (via RH) possa ser designado como responsavel por uma unidade de saude, sem exigir que ele esteja previamente cadastrado na tabela `profissionais_saude`.

### Detalhes Tecnicos

```sql
ALTER TABLE public.unidades_saude
  DROP CONSTRAINT unidades_saude_responsavel_id_fkey;

ALTER TABLE public.unidades_saude
  ADD CONSTRAINT unidades_saude_responsavel_id_fkey
  FOREIGN KEY (responsavel_id) REFERENCES public.profiles(user_id);
```

Nenhuma alteracao de codigo eh necessaria -- o hook `useUnidadesSaude` ja envia o `responsavel_id` corretamente a partir do `VincularUsuarioRH`.

