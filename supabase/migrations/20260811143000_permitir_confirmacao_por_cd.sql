-- Mantém a confirmação restrita à filial responsável, mas permite que o
-- administrador do CD conclua a ação ao usar o portal de uma filial no modo
-- de visualização administrativa.
create or replace function public.confirmar_recebimento_pedido(p_pedido_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filial_id text;
  v_agora timestamptz := now();
  v_item record;
  v_situacao_pedido text;
begin
  select filial_id into v_filial_id
  from public.pedidos
  where id = p_pedido_id;

  if v_filial_id is null or not (
    public.meu_papel() = 'cd_admin'
    or (public.meu_papel() = 'filial' and v_filial_id = public.minha_filial_id())
  ) then
    raise exception 'Você não tem permissão para confirmar este pedido.';
  end if;

  if not exists (
    select 1 from public.pedido_itens
    where pedido_id = p_pedido_id and situacao = 'em_transito'
  ) then
    raise exception 'Não há itens enviados aguardando confirmação.';
  end if;

  for v_item in
    select produto_id, quantidade_solicitada
    from public.pedido_itens
    where pedido_id = p_pedido_id and situacao = 'em_transito'
  loop
    insert into public.estoque_filiais (filial_id, produto_id, quantidade, atualizado_em)
    values (v_filial_id, v_item.produto_id, v_item.quantidade_solicitada, v_agora)
    on conflict (filial_id, produto_id) do update
      set quantidade = public.estoque_filiais.quantidade + excluded.quantidade,
          atualizado_em = excluded.atualizado_em;
  end loop;

  update public.pedido_itens
  set situacao = 'recebido'
  where pedido_id = p_pedido_id and situacao = 'em_transito';

  select case
    when every(situacao in ('recebido', 'recusado')) then 'recebido'
    when bool_or(situacao = 'em_transito') then 'em_transito'
    when bool_or(situacao = 'aguardando_compra') then 'aguardando_compra'
    else 'pendente'
  end into v_situacao_pedido
  from public.pedido_itens
  where pedido_id = p_pedido_id;

  update public.pedidos
  set situacao = v_situacao_pedido,
      recebido_em = v_agora,
      observacao_matriz = coalesce(nullif(observacao_matriz, ''), 'Pedido recebido pela filial.'),
      atualizado_em = v_agora
  where id = p_pedido_id;
end;
$$;

grant execute on function public.confirmar_recebimento_pedido(text) to authenticated;
