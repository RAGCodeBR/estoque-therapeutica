# Estoque Therapeutica

## Acesso e Supabase

- O acesso é feito com e-mail e senha pelo Supabase Auth.
- Antes de abrir o sistema, execute `node scripts/gerar-config.js` para gerar `assets/js/env.js` a partir de `.env.local`.
- Execute `supabase/supabase-schema.sql`, `supabase/usuarios-auth.sql`, `supabase/usuarios-admin.sql`, `supabase/concorrencia.sql` e `supabase/pedido-itens-status.sql`, nessa ordem, no SQL Editor.
- Para habilitar senhas temporárias, aplique `supabase/migrations/20260825090000_senhas_temporarias.sql` no SQL Editor e publique as funções `redefinir-senha-temporaria` e `concluir-senha-temporaria` (`supabase functions deploy <nome-da-função>`).
- Cadastros novos entram como usuários de filial. Promova o primeiro administrador usando o comando comentado em `usuarios-auth.sql`.
- O banco usa Row Level Security: filiais veem somente seu estoque e pedidos; administradores do CD administram o estoque global.

Protótipo de controle do Centro de Distribuição (CD) da Therapeutica, criado com HTML, CSS e JavaScript puro.

## O que funciona nesta versão

- Cadastro, edição e arquivamento de produtos;
- Pesquisa e filtro por categoria;
- Entrada e saída de produtos com bloqueio de estoque negativo;
- Alertas automáticos de estoque baixo;
- Histórico de movimentações com saldo antes e depois;
- Portais de demonstração para Sorriso, Blumenau, Lucas e Sinop, além da visão do CD;
- Estoque individual por filial;
- Pedidos em lista: uma filial pode enviar vários produtos na mesma solicitação, com estoque atual obrigatório para cada item;
- Aprovação, recusa ou espera de compra para pedidos;
- Transferência aprovada baixa o estoque do CD e atualiza a quantidade conhecida da filial;
- Backup e restauração dos dados em arquivo JSON.

## Como abrir

Abra o arquivo `index.html` em um navegador. Para o desenvolvimento, a extensão Live Server do VS Code deixa a atualização mais prática.

## Limite desta fase

Os dados ficam no navegador atual usando `localStorage`. O seletor de “Visualização” serve apenas para demonstrar os portais: ele não é um login e não protege os dados. Portanto, ainda não existem sincronização entre computadores, permissões reais nem banco de dados remoto.

Na próxima fase, o frontend será conectado ao Supabase para:

- autenticação do CD e das filiais;
- banco PostgreSQL;
- políticas de segurança por usuário/filial;
- dados compartilhados entre dispositivos;
- publicação segura no GitHub Pages.

## Estrutura do projeto

```text
estoque-therapeutica/
├── index.html
├── style.css
├── script.js
└── README.md
```
