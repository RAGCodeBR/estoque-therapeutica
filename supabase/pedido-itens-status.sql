-- Execute este arquivo no SQL Editor após os scripts existentes.
-- Permite que cada produto de um pedido tenha seu próprio fluxo de aprovação.
alter table public.pedido_itens
  add column if not exists situacao text not null default 'pendente'
    check (situacao in ('pendente', 'aguardando_compra', 'em_transito', 'recebido', 'recusado'));

alter table public.pedido_itens
  add column if not exists observacao_matriz text not null default '';
