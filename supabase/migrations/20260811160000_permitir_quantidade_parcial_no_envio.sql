-- Guarda a quantidade efetivamente enviada quando o CD aprova um item.
alter table public.pedido_itens
  add column if not exists quantidade_enviada integer;

alter table public.pedido_itens
  drop constraint if exists pedido_itens_quantidade_enviada_check;

alter table public.pedido_itens
  add constraint pedido_itens_quantidade_enviada_check
  check (quantidade_enviada is null or (quantidade_enviada > 0 and quantidade_enviada <= quantidade_solicitada));

create or replace function public.confirmar_recebimento_item_pedido(
  p_pedido_id text,
  p_produto_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filial_id text;
  v_quantidade integer;
  v_agora timestamptz := now();
  v_situacao_pedido text;
begin
  select filial_id into v_filial_id from public.pedidos where id = p_pedido_id;

  if v_filial_id is null or not (
    public.meu_papel() = 'cd_admin'
    or (public.meu_papel() = 'filial' and v_filial_id = public.minha_filial_id())
  ) then
    raise exception 'Você não tem permissão para confirmar este pedido.';
  end if;

  select coalesce(quantidade_enviada, quantidade_solicitada) into v_quantidade
  from public.pedido_itens
  where pedido_id = p_pedido_id and produto_id = p_produto_id and situacao = 'em_transito';

  if v_quantidade is null then
    raise exception 'Este item não está aguardando confirmação.';
  end if;

  insert into public.estoque_filiais (filial_id, produto_id, quantidade, atualizado_em)
  values (v_filial_id, p_produto_id, v_quantidade, v_agora)
  on conflict (filial_id, produto_id) do update
    set quantidade = public.estoque_filiais.quantidade + excluded.quantidade,
        atualizado_em = excluded.atualizado_em;

  update public.pedido_itens
  set situacao = 'recebido', recebido_em = v_agora
  where pedido_id = p_pedido_id and produto_id = p_produto_id and situacao = 'em_transito';

  select case
    when every(situacao in ('recebido', 'recusado')) then 'recebido'
    when bool_or(situacao = 'em_transito') then 'em_transito'
    when bool_or(situacao = 'aguardando_compra') then 'aguardando_compra'
    else 'pendente'
  end into v_situacao_pedido
  from public.pedido_itens where pedido_id = p_pedido_id;

  update public.pedidos
  set situacao = v_situacao_pedido,
      recebido_em = case when v_situacao_pedido = 'recebido' then v_agora else null end,
      observacao_matriz = case when v_situacao_pedido = 'recebido' then coalesce(nullif(observacao_matriz, ''), 'Todos os itens enviados foram recebidos pela filial.') else observacao_matriz end,
      atualizado_em = v_agora
  where id = p_pedido_id;
end;
$$;
