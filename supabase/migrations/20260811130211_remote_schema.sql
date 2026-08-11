-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE TYPE public.papel_usuario AS ENUM (
  'cd_admin',
  'filial'
);

GRANT ALL ON FUNCTION public.confirmar_recebimento_pedido(text) TO anon;

GRANT ALL ON FUNCTION public.confirmar_recebimento_pedido(text) TO service_role;

CREATE FUNCTION public.criar_perfil_usuario()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  filial text := nullif(new.raw_user_meta_data->>'filial_id', '');
begin
  if filial is not null and not exists (select 1 from public.filiais where id = filial) then
    raise exception 'Filial inválida';
  end if;
  insert into public.usuarios (id, nome, papel, filial_id)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''), 'filial', filial);
  return new;
end;
$function$;

CREATE TRIGGER ao_criar_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_perfil_usuario();

GRANT ALL ON FUNCTION public.criar_perfil_usuario() TO anon;

GRANT ALL ON FUNCTION public.criar_perfil_usuario() TO authenticated;

GRANT ALL ON FUNCTION public.criar_perfil_usuario() TO service_role;

CREATE FUNCTION public.definir_atualizado_em()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  if new.atualizado_em = old.atualizado_em then
    new.atualizado_em = now();
  end if;
  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.definir_atualizado_em() TO anon;

GRANT ALL ON FUNCTION public.definir_atualizado_em() TO authenticated;

GRANT ALL ON FUNCTION public.definir_atualizado_em() TO service_role;

CREATE FUNCTION public.listar_usuarios()
  RETURNS TABLE (
    id        uuid,
    email     text,
    nome      text,
    papel     public.papel_usuario,
    filial_id text,
    criado_em timestamp with time zone
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth'
  AS $function$
begin
  if public.meu_papel() <> 'cd_admin' then
    raise exception 'Apenas administradores podem listar usuários';
  end if;
  return query
    select p.id, u.email::text, p.nome, p.papel, p.filial_id, p.criado_em
    from public.usuarios p
    join auth.users u on u.id = p.id
    order by p.nome, u.email;
end;
$function$;

GRANT ALL ON FUNCTION public.listar_usuarios() TO anon;

GRANT ALL ON FUNCTION public.listar_usuarios() TO authenticated;

GRANT ALL ON FUNCTION public.listar_usuarios() TO service_role;

CREATE FUNCTION public.meu_papel()
  RETURNS public.papel_usuario
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$select papel from public.usuarios where id = auth.uid()$function$;

GRANT ALL ON FUNCTION public.meu_papel() TO anon;

GRANT ALL ON FUNCTION public.meu_papel() TO authenticated;

GRANT ALL ON FUNCTION public.meu_papel() TO service_role;

CREATE FUNCTION public.minha_filial_id()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$select filial_id from public.usuarios where id = auth.uid()$function$;

GRANT ALL ON FUNCTION public.minha_filial_id() TO anon;

GRANT ALL ON FUNCTION public.minha_filial_id() TO authenticated;

GRANT ALL ON FUNCTION public.minha_filial_id() TO service_role;

CREATE FUNCTION public.substituir_estado_estoque (
  p_estado jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$
begin
  delete from public.movimentacoes;
  delete from public.pedido_itens;
  delete from public.estoque_filiais;
  delete from public.pedidos;
  delete from public.produtos;

  insert into public.produtos (id, codigo, nome, categoria, quantidade, estoque_minimo, unidade, ativo, criado_em, atualizado_em, arquivado_em)
  select coalesce(x->>'id', gen_random_uuid()::text), coalesce(x->>'codigo', ''), x->>'nome', x->>'categoria',
    coalesce((x->>'quantidade')::integer, 0), coalesce((x->>'estoqueMinimo')::integer, 0), x->>'unidade',
    coalesce((x->>'ativo')::boolean, true), coalesce((x->>'criadoEm')::timestamptz, now()),
    coalesce((x->>'atualizadoEm')::timestamptz, now()), nullif(x->>'arquivadoEm', '')::timestamptz
  from jsonb_array_elements(coalesce(p_estado->'produtos', '[]'::jsonb)) x;

  insert into public.pedidos (id, filial_id, observacao, observacao_matriz, situacao, compra_prevista, compra_recebida_em, entrega_prevista, recebido_em, criado_em, analisado_em)
  select x->>'id', x->>'filialId', coalesce(x->>'observacao', ''), coalesce(x->>'observacaoMatriz', ''),
    coalesce(x->>'situacao', 'pendente'), nullif(x->>'compraPrevista', '')::date,
    nullif(x->>'compraRecebidaEm', '')::timestamptz, nullif(x->>'entregaPrevista', '')::date,
    nullif(x->>'recebidoEm', '')::timestamptz, coalesce((x->>'criadoEm')::timestamptz, now()),
    nullif(x->>'analisadoEm', '')::timestamptz
  from jsonb_array_elements(coalesce(p_estado->'pedidos', '[]'::jsonb)) x;

  insert into public.pedido_itens (pedido_id, produto_id, estoque_informado, quantidade_solicitada, observacao)
  select p->>'id', i->>'produtoId', coalesce((i->>'estoqueInformado')::integer, 0),
    coalesce((i->>'quantidadeSolicitada')::integer, 1), coalesce(i->>'observacao', '')
  from jsonb_array_elements(coalesce(p_estado->'pedidos', '[]'::jsonb)) p
  cross join lateral jsonb_array_elements(coalesce(p->'itens', '[]'::jsonb)) i;

  insert into public.estoque_filiais (filial_id, produto_id, quantidade, atualizado_em)
  select split_part(key, ':', 1), split_part(key, ':', 2),
    coalesce((value->>'quantidade')::integer, value::text::integer, 0),
    coalesce((value->>'atualizadoEm')::timestamptz, now())
  from jsonb_each(coalesce(p_estado->'estoqueFiliais', '{}'::jsonb));

  insert into public.movimentacoes (id, produto_id, tipo, quantidade, saldo_antes, saldo_depois, observacao, filial_id, pedido_id, criado_em)
  select x->>'id', x->>'produtoId', x->>'tipo', (x->>'quantidade')::integer,
    nullif(x->>'saldoAntes', '')::integer, nullif(x->>'saldoDepois', '')::integer,
    coalesce(x->>'observacao', ''), nullif(x->>'filialId', ''), nullif(x->>'pedidoId', ''),
    coalesce((x->>'criadoEm')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_estado->'movimentacoes', '[]'::jsonb)) x;
end;
$function$;

GRANT ALL ON FUNCTION public.substituir_estado_estoque(jsonb) TO service_role;

CREATE TABLE public.estoque_filiais (
  filial_id     text                     NOT NULL,
  produto_id    text                     NOT NULL,
  quantidade    integer                  DEFAULT 0 NOT NULL,
  atualizado_em timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.estoque_filiais
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.estoque_filiais
  REPLICA IDENTITY FULL;

ALTER TABLE public.estoque_filiais
  ADD CONSTRAINT estoque_filiais_pkey PRIMARY KEY (filial_id, produto_id);

ALTER TABLE public.estoque_filiais
  ADD CONSTRAINT estoque_filiais_quantidade_check CHECK (quantidade >= 0);

GRANT ALL ON public.estoque_filiais TO authenticated;

GRANT ALL ON public.estoque_filiais TO service_role;

CREATE POLICY "cd administra estoque das filiais" ON public.estoque_filiais
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "cd le estoque das filiais" ON public.estoque_filiais
  FOR SELECT
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "filial le seu estoque" ON public.estoque_filiais
  FOR SELECT
  TO authenticated
  USING ((filial_id = public.minha_filial_id()));

CREATE TABLE public.filiais (
  id     text NOT NULL,
  nome   text NOT NULL,
  cidade text NOT NULL
);

ALTER TABLE public.filiais
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.filiais
  ADD CONSTRAINT filiais_pkey PRIMARY KEY (id);

ALTER TABLE public.estoque_filiais
  ADD CONSTRAINT estoque_filiais_filial_id_fkey FOREIGN KEY (filial_id) REFERENCES public.filiais(id);

GRANT ALL ON public.filiais TO authenticated;

GRANT ALL ON public.filiais TO service_role;

CREATE POLICY "cd administra filiais" ON public.filiais
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "usuarios autenticados leem filiais" ON public.filiais
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.movimentacoes (
  id           text                     NOT NULL,
  produto_id   text                     NOT NULL,
  tipo         text                     NOT NULL,
  quantidade   integer                  NOT NULL,
  saldo_antes  integer,
  saldo_depois integer,
  observacao   text                     DEFAULT ''::text NOT NULL,
  filial_id    text,
  pedido_id    text,
  criado_em    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.movimentacoes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.movimentacoes
  REPLICA IDENTITY FULL;

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_filial_id_fkey FOREIGN KEY (filial_id) REFERENCES public.filiais(id);

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_pkey PRIMARY KEY (id);

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_quantidade_check CHECK (quantidade > 0);

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_tipo_check CHECK (tipo = ANY (ARRAY['entrada'::text, 'saida'::text, 'transferencia'::text, 'ajuste'::text]));

GRANT ALL ON public.movimentacoes TO authenticated;

GRANT ALL ON public.movimentacoes TO service_role;

CREATE INDEX movimentacoes_criado_em_idx ON public.movimentacoes (criado_em DESC);

CREATE POLICY "cd administra movimentacoes" ON public.movimentacoes
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "cd le movimentacoes" ON public.movimentacoes
  FOR SELECT
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE TABLE public.pedido_itens (
  pedido_id             text    NOT NULL,
  produto_id            text    NOT NULL,
  estoque_informado     integer NOT NULL,
  quantidade_solicitada integer NOT NULL,
  observacao            text    DEFAULT ''::text NOT NULL,
  situacao              text    DEFAULT 'pendente'::text NOT NULL,
  observacao_matriz     text    DEFAULT ''::text NOT NULL
);

ALTER TABLE public.pedido_itens
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pedido_itens
  REPLICA IDENTITY FULL;

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_estoque_informado_check CHECK (estoque_informado >= 0);

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_pkey PRIMARY KEY (pedido_id, produto_id);

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_quantidade_solicitada_check CHECK (quantidade_solicitada > 0);

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_situacao_check CHECK (situacao = ANY (ARRAY['pendente'::text, 'aguardando_compra'::text, 'em_transito'::text, 'recebido'::text, 'recusado'::text]));

GRANT ALL ON public.pedido_itens TO authenticated;

GRANT ALL ON public.pedido_itens TO service_role;

CREATE POLICY "cd administra itens" ON public.pedido_itens
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "cd le itens" ON public.pedido_itens
  FOR SELECT
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE TABLE public.pedidos (
  id                 text                     NOT NULL,
  filial_id          text                     NOT NULL,
  observacao         text                     DEFAULT ''::text NOT NULL,
  observacao_matriz  text                     DEFAULT ''::text NOT NULL,
  situacao           text                     DEFAULT 'pendente'::text NOT NULL,
  compra_prevista    date,
  compra_recebida_em timestamp with time zone,
  entrega_prevista   date,
  recebido_em        timestamp with time zone,
  criado_em          timestamp with time zone DEFAULT now() NOT NULL,
  analisado_em       timestamp with time zone,
  atualizado_em      timestamp with time zone DEFAULT now() NOT NULL
);

CREATE POLICY "filial cria itens dos seus pedidos" ON public.pedido_itens
  FOR INSERT
  TO authenticated
  WITH CHECK (((EXISTS ( SELECT 1
   FROM public.pedidos p
  WHERE ((p.id = pedido_itens.pedido_id) AND (p.filial_id = public.minha_filial_id())))) AND (public.meu_papel() = 'filial'::public.papel_usuario)));

CREATE POLICY "filial le itens dos seus pedidos" ON public.pedido_itens
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.pedidos p
  WHERE ((p.id = pedido_itens.pedido_id) AND (p.filial_id = public.minha_filial_id())))));

ALTER TABLE public.pedidos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.pedidos
  REPLICA IDENTITY FULL;

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_filial_id_fkey FOREIGN KEY (filial_id) REFERENCES public.filiais(id);

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id);

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE CASCADE;

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_situacao_check CHECK (situacao = ANY (ARRAY['pendente'::text, 'aguardando_compra'::text, 'em_transito'::text, 'recebido'::text, 'recusado'::text]));

GRANT ALL ON public.pedidos TO authenticated;

GRANT ALL ON public.pedidos TO service_role;

CREATE INDEX pedidos_filial_id_idx ON public.pedidos (filial_id);

CREATE TRIGGER pedidos_definir_atualizado_em
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.definir_atualizado_em();

CREATE POLICY "cd administra pedidos" ON public.pedidos
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "cd le todos pedidos" ON public.pedidos
  FOR SELECT
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "filial cria seus pedidos" ON public.pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (((filial_id = public.minha_filial_id()) AND (public.meu_papel() = 'filial'::public.papel_usuario)));

CREATE POLICY "filial le seus pedidos" ON public.pedidos
  FOR SELECT
  TO authenticated
  USING ((filial_id = public.minha_filial_id()));

CREATE TABLE public.produtos (
  id             text                     DEFAULT (gen_random_uuid())::text NOT NULL,
  codigo         text,
  nome           text                     NOT NULL,
  categoria      text                     NOT NULL,
  quantidade     integer                  DEFAULT 0 NOT NULL,
  estoque_minimo integer                  DEFAULT 0 NOT NULL,
  unidade        text                     NOT NULL,
  ativo          boolean                  DEFAULT true NOT NULL,
  criado_em      timestamp with time zone DEFAULT now() NOT NULL,
  atualizado_em  timestamp with time zone DEFAULT now() NOT NULL,
  arquivado_em   timestamp with time zone
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_filiais, TABLE public.movimentacoes, TABLE public.pedido_itens, TABLE public.pedidos, TABLE public.produtos;

ALTER TABLE public.produtos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.produtos
  REPLICA IDENTITY FULL;

ALTER TABLE public.produtos
  ADD CONSTRAINT produtos_pkey PRIMARY KEY (id);

ALTER TABLE public.estoque_filiais
  ADD CONSTRAINT estoque_filiais_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);

ALTER TABLE public.movimentacoes
  ADD CONSTRAINT movimentacoes_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);

ALTER TABLE public.pedido_itens
  ADD CONSTRAINT pedido_itens_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.produtos(id);

ALTER TABLE public.produtos
  ADD CONSTRAINT produtos_quantidade_check CHECK (quantidade >= 0);

GRANT ALL ON public.produtos TO authenticated;

GRANT ALL ON public.produtos TO service_role;

CREATE POLICY "Alteração pública temporária" ON public.produtos
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cd administra produtos" ON public.produtos
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "usuarios autenticados leem produtos" ON public.produtos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE public.usuarios (
  id        uuid                     NOT NULL,
  nome      text                     DEFAULT ''::text NOT NULL,
  papel     public.papel_usuario     DEFAULT 'filial'::public.papel_usuario NOT NULL,
  filial_id text,
  criado_em timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.usuarios
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuario_filial_obrigatoria CHECK (papel = 'cd_admin'::public.papel_usuario AND filial_id IS NULL OR papel = 'filial'::public.papel_usuario AND filial_id IS
    NOT NULL);

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_filial_id_fkey FOREIGN KEY (filial_id) REFERENCES public.filiais(id);

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);

GRANT ALL ON public.usuarios TO authenticated;

GRANT ALL ON public.usuarios TO service_role;

CREATE POLICY "cd gerencia perfis" ON public.usuarios
  TO authenticated
  USING ((public.meu_papel() = 'cd_admin'::public.papel_usuario))
  WITH CHECK ((public.meu_papel() = 'cd_admin'::public.papel_usuario));

CREATE POLICY "usuario le o proprio perfil" ON public.usuarios
  FOR SELECT
  TO authenticated
  USING ((id = auth.uid()));
