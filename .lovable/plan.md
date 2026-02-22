

## Corrigir FK e Auto-vincular Responsavel como Profissional de Saude

### Problema
O campo `responsavel_id` em `unidades_saude` referencia `profissionais_saude(id)` (a PK da tabela de profissionais), mas o codigo atual envia o `user_id` do perfil RH. Isso causa a violacao de FK. Alem disso, o usuario selecionado pode nao ter registro na tabela `profissionais_saude`.

### Solucao

**1. Migracao SQL: RLS para admin_municipal em profissionais_saude**

A tabela `profissionais_saude` nao possui politica para `admin_municipal`. Para que o admin possa inserir o profissional automaticamente, sera necessario adicionar uma politica RLS:

```sql
CREATE POLICY "Admin municipal full access profissionais_saude"
ON public.profissionais_saude
FOR ALL
TO authenticated
USING (public.is_admin_municipal(auth.uid()))
WITH CHECK (public.is_admin_municipal(auth.uid()));
```

**2. Alterar `useUnidadesSaude.ts` - logica de criacao/atualizacao**

No `createUnidade` e `updateUnidade`, antes de inserir/atualizar a unidade:

- Se um `responsavel_id` (que na verdade eh o `user_id` do perfil) foi informado:
  1. Verificar se ja existe um registro em `profissionais_saude` para esse `user_id` com status ativo
  2. Se nao existir, criar um novo registro com:
     - `user_id`: o ID do perfil selecionado
     - `cargo`: `diretor_unidade`
     - `status`: `ativo`
  3. Usar o `id` retornado de `profissionais_saude` como o `responsavel_id` na tabela `unidades_saude`
  4. Apos criar a unidade, atualizar o `unidade_id` do profissional para vincular a unidade recem-criada

- Se nenhum responsavel foi selecionado, enviar `responsavel_id: null`

**3. Fluxo completo**

```text
Usuario seleciona servidor do RH (user_id do profiles)
       |
       v
Hook verifica se existe profissional_saude com esse user_id
       |
  Nao existe?  -->  Cria registro em profissionais_saude
       |                cargo = diretor_unidade
       |                status = ativo
       v
Usa profissionais_saude.id como responsavel_id
       |
       v
Insere/atualiza unidades_saude com responsavel_id correto
       |
       v
Atualiza profissional com unidade_id da unidade criada
```

### Arquivos modificados

- `supabase/migrations/` - Nova migracao para RLS em profissionais_saude
- `src/hooks/useUnidadesSaude.ts` - Logica de upsert do profissional antes de salvar a unidade
