

## Correção do Erro de Vínculo Funcional + Seleção de Local (Educação/Saúde)

### Problema Principal
A query do hook `useVinculosFuncionais` tenta fazer join `profiles:user_id(...)`, mas a FK de `vinculos_funcionais.user_id` aponta para `auth.users`, não para `profiles`. O PostgREST não consegue resolver esse join, retornando erro 400.

### Problema Secundário
Educação e Saúde precisam de seleção de local de trabalho (escola ou unidade de saúde) ao vincular funcionário.

---

### 1. Migração SQL
- Adicionar colunas `escola_id` (FK → escolas) e `unidade_saude_id` (FK → unidades_saude) em `vinculos_funcionais`, ambas nullable
- Criar uma view `vinculos_funcionais_view` que faz o join com profiles internamente (contornando a limitação de FK para auth.users), ou criar uma function RPC que retorna os dados com perfil incluído

### 2. Corrigir `useVinculosFuncionais.ts`
- Remover o join `profiles:user_id(...)` da query PostgREST (causa do erro 400)
- Buscar dados de perfil separadamente usando a tabela `profiles` com os `user_id`s retornados, ou usar um RPC que já faça o join server-side
- Manter os demais joins (cargos_publicos, funcoes_administrativas, secretarias, unidades_administrativas)

### 3. Atualizar `EquipeSecretaria.tsx`
- No dialog de vinculação, detectar se a secretaria é SME (Educação) ou SMS (Saúde) usando o `secretariaId`
- Se for SME: exibir select de "Local de Trabalho" com opções: "Secretaria (sede)" + lista de escolas cadastradas
- Se for SMS: exibir select de "Local de Trabalho" com opções: "Secretaria (sede)" + lista de unidades de saúde cadastradas
- Salvar o `escola_id` ou `unidade_saude_id` correspondente no vínculo
- Exibir coluna "Local" na tabela de equipe

### 4. Criar hooks auxiliares (se necessário)
- Reutilizar `useEscolas` existente para listar escolas
- Reutilizar `useUnidadesSaude` existente para listar unidades de saúde

### Arquivos afetados
- Migração SQL (colunas escola_id, unidade_saude_id)
- `src/hooks/useVinculosFuncionais.ts` (corrigir query)
- `src/components/shared/EquipeSecretaria.tsx` (seletor de local + coluna local)

