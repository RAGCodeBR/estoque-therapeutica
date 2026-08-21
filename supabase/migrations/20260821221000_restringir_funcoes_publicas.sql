-- Remove a concessão implícita a PUBLIC, preservando apenas os fluxos autenticados.
revoke execute on function public.criar_perfil_usuario() from public;
revoke execute on function public.listar_usuarios() from public;
revoke execute on function public.meu_papel() from public;
revoke execute on function public.minha_filial_id() from public;
revoke execute on function public.confirmar_recebimento_pedido(text) from public;
revoke execute on function public.confirmar_recebimento_item_pedido(text, text) from public;

grant execute on function public.listar_usuarios() to authenticated;
grant execute on function public.meu_papel() to authenticated;
grant execute on function public.minha_filial_id() to authenticated;
grant execute on function public.confirmar_recebimento_pedido(text) to authenticated;
grant execute on function public.confirmar_recebimento_item_pedido(text, text) to authenticated;
