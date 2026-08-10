-- Execute após os demais arquivos SQL. Adiciona controle otimista aos pedidos.

alter table public.pedidos add column if not exists atualizado_em timestamptz not null default now();
update public.pedidos set atualizado_em = coalesce(atualizado_em, criado_em, now());

create or replace function public.definir_atualizado_em()
returns trigger language plpgsql as $$
begin
  if new.atualizado_em = old.atualizado_em then
    new.atualizado_em = now();
  end if;
  return new;
end;
$$;

drop trigger if exists pedidos_definir_atualizado_em on public.pedidos;
create trigger pedidos_definir_atualizado_em
before update on public.pedidos
for each row execute procedure public.definir_atualizado_em();
