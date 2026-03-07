

# Plano: Melhorar Cadastro de Professores e Auxiliares

## Resumo

Adicionar campos de tipo de professor, status e data de início na tabela `professores`. Criar tabela de vínculo professor-turma e sistema completo de auxiliares de classe com vínculo a turmas/alunos.

---

## 1. Migração de Banco de Dados

### Alterações na tabela `professores`
```sql
ALTER TABLE public.professores 
  ADD COLUMN tipo_professor text DEFAULT 'professor_regente',
  ADD COLUMN status text DEFAULT 'ativo',
  ADD COLUMN data_inicio date DEFAULT CURRENT_DATE;
```

### Nova tabela `professor_turma`
```sql
CREATE TABLE public.professor_turma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid REFERENCES public.professores(id) ON DELETE CASCADE NOT NULL,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  disciplina_id uuid REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  turno text,
  ano_letivo integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now()
);
```

### Nova tabela `auxiliares_classe`
```sql
CREATE TABLE public.auxiliares_classe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,  -- referência ao profiles via user_id do RH
  tipo_profissional text DEFAULT 'auxiliar_turma',
  escola_id uuid REFERENCES public.escolas(id) ON DELETE SET NULL,
  status text DEFAULT 'ativo',
  data_inicio date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
```

### Nova tabela `auxiliar_turma`
```sql
CREATE TABLE public.auxiliar_turma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auxiliar_id uuid REFERENCES public.auxiliares_classe(id) ON DELETE CASCADE NOT NULL,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  tipo_auxiliar text NOT NULL, -- 'auxiliar_turma' ou 'auxiliar_aluno_especial'
  aluno_id uuid REFERENCES public.alunos(id) ON DELETE SET NULL,
  turno text,
  ano_letivo integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  created_at timestamptz DEFAULT now()
);
```

RLS: Policies de acesso para authenticated em todas as novas tabelas.

---

## 2. Hooks (novos e alterados)

| Hook | Ação |
|------|------|
| `useProfessores.ts` | Atualizar tipo Professor para incluir `tipo_professor`, `status`, `data_inicio`. Atualizar insert/update. |
| `useProfessorTurmas.ts` | **Novo** - CRUD para vínculos professor-turma (buscar por professor_id, salvar lista). |
| `useAuxiliaresClasse.ts` | **Novo** - CRUD para auxiliares (vincular do RH, listar, editar, remover). |
| `useAuxiliarTurmas.ts` | **Novo** - CRUD para vínculos auxiliar-turma com suporte a aluno_id opcional. |

---

## 3. Componentes UI (novos e alterados)

### `ProfessorDialog.tsx` - Atualizar
- Adicionar campos: **Tipo de Professor** (select com 8 opções), **Status**, **Data de Início**
- Adicionar seção **"Turmas que leciona"** para vincular professor a turma+disciplina+turno
- Manter seleção de matérias existente intacta

### `AuxiliarDialog.tsx` - Novo
- Seleção de servidor via `VincularUsuarioRH`
- Campos: tipo (Auxiliar de Turma / Auxiliar de Aluno Especial), escola, status, data_inicio
- Seção de vínculo a turmas com campo condicional de aluno (se tipo = auxiliar_aluno_especial)

### `CadastroEducacao.tsx` - Atualizar
- Renomear aba "Professores" → "Professores e Auxiliares"
- Exibir professores e auxiliares em seções separadas dentro da mesma aba
- Cards de professor mostram tipo_professor, status, data_inicio
- Cards de auxiliar mostram tipo, escola, turma vinculada

### Visualização da Turma (dentro da aba Turmas)
- Adicionar seção expandida ou dialog de detalhes da turma mostrando:
  - **Professores**: nome, disciplina, turno
  - **Auxiliares**: nome, tipo, aluno vinculado (se houver)

---

## 4. Tipos de Professor (constantes)

```text
professor_regente, professor_ed_fisica, professor_arte, 
professor_ingles, professor_aee, professor_reforco, 
professor_substituto, professor_temporario
```

## 5. Tipos de Auxiliar (constantes)

```text
auxiliar_turma, auxiliar_aluno_especial
```

---

## 6. Arquivos impactados

| Arquivo | Tipo |
|---------|------|
| `supabase/migrations/new.sql` | Novo |
| `src/hooks/useProfessores.ts` | Editar |
| `src/hooks/useProfessorTurmas.ts` | Novo |
| `src/hooks/useAuxiliaresClasse.ts` | Novo |
| `src/hooks/useAuxiliarTurmas.ts` | Novo |
| `src/components/educacao/ProfessorDialog.tsx` | Editar |
| `src/components/educacao/AuxiliarDialog.tsx` | Novo |
| `src/components/educacao/TurmaDetalhesDialog.tsx` | Novo |
| `src/components/educacao/CadastroEducacao.tsx` | Editar |

