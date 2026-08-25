-- Controla a validade e a troca obrigatória de senhas temporárias definidas pelo administrador.
alter table public.usuarios
  add column if not exists deve_alterar_senha boolean not null default false,
  add column if not exists senha_temporaria_ate timestamptz;
