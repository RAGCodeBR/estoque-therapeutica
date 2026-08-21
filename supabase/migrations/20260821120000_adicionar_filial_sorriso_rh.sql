-- Inclui a unidade de RH sem alterar as filiais ou vínculos já existentes.
insert into public.filiais (id, nome, cidade)
values ('sorriso-rh', 'Sorriso - RH', 'Sorriso, MT')
on conflict (id) do update
set nome = excluded.nome,
    cidade = excluded.cidade;
