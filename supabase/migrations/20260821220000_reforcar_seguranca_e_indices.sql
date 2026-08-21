-- Reforça as permissões sem alterar produtos, saldos, pedidos ou históricos.
drop policy if exists "Alteração pública temporária" on public.produtos;

-- As funções abaixo são usadas pelo sistema autenticado ou por gatilhos internos;
-- nenhum acesso anônimo é necessário.
revoke execute on function public.criar_perfil_usuario() from anon;
revoke execute on function public.listar_usuarios() from anon;
revoke execute on function public.meu_papel() from anon;
revoke execute on function public.minha_filial_id() from anon;
revoke execute on function public.confirmar_recebimento_pedido(text) from anon;
revoke execute on function public.confirmar_recebimento_item_pedido(text, text) from anon;

-- Evita que funções internas dependam do search_path da sessão.
alter function public.substituir_estado_estoque(jsonb) set search_path = public;
alter function public.definir_atualizado_em() set search_path = public;

-- Índices preventivos para as chaves estrangeiras usadas nos fluxos do CD.
create index if not exists estoque_filiais_produto_id_idx on public.estoque_filiais (produto_id);
create index if not exists movimentacoes_filial_id_idx on public.movimentacoes (filial_id);
create index if not exists movimentacoes_pedido_id_idx on public.movimentacoes (pedido_id);
