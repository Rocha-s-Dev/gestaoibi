

## Melhorias na Central RH e Edicao de Tipo de Usuario

### Problema 1: Tela Central RH com botao duplicado
A tela "Central RH" tem um botao "Novo Usuario" com formulario completo, sendo que a aba "Servidores" ja oferece essa mesma funcionalidade. Isso causa confusao.

### Problema 2: Nao eh possivel editar o tipo de usuario (ex: secretario -> funcionario)
No dialog de edicao do servidor (aba Servidores), o campo "Tipo de Usuario" so aparece na criacao (esta dentro de um bloco `{!servidor && (...)}`). Alem disso, o campo `tipo_usuario` nao esta incluido no payload de atualizacao do profile.

---

### Alteracoes

**Arquivo 1: `src/components/rh/RHDashboard.tsx`**
- Remover o botao "Novo Usuario", o Dialog de criacao, e todo o estado do formulario (`form`, `dialogOpen`, `handleCreateUser`)
- Manter o dashboard de KPIs e a tabela de usuarios
- Adicionar botao de visualizacao (icone olho) em cada linha da tabela, que abre o `ViewServidorDialog` para consulta rapida
- Manter filtros de busca e status

**Arquivo 2: `src/components/admin/ServidorDialog.tsx`**
- Mover a secao "Tipo de Usuario" (select de tipo + select de secretaria) para FORA do bloco `{!servidor && (...)}`, tornando-a visivel tambem no modo edicao
- Adicionar `tipo_usuario` ao objeto `profileData` na logica de atualizacao (handleSubmit, modo edicao)
- Quando o tipo for alterado de "secretario" para outro, limpar o `secretaria_id`

### Detalhes tecnicos

No `ServidorDialog.tsx`:
- A secao de "Tipo de Usuario" (linhas 617-660) sera extraida do bloco condicional `{!servidor}` e colocada como secao independente visivel sempre
- No `handleSubmit`, modo edicao (linha 302), adicionar `tipo_usuario: formData.tipo_usuario` ao objeto `profileData`
- O `useEffect` ja carrega o `tipo_usuario` atual do servidor (linha 185), entao o campo ja vira preenchido

No `RHDashboard.tsx`:
- Importar `ViewServidorDialog` e `Eye` de lucide-react
- Remover imports de `Dialog`, `DialogContent`, `DialogTrigger`, `UserPlus`, `Label`
- Remover estado `form`, `dialogOpen` e funcao `handleCreateUser`
- Substituir coluna "Acoes" para incluir apenas botao de visualizacao rapida
- Manter acoes contextuais (Regularizar, Inativar, Reativar)
