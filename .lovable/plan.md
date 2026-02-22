

## Conectar Unidades de Saude ao Banco de Dados

### Problema Identificado
O componente `CadastroUnidadesSaude` usa dados mock (fictícios) em memoria local. Criar, editar e excluir unidades nao persiste no banco de dados. Ao navegar ou recarregar, os dados mock sempre reaparecem.

### Solucao

**1. Criar hook `useUnidadesSaude`**
- Novo arquivo `src/hooks/useUnidadesSaude.ts`
- Funcoes CRUD completas usando a tabela `unidades_saude` existente no banco
- Mapeamento entre o formato do frontend (camelCase) e o formato do banco (snake_case)
- Campos mapeados:
  - `nome`, `tipo`, `endereco`, `telefone` (direto)
  - `horarioFuncionamento` -> `horario_funcionamento` (JSONB)
  - `especialidades` -> `especialidades` (ARRAY)
  - `capacidade` -> `capacidade_diaria`
  - `responsavel`, `responsavel_id`, `status`, `observacoes` (direto)
- Usar React Query para cache e refetch automatico
- Funcoes: `fetchUnidades`, `createUnidade`, `updateUnidade`, `deleteUnidade`

**2. Reescrever `CadastroUnidadesSaude.tsx`**
- Remover todos os dados mock
- Usar o hook `useUnidadesSaude` para buscar dados do banco
- Busca/filtro feita localmente sobre os dados do banco
- Exclusao chama `deleteUnidade` (DELETE real no banco)
- Confirmacao antes de excluir (dialog de confirmacao)
- Loading state enquanto carrega

**3. Reescrever `UnidadeSaudeDialog.tsx`**
- Receber funcoes `createUnidade` e `updateUnidade` do hook
- No submit, chamar `createUnidade` ou `updateUnidade` com os dados mapeados
- Salvar `responsavel_id` quando um responsavel eh selecionado via VincularUsuarioRH
- Toast de sucesso/erro

### Detalhes Tecnicos

Esquema da tabela `unidades_saude` no banco:
- `id` (uuid), `nome` (text), `tipo` (text), `endereco` (text)
- `telefone` (text), `email` (text), `horario_funcionamento` (jsonb)
- `especialidades` (text[]), `responsavel` (text), `responsavel_id` (uuid)
- `capacidade_diaria` (integer), `status` (text), `observacoes` (text)
- `created_at`, `updated_at` (timestamps)

Nenhuma alteracao no banco de dados eh necessaria -- a tabela ja existe com a estrutura correta e RLS habilitado.

