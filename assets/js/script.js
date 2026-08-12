const STORAGE_KEY = "therapeutica-estoque-v4";
const LEGACY_PRODUCTS_KEY = "produtos-therapeutica";
const LEGACY_MOVEMENTS_KEY = "movimentacoes-therapeutica";
const LEGACY_STORAGE_KEYS = ["therapeutica-estoque-v3"];
const CENTRO_DISTRIBUICAO_ID = "cd";
const NAVEGACAO_STORAGE_KEY = "therapeutica-navegacao-atual";
let clienteSupabase = null;
let usuarioAtual = null;
let perfilAtual = null;
let idsPedidosRemotos = new Set();
let usuarios = [];
let estadoSincronizado = null;

function conectarSupabase() {
    if (!window.supabase?.createClient) return false;

    clienteSupabase = obterClienteSupabase();
    return Boolean(clienteSupabase);
}
const FILIAIS_PADRAO = [
    { id: "matriz", nome: "Sorriso", cidade: "Sorriso, MT" },
    { id: "blumenau", nome: "Blumenau", cidade: "Blumenau, SC" },
    { id: "lucas", nome: "Lucas", cidade: "Lucas do Rio Verde, MT" },
    { id: "sinop", nome: "Sinop", cidade: "Sinop, MT" }
];
const titulosPaginas = {
    dashboard: "Dashboard",
    produtos: "Produtos",
    movimentacao: "Movimentação",
    "estoque-baixo": "Estoque baixo",
    pedidos: "Pedidos",
    "portal-filial": "Portal da filial",
    "novo-pedido-filial": "Novo pedido",
    "meus-pedidos": "Meus pedidos",
    filiais: "Filiais",
    historico: "Histórico",
    usuarios: "Usuários",
    configuracoes: "Configurações"
};
const elementos = {
    navegacao: [...document.querySelectorAll(".item-menu")],
    paginas: [...document.querySelectorAll(".pagina")],
    menuMatriz: document.querySelector("#menu-matriz"),
    menuFilial: document.querySelector("#menu-filial"),
    seletorPortal: document.querySelector("#seletor-portal"),
    contextoPortal: document.querySelector("#contexto-portal"),
    tituloPagina: document.querySelector("#titulo-pagina"),
    toast: document.querySelector("#toast"),
    indicadorProdutos: document.querySelector("#indicador-produtos"),
    indicadorUnidades: document.querySelector("#indicador-unidades"),
    indicadorEstoqueBaixo: document.querySelector("#indicador-estoque-baixo"),
    indicadorPedidos: document.querySelector("#indicador-pedidos"),
    dashboardMovimentacoes: document.querySelector("#dashboard-movimentacoes"),
    dashboardAlertas: document.querySelector("#dashboard-alertas"),
    buscaProdutos: document.querySelector("#busca-produtos"),
    filtroCategoria: document.querySelector("#filtro-categoria"),
    tabelaProdutos: document.querySelector("#tabela-produtos"),
    tabelaEstoqueBaixo: document.querySelector("#tabela-estoque-baixo"),
    tabelaPedidos: document.querySelector("#tabela-pedidos"),
    filtroStatusPedidos: document.querySelector("#filtro-status-pedidos"),
    notificacaoPedidos: document.querySelector("#notificacao-pedidos"),
    listaFiliais: document.querySelector("#lista-filiais"),
    buscaHistorico: document.querySelector("#busca-historico"),
    filtroHistorico: document.querySelector("#filtro-historico"),
    tabelaHistorico: document.querySelector("#tabela-historico"),
    tabelaUsuarios: document.querySelector("#tabela-usuarios"),
    movimentoTitulo: document.querySelector("#movimentacao-titulo"),
    movimentoSubtitulo: document.querySelector("#movimentacao-subtitulo"),
    movimentoDescricao: document.querySelector("#movimentacao-descricao"),
    formularioMovimentacao: document.querySelector("#formulario-movimentacao"),
    campoMovimentoXml: document.querySelector("#campo-movimento-xml"),
    movimentoXml: document.querySelector("#movimento-xml"),
    botaoRemoverXml: document.querySelector("#botao-remover-xml"),
    campoItemXml: document.querySelector("#campo-item-xml"),
    movimentoItemXml: document.querySelector("#movimento-item-xml"),
    mensagemXml: document.querySelector("#mensagem-xml"),
    botaoCadastrarProdutoXml: document.querySelector("#botao-cadastrar-produto-xml"),
    movimentoProduto: document.querySelector("#movimento-produto"),
    movimentoQuantidade: document.querySelector("#movimento-quantidade"),
    campoMovimentoFilial: document.querySelector("#campo-movimento-filial"),
    movimentoFilial: document.querySelector("#movimento-filial"),
    movimentoObservacao: document.querySelector("#movimento-observacao"),
    infoProdutoMovimento: document.querySelector("#info-produto-movimento"),
    mensagemMovimentacao: document.querySelector("#mensagem-movimentacao"),
    botaoConfirmarMovimento: document.querySelector("#botao-confirmar-movimento"),
    modalProduto: document.querySelector("#modal-produto"),
    formularioProduto: document.querySelector("#formulario-produto"),
    tituloModalProduto: document.querySelector("#titulo-modal-produto"),
    mensagemProduto: document.querySelector("#mensagem-produto"),
    produtoId: document.querySelector("#produto-id"),
    produtoCodigo: document.querySelector("#produto-codigo"),
    produtoNome: document.querySelector("#produto-nome"),
    produtoCategoria: document.querySelector("#produto-categoria"),
    produtoQuantidade: document.querySelector("#produto-quantidade"),
    produtoMinimo: document.querySelector("#produto-minimo"),
    produtoUnidade: document.querySelector("#produto-unidade"),
    ajudaQuantidadeProduto: document.querySelector("#ajuda-quantidade-produto"),
    modalPedido: document.querySelector("#modal-pedido"),
    formularioPedido: document.querySelector("#formulario-pedido"),
    mensagemPedido: document.querySelector("#mensagem-pedido"),
    pedidoFilial: document.querySelector("#pedido-filial"),
    pedidoProduto: document.querySelector("#pedido-produto"),
    pedidoEstoqueAtual: document.querySelector("#pedido-estoque-atual"),
    pedidoQuantidade: document.querySelector("#pedido-quantidade"),
    pedidoObservacao: document.querySelector("#pedido-observacao"),
    modalEntrega: document.querySelector("#modal-entrega"),
    formularioEntrega: document.querySelector("#formulario-entrega"),
    tituloModalEntrega: document.querySelector("#titulo-modal-entrega"),
    entregaPedidoId: document.querySelector("#entrega-pedido-id"),
    entregaModo: document.querySelector("#entrega-modo"),
    entregaResumo: document.querySelector("#entrega-resumo"),
    campoEntregaQuantidade: document.querySelector("#campo-entrega-quantidade"),
    entregaQuantidade: document.querySelector("#entrega-quantidade"),
    ajudaEntregaQuantidade: document.querySelector("#ajuda-entrega-quantidade"),
    entregaDia: document.querySelector("#entrega-dia"),
    entregaMes: document.querySelector("#entrega-mes"),
    entregaAno: document.querySelector("#entrega-ano"),
    mensagemEntrega: document.querySelector("#mensagem-entrega"),
    botaoConfirmarData: document.querySelector("#botao-confirmar-data"),
    modalAnalisarPedido: document.querySelector("#modal-analisar-pedido"),
    tituloModalAnalisarPedido: document.querySelector("#titulo-modal-analisar-pedido"),
    listaAnalisarPedido: document.querySelector("#lista-analisar-pedido"),
    botaoSair: document.querySelector("#botao-sair"),
    botaoExportar: document.querySelector("#botao-exportar"),
    arquivoImportar: document.querySelector("#arquivo-importar"),
    botaoDadosDemo: document.querySelector("#botao-dados-demo"),
    botaoLimparDados: document.querySelector("#botao-limpar-dados"),
    tituloPortalFilial: document.querySelector("#titulo-portal-filial"),
    indicadorFilialPedidos: document.querySelector("#indicador-filial-pedidos"),
    formularioItemPedido: document.querySelector("#formulario-item-pedido"),
    itemPedidoProduto: document.querySelector("#item-pedido-produto"),
    itemPedidoEstoque: document.querySelector("#item-pedido-estoque"),
    itemPedidoQuantidade: document.querySelector("#item-pedido-quantidade"),
    itemPedidoObservacao: document.querySelector("#item-pedido-observacao"),
    mensagemItemPedido: document.querySelector("#mensagem-item-pedido"),
    itensCarrinhoPedido: document.querySelector("#itens-carrinho-pedido"),
    quantidadeItensCarrinho: document.querySelector("#quantidade-itens-carrinho"),
    observacaoPedidoCompleto: document.querySelector("#observacao-pedido-completo"),
    mensagemPedidoFilial: document.querySelector("#mensagem-pedido-filial"),
    botaoLimparCarrinho: document.querySelector("#botao-limpar-carrinho"),
    botaoEnviarPedidoLista: document.querySelector("#botao-enviar-pedido-lista"),
    listaMeusPedidos: document.querySelector("#lista-meus-pedidos"),
    filtroStatusMeusPedidos: document.querySelector("#filtro-status-meus-pedidos"),
    modalUsuario: document.querySelector("#modal-usuario"),
    formularioUsuario: document.querySelector("#formulario-usuario"),
    usuarioId: document.querySelector("#usuario-id"),
    usuarioEmail: document.querySelector("#usuario-email"),
    usuarioNome: document.querySelector("#usuario-nome"),
    usuarioPapel: document.querySelector("#usuario-papel"),
    usuarioFilial: document.querySelector("#usuario-filial"),
    mensagemUsuario: document.querySelector("#mensagem-usuario"),
    modalEstoqueFilial: document.querySelector("#modal-estoque-filial"),
    tituloModalEstoqueFilial: document.querySelector("#titulo-modal-estoque-filial"),
    tabelaModalEstoqueFilial: document.querySelector("#tabela-modal-estoque-filial"),
    modalDetalhesPedido: document.querySelector("#modal-detalhes-pedido"),
    tituloModalDetalhesPedido: document.querySelector("#titulo-modal-detalhes-pedido"),
    resumoDetalhesPedido: document.querySelector("#resumo-detalhes-pedido"),
    listaDetalhesPedido: document.querySelector("#lista-detalhes-pedido")
};

let paginaAtual = "dashboard";
let tipoMovimentacaoAtual = "entrada";
let produtoSelecionadoMovimentacao = "";
let itensXmlMovimentacao = [];
let indiceItemXmlSelecionado = null;
let itensSelecionadosPedido = [];
let pedidoEmAnaliseId = "";
let portalAtual = CENTRO_DISTRIBUICAO_ID;
let itensDoPedidoAtual = [];
let temporizadorToast;
let estado = carregarEstado();
let filaSincronizacao = Promise.resolve();

function usuarioEhCD() {
    return perfilAtual?.papel === "cd_admin";
}

function salvarNavegacaoAtual() {
    if (!perfilAtual) return;
    localStorage.setItem(NAVEGACAO_STORAGE_KEY, JSON.stringify({
        pagina: paginaAtual,
        portal: portalAtual,
        tipoMovimentacao: tipoMovimentacaoAtual
    }));
}

function recuperarNavegacaoAtual() {
    try {
        const navegacao = JSON.parse(localStorage.getItem(NAVEGACAO_STORAGE_KEY) || "null");
        return navegacao && typeof navegacao === "object" ? navegacao : null;
    } catch {
        return null;
    }
}

function aplicarPermissoesDoUsuario() {
    if (!perfilAtual) return;
    if (usuarioEhCD()) {
        portalAtual = CENTRO_DISTRIBUICAO_ID;
        elementos.seletorPortal.disabled = false;
        return;
    }
    portalAtual = perfilAtual.filial_id;
    elementos.seletorPortal.value = portalAtual;
    elementos.seletorPortal.disabled = true;
}

function gerarId(prefixo) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `${prefixo}-${crypto.randomUUID()}`;
    }

    return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function numeroInteiroNaoNegativo(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? Math.max(0, Math.floor(numero)) : 0;
}

function lerJSON(chave, valorPadrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : valorPadrao;
    } catch {
        return valorPadrao;
    }
}

function estadoPadrao() {
    return {
        versao: 4,
        produtos: [],
        movimentacoes: [],
        pedidos: [],
        filiais: FILIAIS_PADRAO.map((filial) => ({ ...filial })),
        estoqueFiliais: {},
        atualizadoEm: new Date().toISOString()
    };
}

function criarEstadoDemo() {
    const agora = new Date().toISOString();
    const produtos = [
        ["prod-001", "MED-001", "Dipirona 500mg", "Medicamentos", 186, 40, "Caixa"],
        ["prod-002", "MED-002", "Paracetamol 750mg", "Medicamentos", 142, 35, "Caixa"],
        ["prod-003", "MED-003", "Ibuprofeno 600mg", "Medicamentos", 78, 25, "Caixa"],
        ["prod-004", "MED-004", "Loratadina 10mg", "Medicamentos", 34, 30, "Caixa"],
        ["prod-005", "MED-005", "Omeprazol 20mg", "Medicamentos", 18, 28, "Caixa"],
        ["prod-006", "DER-001", "Protetor solar FPS 50", "Dermocosméticos", 64, 18, "Unidade"],
        ["prod-007", "DER-002", "Hidratante corporal 200ml", "Dermocosméticos", 51, 20, "Unidade"],
        ["prod-008", "DER-003", "Sabonete facial", "Dermocosméticos", 22, 16, "Unidade"],
        ["prod-009", "DER-004", "Shampoo terapêutico", "Dermocosméticos", 39, 14, "Unidade"],
        ["prod-010", "DER-005", "Pomada reparadora", "Dermocosméticos", 12, 18, "Unidade"],
        ["prod-011", "INS-001", "Álcool 70% 1L", "Insumos", 96, 30, "Frasco"],
        ["prod-012", "INS-002", "Luvas descartáveis P", "Insumos", 48, 20, "Caixa"],
        ["prod-013", "INS-003", "Luvas descartáveis M", "Insumos", 62, 20, "Caixa"],
        ["prod-014", "INS-004", "Máscara cirúrgica", "Insumos", 27, 25, "Caixa"],
        ["prod-015", "INS-005", "Seringa 5ml", "Insumos", 320, 80, "Unidade"],
        ["prod-016", "EMB-001", "Sacola P Therapeutica", "Embalagens", 740, 160, "Unidade"],
        ["prod-017", "EMB-002", "Sacola M Therapeutica", "Embalagens", 420, 120, "Unidade"],
        ["prod-018", "EMB-003", "Etiqueta térmica", "Embalagens", 980, 260, "Unidade"],
        ["prod-019", "EMB-004", "Envelope delivery", "Embalagens", 115, 100, "Unidade"],
        ["prod-020", "HIG-001", "Lenço umedecido", "Higiene", 44, 22, "Pacote"],
        ["prod-021", "HIG-002", "Algodão 100g", "Higiene", 59, 24, "Pacote"],
        ["prod-022", "HIG-003", "Hastes flexíveis", "Higiene", 31, 18, "Caixa"],
        ["prod-023", "SUP-001", "Papel A4", "Administrativo", 21, 12, "Resma"],
        ["prod-024", "SUP-002", "Bobina térmica", "Administrativo", 36, 18, "Unidade"],
        ["prod-025", "SUP-003", "Caneta azul", "Administrativo", 108, 30, "Unidade"],
        ["prod-026", "MED-006", "Soro fisiológico 500ml", "Medicamentos", 8, 20, "Frasco"],
        ["prod-027", "MED-007", "Vitamina C 1g", "Medicamentos", 54, 20, "Caixa"],
        ["prod-028", "DER-006", "Água micelar 200ml", "Dermocosméticos", 16, 16, "Unidade"],
        ["prod-029", "INS-006", "Gaze esterilizada", "Insumos", 19, 24, "Pacote"],
        ["prod-030", "EMB-005", "Caixa presente P", "Embalagens", 68, 32, "Unidade"]
    ].map(([id, codigo, nome, categoria, quantidade, estoqueMinimo, unidade]) => ({
        id,
        codigo,
        nome,
        categoria,
        quantidade,
        estoqueMinimo,
        unidade,
        ativo: true,
        criadoEm: "2026-07-01T09:00:00.000Z",
        atualizadoEm: agora,
        arquivadoEm: null
    }));

    const produtoPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    const movimento = (id, produtoId, tipo, quantidade, saldoAntes, saldoDepois, observacao, criadoEm, filialId = "", pedidoId = "") => {
        const produto = produtoPorId.get(produtoId);
        return {
            id,
            produtoId,
            produtoNome: produto?.nome || "Produto não identificado",
            tipo,
            quantidade,
            unidade: produto?.unidade || "Unidade",
            saldoAntes,
            saldoDepois,
            observacao,
            filialId,
            pedidoId,
            criadoEm
        };
    };

    return {
        versao: 4,
        produtos,
        movimentacoes: [
            movimento("mov-001", "prod-001", "entrada", 120, 66, 186, "Compra mensal para recompor o CD.", "2026-07-21T10:10:00.000Z"),
            movimento("mov-002", "prod-011", "entrada", 48, 48, 96, "Recebimento fornecedor Blumenpack.", "2026-07-21T11:20:00.000Z"),
            movimento("mov-003", "prod-006", "saida", 12, 76, 64, "Separação para uso interno do CD.", "2026-07-21T14:35:00.000Z"),
            movimento("mov-004", "prod-026", "saida", 14, 22, 8, "Uso interno e perdas registradas.", "2026-07-20T16:00:00.000Z"),
            movimento("mov-005", "prod-016", "entrada", 500, 240, 740, "Reposição de sacolas personalizadas.", "2026-07-19T09:45:00.000Z"),
            movimento("mov-006", "prod-003", "transferencia", 18, 96, 78, "Pedido aprovado e transferência registrada.", "2026-07-18T15:30:00.000Z", "blumenau", "ped-003"),
            movimento("mov-007", "prod-018", "transferencia", 140, 1120, 980, "Pedido aprovado e transferência registrada.", "2026-07-18T15:31:00.000Z", "blumenau", "ped-003"),
            movimento("mov-008", "prod-017", "transferencia", 80, 500, 420, "Pedido aprovado e transferência registrada.", "2026-07-17T10:05:00.000Z", "sinop", "ped-004"),
            movimento("mov-009", "prod-024", "saida", 6, 42, 36, "Consumo administrativo do CD.", "2026-07-16T13:00:00.000Z"),
            movimento("mov-010", "prod-029", "saida", 9, 28, 19, "Baixa por uso em atendimento.", "2026-07-15T17:25:00.000Z")
        ],
        pedidos: [
            {
                id: "ped-001",
                filialId: "blumenau",
                itens: [
                    { produtoId: "prod-005", produtoNome: "Omeprazol 20mg", unidade: "Caixa", estoqueInformado: 4, quantidadeSolicitada: 24, observacao: "Alta saída nos últimos dias." },
                    { produtoId: "prod-010", produtoNome: "Pomada reparadora", unidade: "Unidade", estoqueInformado: 2, quantidadeSolicitada: 16, observacao: "Reposição de balcão." },
                    { produtoId: "prod-029", produtoNome: "Gaze esterilizada", unidade: "Pacote", estoqueInformado: 3, quantidadeSolicitada: 30, observacao: "Atendimento semanal." }
                ],
                observacao: "Pedido semanal da filial Blumenau.",
                observacaoMatriz: "",
                situacao: "pendente",
                criadoEm: "2026-07-22T08:40:00.000Z",
                analisadoEm: null
            },
            {
                id: "ped-002",
                filialId: "lucas",
                itens: [
                    { produtoId: "prod-026", produtoNome: "Soro fisiológico 500ml", unidade: "Frasco", estoqueInformado: 1, quantidadeSolicitada: 28, observacao: "CD está com pouco saldo." },
                    { produtoId: "prod-014", produtoNome: "Máscara cirúrgica", unidade: "Caixa", estoqueInformado: 5, quantidadeSolicitada: 20, observacao: "" }
                ],
                observacao: "Priorizar assim que houver compra.",
                observacaoMatriz: "Aguardando compra. Chegada prevista no CD: 24/07/2026.",
                situacao: "aguardando_compra",
                compraPrevista: "2026-07-24",
                compraRecebidaEm: null,
                criadoEm: "2026-07-21T15:10:00.000Z",
                analisadoEm: "2026-07-21T17:05:00.000Z"
            },
            {
                id: "ped-003",
                filialId: "blumenau",
                itens: [
                    { produtoId: "prod-003", produtoNome: "Ibuprofeno 600mg", unidade: "Caixa", estoqueInformado: 8, quantidadeSolicitada: 18, observacao: "" },
                    { produtoId: "prod-018", produtoNome: "Etiqueta térmica", unidade: "Unidade", estoqueInformado: 60, quantidadeSolicitada: 140, observacao: "Impressora nova da filial." }
                ],
                observacao: "Pedido emergencial aprovado.",
                observacaoMatriz: "Pedido aprovado. Entrega prevista: 23/07/2026.",
                situacao: "em_transito",
                entregaPrevista: "2026-07-23",
                recebidoEm: null,
                criadoEm: "2026-07-18T09:15:00.000Z",
                analisadoEm: "2026-07-18T15:30:00.000Z"
            },
            {
                id: "ped-004",
                filialId: "sinop",
                itens: [
                    { produtoId: "prod-017", produtoNome: "Sacola M Therapeutica", unidade: "Unidade", estoqueInformado: 25, quantidadeSolicitada: 80, observacao: "Reposição para campanha local." }
                ],
                observacao: "Pedido aprovado.",
                observacaoMatriz: "Pedido aprovado e recebido pela filial.",
                situacao: "recebido",
                entregaPrevista: "2026-07-19",
                recebidoEm: "2026-07-19T11:30:00.000Z",
                criadoEm: "2026-07-17T08:50:00.000Z",
                analisadoEm: "2026-07-17T10:05:00.000Z"
            },
            {
                id: "ped-005",
                filialId: "lucas",
                itens: [
                    { produtoId: "prod-023", produtoNome: "Papel A4", unidade: "Resma", estoqueInformado: 3, quantidadeSolicitada: 18, observacao: "Solicitação acima da média." }
                ],
                observacao: "Compra administrativa.",
                observacaoMatriz: "Recusado: manter compra local de material administrativo neste ciclo.",
                situacao: "recusado",
                criadoEm: "2026-07-15T10:25:00.000Z",
                analisadoEm: "2026-07-15T16:00:00.000Z"
            },
            {
                id: "ped-006",
                filialId: "sinop",
                itens: [
                    { produtoId: "prod-006", produtoNome: "Protetor solar FPS 50", unidade: "Unidade", estoqueInformado: 7, quantidadeSolicitada: 22, observacao: "Reposição para frente de loja." },
                    { produtoId: "prod-027", produtoNome: "Vitamina C 1g", unidade: "Caixa", estoqueInformado: 9, quantidadeSolicitada: 30, observacao: "" },
                    { produtoId: "prod-030", produtoNome: "Caixa presente P", unidade: "Unidade", estoqueInformado: 12, quantidadeSolicitada: 40, observacao: "Campanha de kits." }
                ],
                observacao: "Pedido de fim de semana.",
                observacaoMatriz: "",
                situacao: "pendente",
                criadoEm: "2026-07-22T11:05:00.000Z",
                analisadoEm: null
            }
        ],
        filiais: FILIAIS_PADRAO.map((filial) => ({ ...filial })),
        estoqueFiliais: {
            "blumenau:prod-001": { quantidade: 34, atualizadoEm: "2026-07-20T10:00:00.000Z" },
            "blumenau:prod-003": { quantidade: 8, atualizadoEm: "2026-07-18T09:15:00.000Z" },
            "blumenau:prod-005": { quantidade: 4, atualizadoEm: "2026-07-22T08:40:00.000Z" },
            "blumenau:prod-010": { quantidade: 2, atualizadoEm: "2026-07-22T08:40:00.000Z" },
            "blumenau:prod-018": { quantidade: 60, atualizadoEm: "2026-07-18T09:15:00.000Z" },
            "blumenau:prod-029": { quantidade: 3, atualizadoEm: "2026-07-22T08:40:00.000Z" },
            "lucas:prod-002": { quantidade: 28, atualizadoEm: "2026-07-19T09:30:00.000Z" },
            "lucas:prod-014": { quantidade: 5, atualizadoEm: "2026-07-21T15:10:00.000Z" },
            "lucas:prod-023": { quantidade: 3, atualizadoEm: "2026-07-15T10:25:00.000Z" },
            "lucas:prod-026": { quantidade: 1, atualizadoEm: "2026-07-21T15:10:00.000Z" },
            "lucas:prod-028": { quantidade: 11, atualizadoEm: "2026-07-18T13:40:00.000Z" },
            "sinop:prod-006": { quantidade: 7, atualizadoEm: "2026-07-22T11:05:00.000Z" },
            "sinop:prod-009": { quantidade: 13, atualizadoEm: "2026-07-17T14:20:00.000Z" },
            "sinop:prod-017": { quantidade: 105, atualizadoEm: "2026-07-17T10:05:00.000Z" },
            "sinop:prod-027": { quantidade: 9, atualizadoEm: "2026-07-22T11:05:00.000Z" },
            "sinop:prod-030": { quantidade: 12, atualizadoEm: "2026-07-22T11:05:00.000Z" }
        },
        atualizadoEm: agora
    };
}

function normalizarTipoMovimentacao(tipo) {
    const texto = String(tipo || "ajuste")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (texto.includes("entrada")) return "entrada";
    if (texto.includes("saida")) return "saida";
    if (texto.includes("transfer")) return "transferencia";
    return "ajuste";
}

function normalizarProduto(produto) {
    const nome = String(produto?.name ?? produto?.nome ?? "").trim();

    return {
        id: String(produto?.id || gerarId("prod")),
        codigo: String(produto?.codigo ?? produto?.code ?? "").trim(),
        nome,
        categoria: String(produto?.categoria ?? produto?.category ?? "Outros").trim() || "Outros",
        quantidade: numeroInteiroNaoNegativo(produto?.quantidade ?? produto?.quantity),
        estoqueMinimo: numeroInteiroNaoNegativo(produto?.estoqueMinimo ?? produto?.minStock),
        unidade: String(produto?.unidade ?? produto?.unit ?? "Unidade").trim() || "Unidade",
        ativo: produto?.ativo !== false && produto?.active !== false,
        criadoEm: produto?.criadoEm ?? produto?.createdAt ?? new Date().toISOString(),
        atualizadoEm: produto?.atualizadoEm ?? produto?.updatedAt ?? new Date().toISOString(),
        arquivadoEm: produto?.arquivadoEm ?? null
    };
}

function normalizarMovimentacao(movimentacao) {
    return {
        id: String(movimentacao?.id || gerarId("mov")),
        produtoId: String(movimentacao?.produtoId ?? movimentacao?.productId ?? ""),
        produtoNome: String(movimentacao?.produtoNome ?? movimentacao?.produto ?? movimentacao?.productName ?? "Produto não identificado"),
        tipo: normalizarTipoMovimentacao(movimentacao?.tipo ?? movimentacao?.type),
        quantidade: numeroInteiroNaoNegativo(movimentacao?.quantidade ?? movimentacao?.quantity),
        unidade: String(movimentacao?.unidade ?? movimentacao?.unit ?? "Unidade"),
        saldoAntes: movimentacao?.saldoAntes ?? movimentacao?.balanceBefore ?? null,
        saldoDepois: movimentacao?.saldoDepois ?? movimentacao?.balanceAfter ?? null,
        observacao: String(movimentacao?.observacao ?? movimentacao?.note ?? ""),
        filialId: String(movimentacao?.filialId ?? ""),
        pedidoId: String(movimentacao?.pedidoId ?? ""),
        criadoEm: movimentacao?.criadoEm ?? movimentacao?.data ?? movimentacao?.createdAt ?? new Date().toISOString()
    };
}

function normalizarPedido(pedido) {
    const situacoesValidas = ["pendente", "aguardando_compra", "em_transito", "recebido", "aprovado", "recusado"];
    const statusRecebido = pedido?.situacao ?? pedido?.status;
    const situacao = situacoesValidas.includes(statusRecebido)
        ? (statusRecebido === "aprovado" ? "recebido" : statusRecebido)
        : "pendente";

    const itensRecebidos = Array.isArray(pedido?.itens) ? pedido.itens : [pedido];
    const itens = itensRecebidos
        .map((item) => ({
            produtoId: String(item?.produtoId ?? item?.productId ?? pedido?.produtoId ?? ""),
            produtoNome: String(item?.produtoNome ?? item?.productName ?? pedido?.produtoNome ?? pedido?.productName ?? "Produto não identificado"),
            unidade: String(item?.unidade ?? item?.unit ?? pedido?.unidade ?? pedido?.unit ?? "Unidade"),
            estoqueInformado: numeroInteiroNaoNegativo(item?.estoqueInformado ?? item?.reportedStock ?? pedido?.estoqueInformado ?? pedido?.reportedStock),
            quantidadeSolicitada: numeroInteiroNaoNegativo(item?.quantidadeSolicitada ?? item?.requestedQuantity ?? pedido?.quantidadeSolicitada ?? pedido?.requestedQuantity),
            observacao: String(item?.observacao ?? item?.note ?? ""),
            situacao: situacoesValidas.includes(item?.situacao) ? item.situacao : situacao,
            observacaoMatriz: String(item?.observacaoMatriz ?? "")
        }))
        .filter((item) => item.produtoId || item.produtoNome !== "Produto não identificado");

    return {
        id: String(pedido?.id || gerarId("ped")),
        filialId: String(pedido?.filialId ?? ""),
        itens,
        observacao: String(pedido?.observacao ?? pedido?.note ?? ""),
        observacaoMatriz: String(pedido?.observacaoMatriz ?? pedido?.managerNote ?? ""),
        situacao,
        compraPrevista: pedido?.compraPrevista ?? pedido?.purchaseExpectedAt ?? "",
        compraRecebidaEm: pedido?.compraRecebidaEm ?? pedido?.purchaseReceivedAt ?? null,
        entregaPrevista: pedido?.entregaPrevista ?? pedido?.deliveryDate ?? "",
        recebidoEm: pedido?.recebidoEm ?? pedido?.receivedAt ?? null,
        criadoEm: pedido?.criadoEm ?? pedido?.createdAt ?? new Date().toISOString(),
        analisadoEm: pedido?.analisadoEm ?? pedido?.handledAt ?? null
    };
}

function normalizarFilial(filial) {
    const dados = filial && typeof filial === "object" ? filial : {};
    if (dados.id === "matriz") {
        return { ...dados, nome: "Sorriso", cidade: "Sorriso, MT" };
    }
    return dados;
}

function normalizarEstado(dados) {
    const base = estadoPadrao();
    const fonte = dados && typeof dados === "object" ? dados : {};
    const produtos = Array.isArray(fonte.produtos) ? fonte.produtos : [];
    const movimentacoes = Array.isArray(fonte.movimentacoes) ? fonte.movimentacoes : [];
    const pedidos = Array.isArray(fonte.pedidos) ? fonte.pedidos : [];
    const filiaisRecebidas = Array.isArray(fonte.filiais) ? fonte.filiais : [];
    const filiaisPorId = new Map(filiaisRecebidas.map((filial) => [String(filial.id), filial]));

    base.produtos = produtos.map(normalizarProduto).filter((produto) => produto.nome);
    base.movimentacoes = movimentacoes.map(normalizarMovimentacao);
    base.pedidos = pedidos.map(normalizarPedido);
    base.filiais = FILIAIS_PADRAO.map((filial) => normalizarFilial({ ...filial, ...filiaisPorId.get(filial.id) }));
    base.estoqueFiliais = fonte.estoqueFiliais && typeof fonte.estoqueFiliais === "object"
        ? fonte.estoqueFiliais
        : {};
    base.demoDesativado = fonte.demoDesativado === true;
    base.atualizadoEm = fonte.atualizadoEm ?? new Date().toISOString();

    return base;
}

function carregarEstado() {
    const salvo = lerJSON(STORAGE_KEY, null);

    if (salvo) {
        const normalizado = normalizarEstado(salvo);
        const vazio = normalizado.produtos.length === 0
            && normalizado.movimentacoes.length === 0
            && normalizado.pedidos.length === 0
            && salvo.demoDesativado !== true;

        if (vazio) {
            const demo = criarEstadoDemo();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
            return demo;
        }

        return normalizado;
    }

    const estadoAnterior = LEGACY_STORAGE_KEYS.map((chave) => lerJSON(chave, null)).find(Boolean);
    if (estadoAnterior) {
        const migrado = normalizarEstado(estadoAnterior);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrado));
        return migrado;
    }

    const produtosAntigos = lerJSON(LEGACY_PRODUCTS_KEY, []);
    const movimentacoesAntigas = lerJSON(LEGACY_MOVEMENTS_KEY, []);
    const temDadosAntigos = (Array.isArray(produtosAntigos) && produtosAntigos.length > 0)
        || (Array.isArray(movimentacoesAntigas) && movimentacoesAntigas.length > 0);
    const migrado = temDadosAntigos ? normalizarEstado({
        produtos: Array.isArray(produtosAntigos) ? produtosAntigos : [],
        movimentacoes: Array.isArray(movimentacoesAntigas) ? movimentacoesAntigas : []
    }) : criarEstadoDemo();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrado));
    return migrado;
}

function salvarEstado() {
    estado.atualizadoEm = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    if (!clienteSupabase) {
        notificar("Supabase indisponível. Os dados continuam salvos neste navegador.", "erro");
        return Promise.resolve();
    }
    filaSincronizacao = filaSincronizacao
        .catch(() => undefined)
        .then(sincronizarEstadoNoSupabase)
        .catch((error) => {
            console.error(error);
            notificar("Nao foi possivel salvar os dados no Supabase.", "erro");
        });
    return filaSincronizacao;
}

async function gravarTabela(tabela, registros) {
    if (!registros.length) return;
    const { error } = await clienteSupabase.from(tabela).upsert(registros);
    if (error) throw error;
}

function produtoParaBanco(p) {
    return { id: p.id, codigo: p.codigo, nome: p.nome, categoria: p.categoria, quantidade: p.quantidade, estoque_minimo: p.estoqueMinimo, unidade: p.unidade, ativo: p.ativo, criado_em: p.criadoEm, atualizado_em: p.atualizadoEm, arquivado_em: p.arquivadoEm || null };
}

async function sincronizarProdutos(produtos, produtosAnteriores) {
    const anteriores = new Map(produtosAnteriores.map((produto) => [produto.id, produto]));
    for (const produto of produtos) {
        const anterior = anteriores.get(produto.id);
        const registro = produtoParaBanco(produto);
        if (!anterior) {
            await gravarTabela("produtos", [registro]);
            continue;
        }
        const { data, error } = await clienteSupabase.from("produtos")
            .update(registro)
            .eq("id", produto.id)
            .eq("atualizado_em", anterior.atualizadoEm)
            .select("id");
        if (error) throw error;
        if (!data?.length) throw new Error("Conflito de atualização: este produto foi alterado por outro usuário. Recarregue a página antes de tentar novamente.");
    }
}

async function sincronizarEstoqueFiliais(registros, estoqueAnterior) {
    for (const registro of registros) {
        const chave = chaveEstoqueFilial(registro.filial_id, registro.produto_id);
        const anterior = estoqueAnterior[chave];
        if (!anterior) {
            await gravarTabela("estoque_filiais", [registro]);
            continue;
        }
        const { data, error } = await clienteSupabase.from("estoque_filiais")
            .update(registro)
            .eq("filial_id", registro.filial_id)
            .eq("produto_id", registro.produto_id)
            .eq("atualizado_em", anterior.atualizadoEm)
            .select("produto_id");
        if (error) throw error;
        if (!data?.length) throw new Error("Conflito de atualização: o estoque da filial foi alterado por outro usuário. Recarregue a página antes de tentar novamente.");
    }
}

async function sincronizarPedidos(pedidos, pedidosAnteriores) {
    const anteriores = new Map(pedidosAnteriores.map((pedido) => [pedido.id, pedido]));
    for (const pedido of pedidos) {
        const anterior = anteriores.get(pedido.id);
        if (!anterior) {
            await gravarTabela("pedidos", [pedidoParaBanco(pedido)]);
            continue;
        }
        const { data, error } = await clienteSupabase.from("pedidos")
            .update(pedidoParaBanco(pedido))
            .eq("id", pedido.id)
            .eq("atualizado_em", anterior.atualizadoEm)
            .select("id");
        if (error) throw error;
        if (!data?.length) throw new Error("Conflito de atualização: este pedido foi alterado por outro usuário. Recarregue a página antes de tentar novamente.");
    }
}

function pedidoParaBanco(pedido) {
    return { id: pedido.id, filial_id: pedido.filialId, observacao: pedido.observacao || "", observacao_matriz: pedido.observacaoMatriz || "", situacao: pedido.situacao, compra_prevista: pedido.compraPrevista || null, compra_recebida_em: pedido.compraRecebidaEm || null, entrega_prevista: pedido.entregaPrevista || null, recebido_em: pedido.recebidoEm || null, criado_em: pedido.criadoEm, analisado_em: pedido.analisadoEm || null, atualizado_em: pedido.atualizadoEm };
}

function itensParaBanco(pedidos) {
    return pedidos.flatMap((pedido) => itensDoPedido(pedido).map((item) => ({ pedido_id: pedido.id, produto_id: item.produtoId, estoque_informado: item.estoqueInformado, quantidade_solicitada: item.quantidadeSolicitada, quantidade_enviada: item.quantidadeEnviada || null, observacao: item.observacao || "", situacao: item.situacao || pedido.situacao || "pendente", observacao_matriz: item.observacaoMatriz || "", recebido_em: item.recebidoEm || null })));
}

async function sincronizarEstadoNoSupabase() {
    if (!perfilAtual) throw new Error("Sessão sem perfil de acesso.");
    if (!usuarioEhCD()) {
        const novos = estado.pedidos.filter((pedido) => pedido.filialId === perfilAtual.filial_id && !idsPedidosRemotos.has(pedido.id));
        await gravarTabela("pedidos", novos.map(pedidoParaBanco));
        await gravarTabela("pedido_itens", itensParaBanco(novos));
        novos.forEach((pedido) => idsPedidosRemotos.add(pedido.id));
        return;
    }
    const retrato = JSON.parse(JSON.stringify(estado));
    const anterior = estadoSincronizado || estadoPadrao();
    const alterados = (atuais, anteriores) => {
        const mapaAnterior = new Map(anteriores.map((item) => [item.id, item]));
        return atuais.filter((item) => JSON.stringify(item) !== JSON.stringify(mapaAnterior.get(item.id)));
    };
    const produtos = alterados(retrato.produtos, anterior.produtos);
    const pedidos = alterados(retrato.pedidos, anterior.pedidos);
    pedidos.forEach((pedido) => {
        pedido.atualizadoEm = new Date().toISOString();
        const local = estado.pedidos.find((item) => item.id === pedido.id);
        if (local) local.atualizadoEm = pedido.atualizadoEm;
    });
    const movimentacoes = alterados(retrato.movimentacoes, anterior.movimentacoes);
    const estoque = Object.entries(retrato.estoqueFiliais)
        .filter(([chave, valor]) => JSON.stringify(valor) !== JSON.stringify(anterior.estoqueFiliais[chave]))
        .map(([chave, valor]) => { const [filial_id, produto_id] = chave.split(":"); return { filial_id, produto_id, quantidade: valor.quantidade, atualizado_em: valor.atualizadoEm }; });
    await sincronizarProdutos(produtos, anterior.produtos);
    await sincronizarPedidos(pedidos, anterior.pedidos);
    await gravarTabela("pedido_itens", itensParaBanco(pedidos));
    await sincronizarEstoqueFiliais(estoque, anterior.estoqueFiliais);
    await gravarTabela("movimentacoes", movimentacoes.map((m) => ({ id: m.id, produto_id: m.produtoId, tipo: m.tipo, quantidade: m.quantidade, saldo_antes: m.saldoAntes, saldo_depois: m.saldoDepois, observacao: m.observacao || "", filial_id: m.filialId || null, pedido_id: m.pedidoId || null, criado_em: m.criadoEm })));
    estadoSincronizado = retrato;
}

async function carregarProdutosLegado() {
    const {data, error} = await clienteSupabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");

    if (error) {
        console.error(error);
        notificar("Não foi possível carregar os produtos do Supabase.", "erro");
        return;
    }

    estado.produtos = data.map((produto) => ({
        ...produto,
        estoqueMinimo: produto.estoque_minimo,
        criadoEm: produto.criado_em,
        atualizadoEm: produto.atualizado_em
    }));

    renderizarTudo();
}

function produtoDoBanco(produto) {
    return {
        id: produto.id, codigo: produto.codigo, nome: produto.nome, categoria: produto.categoria,
        quantidade: produto.quantidade, estoqueMinimo: produto.estoque_minimo, unidade: produto.unidade,
        ativo: produto.ativo, criadoEm: produto.criado_em, atualizadoEm: produto.atualizado_em,
        arquivadoEm: produto.arquivado_em
    };
}

async function carregarDadosSupabase() {
    if (!clienteSupabase) {
        notificar("Não foi possível carregar o Supabase. Verifique sua conexão e atualize a página.", "erro");
        return;
    }
    const [produtos, filiais, pedidos, estoques, movimentacoes] = await Promise.all([
        clienteSupabase.from("produtos").select("*").order("nome"),
        clienteSupabase.from("filiais").select("*").order("nome"),
        clienteSupabase.from("pedidos").select("*, itens:pedido_itens(*)").order("criado_em", { ascending: false }),
        clienteSupabase.from("estoque_filiais").select("*"),
        clienteSupabase.from("movimentacoes").select("*").order("criado_em", { ascending: false })
    ]);
    const erro = [produtos, filiais, pedidos, estoques, movimentacoes].find((resultado) => resultado.error)?.error;
    if (erro) {
        console.error(erro);
        notificar("Erro ao carregar os dados do Supabase. Execute o arquivo supabase-schema.sql no SQL Editor.", "erro");
        return;
    }

    const bancoEstaVazio = produtos.data.length === 0
        && pedidos.data.length === 0
        && estoques.data.length === 0
        && movimentacoes.data.length === 0;
    const haDadosLocais = estado.produtos.length > 0
        || estado.pedidos.length > 0
        || estado.movimentacoes.length > 0;

    if (bancoEstaVazio && haDadosLocais && usuarioEhCD()) {
        await salvarEstado();
        renderizarTudo();
        notificar("Estoque local migrado para o Supabase.");
        return;
    }

    const produtosPorId = new Map(produtos.data.map((produto) => [produto.id, produtoDoBanco(produto)]));
    estado = {
        ...estadoPadrao(),
        produtos: [...produtosPorId.values()],
        filiais: filiais.data.map((filial) => normalizarFilial({ id: filial.id, nome: filial.nome, cidade: filial.cidade })),
        pedidos: pedidos.data.map((pedido) => ({
            id: pedido.id, filialId: pedido.filial_id,
            itens: pedido.itens.map((item) => {
                const produto = produtosPorId.get(item.produto_id);
                return { produtoId: item.produto_id, produtoNome: produto?.nome || "Produto nao identificado", unidade: produto?.unidade || "Unidade", estoqueInformado: item.estoque_informado, quantidadeSolicitada: item.quantidade_solicitada, quantidadeEnviada: item.quantidade_enviada || null, observacao: item.observacao, situacao: item.situacao || pedido.situacao, observacaoMatriz: item.observacao_matriz || "", recebidoEm: item.recebido_em || null };
            }),
            observacao: pedido.observacao, observacaoMatriz: pedido.observacao_matriz, situacao: pedido.situacao,
            compraPrevista: pedido.compra_prevista || "", compraRecebidaEm: pedido.compra_recebida_em,
            entregaPrevista: pedido.entrega_prevista || "", recebidoEm: pedido.recebido_em,
            criadoEm: pedido.criado_em, analisadoEm: pedido.analisado_em, atualizadoEm: pedido.atualizado_em
        })),
        estoqueFiliais: Object.fromEntries(estoques.data.map((item) => [chaveEstoqueFilial(item.filial_id, item.produto_id), { quantidade: item.quantidade, atualizadoEm: item.atualizado_em }])),
        movimentacoes: movimentacoes.data.map((movimentacao) => {
            const produto = produtosPorId.get(movimentacao.produto_id);
            return { id: movimentacao.id, produtoId: movimentacao.produto_id, produtoNome: produto?.nome || "Produto nao identificado", tipo: movimentacao.tipo, quantidade: movimentacao.quantidade, unidade: produto?.unidade || "Unidade", saldoAntes: movimentacao.saldo_antes, saldoDepois: movimentacao.saldo_depois, observacao: movimentacao.observacao, filialId: movimentacao.filial_id || "", pedidoId: movimentacao.pedido_id || "", criadoEm: movimentacao.criado_em };
        })
    };
    idsPedidosRemotos = new Set(estado.pedidos.map((pedido) => pedido.id));
    estadoSincronizado = JSON.parse(JSON.stringify(estado));
    renderizarTudo();
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarNumero(valor) {
    return new Intl.NumberFormat("pt-BR").format(numeroInteiroNaoNegativo(valor));
}

function formatarData(valor) {
    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "Data não disponível";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(data);
}

function formatarDataSimples(valor) {
    if (!valor) return "";
    const data = new Date(`${valor}T12:00:00`);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(data);
}

function produtosAtivos() {
    return estado.produtos.filter((produto) => produto.ativo);
}

function buscarProduto(id) {
    return estado.produtos.find((produto) => produto.id === id);
}

function buscarFilial(id) {
    return estado.filiais.find((filial) => filial.id === id);
}

function estaNoPortalFilial() {
    return portalAtual !== CENTRO_DISTRIBUICAO_ID;
}

function filialAtual() {
    return estaNoPortalFilial() ? buscarFilial(portalAtual) : null;
}

function itensDoPedido(pedido) {
    return Array.isArray(pedido.itens) ? pedido.itens : [];
}

function itensEmAcao(pedido) {
    return itensSelecionadosPedido.length
        ? itensDoPedido(pedido).filter((item) => itensSelecionadosPedido.includes(item.produtoId))
        : itensDoPedido(pedido);
}

function atualizarSituacaoDoPedido(pedido) {
    const situacoes = itensDoPedido(pedido).map((item) => item.situacao || pedido.situacao || "pendente");
    if (situacoes.every((situacao) => situacao === "recusado")) pedido.situacao = "recusado";
    else if (situacoes.every((situacao) => situacao === "recebido" || situacao === "recusado")) pedido.situacao = "recebido";
    else if (situacoes.includes("em_transito")) pedido.situacao = "em_transito";
    else if (situacoes.includes("aguardando_compra")) pedido.situacao = "aguardando_compra";
    else pedido.situacao = "pendente";
    pedido.atualizadoEm = new Date().toISOString();
}

function pedidosAbertos() {
    return estado.pedidos.filter((pedido) => ["pendente", "aguardando_compra", "em_transito"].includes(pedido.situacao));
}

function produtosComEstoqueBaixo() {
    return produtosAtivos().filter((produto) => produto.quantidade <= produto.estoqueMinimo);
}

function chaveEstoqueFilial(filialId, produtoId) {
    return `${filialId}:${produtoId}`;
}

function quantidadeEstoqueFilial(filialId, produtoId) {
    if (!filialId || !produtoId) return 0;
    const registro = estado.estoqueFiliais[chaveEstoqueFilial(filialId, produtoId)];
    return numeroInteiroNaoNegativo(registro?.quantidade ?? registro);
}

function situacaoProduto(produto) {
    if (produto.quantidade === 0) {
        return { texto: "Sem estoque", classe: "status-sem-estoque" };
    }

    if (produto.quantidade <= produto.estoqueMinimo) {
        return { texto: "Estoque baixo", classe: "status-baixo" };
    }

    return { texto: "Normal", classe: "status-normal" };
}

function textoTipoMovimentacao(tipo) {
    return {
        entrada: "Entrada",
        saida: "Saída",
        transferencia: "Transferência",
        ajuste: "Ajuste"
    }[tipo] || "Ajuste";
}

function classeTipoMovimentacao(tipo) {
    return `tipo-${tipo || "ajuste"}`;
}

function textoSituacaoPedido(situacao) {
    return {
        pendente: "Pendente",
        aguardando_compra: "Aguardando compra",
        em_transito: "A caminho",
        recebido: "Recebido",
        aprovado: "Recebido",
        recusado: "Recusado"
    }[situacao] || "Pendente";
}

function classeSituacaoPedido(situacao) {
    return `tipo-${situacao || "pendente"}`;
}

function notificar(mensagem, tipo = "sucesso") {
    clearTimeout(temporizadorToast);
    elementos.toast.textContent = mensagem;
    elementos.toast.classList.toggle("toast-erro", tipo === "erro");
    elementos.toast.classList.add("toast-visivel");

    temporizadorToast = setTimeout(() => {
        elementos.toast.classList.remove("toast-visivel");
    }, 3600);
}

function abrirModal(modal) {
    modal.classList.add("modal-aberto");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModal(modal) {
    modal.classList.remove("modal-aberto");
    modal.setAttribute("aria-hidden", "true");
}

function atualizarPaginaMovimentacao() {
    const entrada = tipoMovimentacaoAtual === "entrada";

    elementos.movimentoSubtitulo.textContent = entrada ? "Recebimento de produtos" : "Consumo, perda ou transferência";
    elementos.movimentoTitulo.textContent = entrada ? "Registrar entrada" : "Registrar saída";
    elementos.movimentoDescricao.textContent = entrada
        ? "Registre produtos que chegaram ao Centro de Distribuição, incluindo compras e reposições."
        : "Registre itens consumidos no Centro de Distribuição ou enviados para as filiais.";
    elementos.botaoConfirmarMovimento.textContent = entrada ? "Confirmar entrada" : "Confirmar saída";
}

function atualizarDestinoDaMovimentacao() {
    const entrada = tipoMovimentacaoAtual === "entrada";
    elementos.campoMovimentoFilial.hidden = entrada;
    elementos.movimentoFilial.disabled = entrada;
    elementos.campoMovimentoXml.hidden = !entrada;
    elementos.movimentoXml.disabled = !entrada;
}

function textoNormalizado(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function elementosXmlPorNome(documento, nome) {
    return [...documento.getElementsByTagName("*")].filter((elemento) => elemento.localName === nome);
}

function textoDoElementoXml(elemento, nome) {
    return elementosXmlPorNome(elemento, nome)[0]?.textContent?.trim() || "";
}

function encontrarProdutoDoXml(item) {
    const codigo = String(item.codigo || "").trim();
    const nome = textoNormalizado(item.nome);
    return (codigo && produtosAtivos().find((produto) => String(produto.codigo || "").trim() === codigo))
        || produtosAtivos().find((produto) => textoNormalizado(produto.nome) === nome);
}

function atualizarBotaoCadastrarProdutoXml() {
    const item = itensXmlMovimentacao[indiceItemXmlSelecionado];
    const produtoEncontrado = item && encontrarProdutoDoXml(item);
    elementos.botaoCadastrarProdutoXml.hidden = !item || Boolean(produtoEncontrado) || Boolean(elementos.movimentoProduto.value);
}

function preencherItemXmlMovimentacao(indice) {
    const item = itensXmlMovimentacao[Number(indice)];
    if (!item) return;

    indiceItemXmlSelecionado = Number(indice);
    const produto = encontrarProdutoDoXml(item);
    produtoSelecionadoMovimentacao = produto?.id || "";
    elementos.movimentoProduto.value = produtoSelecionadoMovimentacao;
    elementos.movimentoQuantidade.value = Number.isInteger(item.quantidade) && item.quantidade > 0 ? String(item.quantidade) : "";
    elementos.movimentoObservacao.value = item.observacao;
    atualizarInformacaoProdutoMovimento();

    elementos.mensagemXml.textContent = produto
        ? `Item ${Number(indice) + 1} preenchido com o produto cadastrado “${produto.nome}”.`
        : `Item ${Number(indice) + 1} carregado. Selecione manualmente o produto correspondente, pois ele não foi encontrado no cadastro.`;
    atualizarBotaoCadastrarProdutoXml();
}

function limparImportacaoXml(limparCampos = true) {
    itensXmlMovimentacao = [];
    indiceItemXmlSelecionado = null;
    elementos.movimentoXml.value = "";
    elementos.movimentoItemXml.innerHTML = "";
    elementos.campoItemXml.hidden = true;
    elementos.mensagemXml.textContent = "";
    elementos.botaoRemoverXml.hidden = true;
    elementos.botaoCadastrarProdutoXml.hidden = true;

    if (limparCampos) {
        produtoSelecionadoMovimentacao = "";
        elementos.movimentoProduto.value = "";
        elementos.movimentoQuantidade.value = "";
        elementos.movimentoObservacao.value = "";
        atualizarInformacaoProdutoMovimento();
    }
}

function unidadeDoXml(unidade) {
    const unidades = {
        un: "Unidade", und: "Unidade", unidade: "Unidade",
        cx: "Caixa", caixa: "Caixa",
        pct: "Pacote", pc: "Pacote", pacote: "Pacote",
        l: "Litro", lt: "Litro", litro: "Litro",
        kg: "Quilograma", quilograma: "Quilograma"
    };
    return unidades[textoNormalizado(unidade)] || "";
}

function abrirCadastroProdutoDoXml() {
    const item = itensXmlMovimentacao[indiceItemXmlSelecionado];
    if (!item) return;

    abrirModalProduto();
    elementos.produtoCodigo.value = item.codigo;
    elementos.produtoNome.value = item.nome;
    elementos.produtoCategoria.value = "Outros";
    elementos.produtoQuantidade.value = "0";
    elementos.produtoMinimo.value = "0";
    elementos.produtoUnidade.value = unidadeDoXml(item.unidade);
    elementos.mensagemProduto.textContent = "Confira a categoria e a unidade antes de salvar. A quantidade da nota continuará preenchida na entrada.";
}

function carregarItensDoXml(texto) {
    const documento = new DOMParser().parseFromString(texto, "application/xml");
    if (documento.querySelector("parsererror")) throw new Error("O arquivo não contém um XML válido.");

    const numeroNota = textoDoElementoXml(documento, "nNF");
    const emitente = textoDoElementoXml(elementosXmlPorNome(documento, "emit")[0] || documento, "xNome");
    const itens = elementosXmlPorNome(documento, "det").map((detalhe) => {
        const produto = elementosXmlPorNome(detalhe, "prod")[0] || detalhe;
        const quantidadeTexto = textoDoElementoXml(produto, "qCom").replace(",", ".");
        const quantidade = Number(quantidadeTexto);
        const nome = textoDoElementoXml(produto, "xProd");
        const codigo = textoDoElementoXml(produto, "cProd");
        const unidade = textoDoElementoXml(produto, "uCom");
        const descricaoNota = numeroNota ? `NF-e ${numeroNota}` : "NF-e importada por XML";
        return {
            codigo,
            nome,
            unidade,
            quantidade: Number.isInteger(quantidade) ? quantidade : 0,
            observacao: `${descricaoNota}${emitente ? ` · ${emitente}` : ""}${codigo ? ` · Cód. ${codigo}` : ""}${unidade ? ` · ${unidade}` : ""}`
        };
    }).filter((item) => item.nome || item.codigo);

    if (!itens.length) throw new Error("Nenhum item de produto foi encontrado no XML.");
    return itens;
}

async function importarXmlMovimentacao() {
    const arquivo = elementos.movimentoXml.files?.[0];
    limparImportacaoXml(false);
    if (!arquivo) return;

    if (!/\.xml$/i.test(arquivo.name) && !["text/xml", "application/xml"].includes(arquivo.type)) {
        elementos.mensagemXml.textContent = "Selecione um arquivo XML de nota fiscal.";
        elementos.movimentoXml.value = "";
        return;
    }

    try {
        itensXmlMovimentacao = carregarItensDoXml(await arquivo.text());
        elementos.movimentoItemXml.innerHTML = itensXmlMovimentacao.map((item, indice) => `
            <option value="${indice}">${indice + 1}. ${escaparHTML(item.nome || item.codigo)} · ${formatarNumero(item.quantidade)} unidade(s)</option>
        `).join("");
        elementos.campoItemXml.hidden = false;
        elementos.botaoRemoverXml.hidden = false;
        preencherItemXmlMovimentacao(0);
    } catch (erro) {
        console.error(erro);
        elementos.mensagemXml.textContent = erro.message || "Não foi possível ler o XML.";
    }
}

function navegar(pagina, opcoes = {}) {
    const paginasFilial = ["portal-filial", "novo-pedido-filial", "meus-pedidos"];

    if (estaNoPortalFilial() && !paginasFilial.includes(pagina)) {
        pagina = "portal-filial";
    }

    if (!estaNoPortalFilial() && paginasFilial.includes(pagina)) {
        pagina = "dashboard";
    }

    paginaAtual = pagina in titulosPaginas ? pagina : "dashboard";

    if (opcoes.tipoMovimentacao) {
        tipoMovimentacaoAtual = opcoes.tipoMovimentacao;
    }

    if (opcoes.produtoId !== undefined) {
        produtoSelecionadoMovimentacao = opcoes.produtoId;
    }

    elementos.paginas.forEach((item) => {
        item.classList.toggle("pagina-ativa", item.id === `pagina-${paginaAtual}`);
    });

    elementos.menuMatriz.hidden = estaNoPortalFilial();
    elementos.menuFilial.hidden = !estaNoPortalFilial();
    const filial = filialAtual();
    elementos.contextoPortal.textContent = filial
        ? `Therapeutica Pharmacia · Filial ${filial.nome}`
        : "Therapeutica Pharmacia · Centro de Distribuição";

    elementos.navegacao.forEach((item) => {
        const correspondePagina = item.dataset.pagina === paginaAtual;
        const correspondeTipo = paginaAtual !== "movimentacao" || item.dataset.tipoMovimentacao === tipoMovimentacaoAtual;
        item.classList.toggle("menu-ativo", correspondePagina && correspondeTipo);
    });

    elementos.tituloPagina.textContent = paginaAtual === "movimentacao"
        ? (tipoMovimentacaoAtual === "entrada" ? "Entradas" : "Saídas")
        : titulosPaginas[paginaAtual];

    atualizarPaginaMovimentacao();
    atualizarDestinoDaMovimentacao();
    renderizarTudo();

    // A renderização atualiza elementos de todas as telas. Aplicamos a página
    // ativa novamente ao final para manter a troca de portal sempre explícita.
    elementos.paginas.forEach((item) => {
        item.classList.toggle("pagina-ativa", item.id === `pagina-${paginaAtual}`);
    });

    salvarNavegacaoAtual();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function registrarMovimentacao({ produto, tipo, quantidade, saldoAntes, saldoDepois, observacao = "", filialId = "", pedidoId = "" }) {
    estado.movimentacoes.unshift({
        id: gerarId("mov"),
        produtoId: produto.id,
        produtoNome: produto.nome,
        tipo,
        quantidade,
        unidade: produto.unidade,
        saldoAntes,
        saldoDepois,
        observacao,
        filialId,
        pedidoId,
        criadoEm: new Date().toISOString()
    });
}

function renderizarIndicadores() {
    const ativos = produtosAtivos();
    const totalUnidades = ativos.reduce((total, produto) => total + produto.quantidade, 0);

    elementos.indicadorProdutos.textContent = formatarNumero(ativos.length);
    elementos.indicadorUnidades.textContent = formatarNumero(totalUnidades);
    elementos.indicadorEstoqueBaixo.textContent = formatarNumero(produtosComEstoqueBaixo().length);
    elementos.indicadorPedidos.textContent = formatarNumero(pedidosAbertos().length);
}

function renderizarDashboard() {
    const movimentacoes = estado.movimentacoes.slice(0, 5);
    const alertas = produtosComEstoqueBaixo().slice(0, 5);

    elementos.dashboardMovimentacoes.innerHTML = movimentacoes.length
        ? movimentacoes.map((movimentacao) => {
            const sinal = movimentacao.tipo === "entrada" ? "+" : movimentacao.tipo === "saida" ? "−" : "→";
            const classe = movimentacao.tipo === "entrada"
                ? "valor-positivo"
                : movimentacao.tipo === "saida"
                    ? "valor-negativo"
                    : "valor-transferencia";

            return `
                <div class="resumo-linha">
                    <div>
                        <strong>${escaparHTML(movimentacao.produtoNome)}</strong>
                        <span>${textoTipoMovimentacao(movimentacao.tipo)} · ${formatarData(movimentacao.criadoEm)}</span>
                    </div>
                    <span class="${classe}">${sinal} ${formatarNumero(movimentacao.quantidade)} ${escaparHTML(movimentacao.unidade)}</span>
                </div>
            `;
        }).join("")
        : "<p class=\"resumo-vazio\">Nenhuma movimentação registrada ainda.</p>";

    elementos.dashboardAlertas.innerHTML = alertas.length
        ? alertas.map((produto) => `
            <div class="resumo-linha">
                <div>
                    <strong>${escaparHTML(produto.nome)}</strong>
                    <span>Mínimo definido: ${formatarNumero(produto.estoqueMinimo)} ${escaparHTML(produto.unidade)}</span>
                </div>
                <span class="valor-negativo">${formatarNumero(produto.quantidade)} ${escaparHTML(produto.unidade)}</span>
            </div>
        `).join("")
        : "<p class=\"resumo-vazio\">Todos os produtos estão acima do estoque mínimo.</p>";
}

function renderizarFiltroCategorias() {
    const valorAtual = elementos.filtroCategoria.value;
    const categorias = [...new Set(produtosAtivos().map((produto) => produto.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR"));

    elementos.filtroCategoria.innerHTML = `
        <option value="">Todas as categorias</option>
        ${categorias.map((categoria) => `<option value="${escaparHTML(categoria)}">${escaparHTML(categoria)}</option>`).join("")}
    `;

    if (categorias.includes(valorAtual)) {
        elementos.filtroCategoria.value = valorAtual;
    }
}

function renderizarProdutos() {
    const busca = elementos.buscaProdutos.value.trim().toLocaleLowerCase("pt-BR");
    const categoria = elementos.filtroCategoria.value;
    const produtos = produtosAtivos()
        .filter((produto) => {
            const texto = `${produto.nome} ${produto.categoria} ${produto.codigo}`.toLocaleLowerCase("pt-BR");
            return (!busca || texto.includes(busca)) && (!categoria || produto.categoria === categoria);
        })
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    elementos.tabelaProdutos.innerHTML = produtos.length
        ? produtos.map((produto) => {
            const status = situacaoProduto(produto);
            const codigo = produto.codigo ? `<span class="codigo-produto">${escaparHTML(produto.codigo)}</span>` : "";

            return `
                <tr>
                    <td><strong>${escaparHTML(produto.nome)}</strong>${codigo}</td>
                    <td>${escaparHTML(produto.categoria)}</td>
                    <td><strong>${formatarNumero(produto.quantidade)}</strong></td>
                    <td>${formatarNumero(produto.estoqueMinimo)}</td>
                    <td>${escaparHTML(produto.unidade)}</td>
                    <td><span class="selo-status ${status.classe}">${status.texto}</span></td>
                    <td>
                        <div class="acoes-tabela">
                            <button type="button" class="botao-acao acao-entrada" data-acao="movimentar" data-produto-id="${produto.id}" data-tipo="entrada">Entrada</button>
                            <button type="button" class="botao-acao acao-saida" data-acao="movimentar" data-produto-id="${produto.id}" data-tipo="saida">Saída</button>
                            <button type="button" class="botao-acao" data-acao="editar-produto" data-produto-id="${produto.id}">Editar</button>
                            <button type="button" class="botao-acao acao-perigo" data-acao="arquivar-produto" data-produto-id="${produto.id}">Arquivar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("")
        : "<tr><td colspan=\"7\" class=\"tabela-vazia\">Nenhum produto encontrado.</td></tr>";
}

function renderizarFormularioMovimentacao() {
    const ativos = produtosAtivos().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const valorExistente = produtoSelecionadoMovimentacao || elementos.movimentoProduto.value;
    const filialSelecionada = elementos.movimentoFilial.value;

    elementos.movimentoProduto.innerHTML = ativos.length
        ? `<option value="">Selecione um produto</option>${ativos.map((produto) => `
            <option value="${produto.id}">${escaparHTML(produto.nome)} · ${formatarNumero(produto.quantidade)} ${escaparHTML(produto.unidade)}</option>
        `).join("")}`
        : "<option value=\"\">Nenhum produto cadastrado</option>";

    if (ativos.some((produto) => produto.id === valorExistente)) {
        elementos.movimentoProduto.value = valorExistente;
        produtoSelecionadoMovimentacao = valorExistente;
    } else {
        produtoSelecionadoMovimentacao = "";
    }

    elementos.movimentoProduto.disabled = ativos.length === 0;
    elementos.botaoConfirmarMovimento.disabled = ativos.length === 0;
    elementos.movimentoFilial.innerHTML = `<option value="">Saída do CD</option>${estado.filiais.map((filial) => `
        <option value="${filial.id}">${escaparHTML(filial.nome)} · ${escaparHTML(filial.cidade)}</option>
    `).join("")}`;
    if (buscarFilial(filialSelecionada)) {
        elementos.movimentoFilial.value = filialSelecionada;
    }
    atualizarInformacaoProdutoMovimento();
}

function atualizarInformacaoProdutoMovimento() {
    const produto = buscarProduto(elementos.movimentoProduto.value);

    if (!produto) {
        elementos.infoProdutoMovimento.textContent = produtosAtivos().length
            ? "Selecione um produto para ver o estoque atual."
            : "Cadastre um produto antes de registrar uma movimentação.";
        return;
    }

    elementos.infoProdutoMovimento.innerHTML = `Estoque atual no CD: <strong>${formatarNumero(produto.quantidade)} ${escaparHTML(produto.unidade)}</strong>. Estoque mínimo: <strong>${formatarNumero(produto.estoqueMinimo)} ${escaparHTML(produto.unidade)}</strong>.`;
}

function renderizarEstoqueBaixo() {
    const produtos = produtosComEstoqueBaixo().sort((a, b) => a.quantidade - b.quantidade || a.nome.localeCompare(b.nome, "pt-BR"));

    elementos.tabelaEstoqueBaixo.innerHTML = produtos.length
        ? produtos.map((produto) => `
            <tr>
                <td><strong>${escaparHTML(produto.nome)}</strong></td>
                <td>${escaparHTML(produto.categoria)}</td>
                <td><strong>${formatarNumero(produto.quantidade)}</strong></td>
                <td>${formatarNumero(produto.estoqueMinimo)}</td>
                <td>${escaparHTML(produto.unidade)}</td>
                <td><button type="button" class="botao-acao acao-entrada" data-acao="movimentar" data-produto-id="${produto.id}" data-tipo="entrada">Registrar entrada</button></td>
            </tr>
        `).join("")
        : "<tr><td colspan=\"6\" class=\"tabela-vazia\">Nenhum produto está com estoque baixo.</td></tr>";
}

function renderizarPedidos() {
    const statusSelecionado = elementos.filtroStatusPedidos.value;
    const pedidos = [...estado.pedidos]
        .filter((pedido) => !statusSelecionado || pedido.situacao === statusSelecionado)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    elementos.tabelaPedidos.innerHTML = pedidos.length
        ? pedidos.map((pedido) => {
            const filial = buscarFilial(pedido.filialId);
            const itens = itensDoPedido(pedido);
            const compra = pedido.compraPrevista ? `Chegada no CD: ${formatarDataSimples(pedido.compraPrevista)}` : "";
            const entrega = pedido.entregaPrevista ? `Entrega prevista: ${formatarDataSimples(pedido.entregaPrevista)}` : "";
            const listaItens = itens.map((item) => `
                <div class="item-pedido-resumo">
                    <strong>${escaparHTML(item.produtoNome)}</strong>
                    <span>Filial: ${formatarNumero(item.estoqueInformado)} · Pedido: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)}</span>
                </div>
            `).join("");
            const haItensPendentes = itens.some((item) => (item.situacao || pedido.situacao) === "pendente");
            const acoes = haItensPendentes
                ? `<button type="button" class="botao-acao acao-aprovar" data-acao="analisar-pedido" data-pedido-id="${pedido.id}">Analisar itens</button>`
                : `<button type="button" class="botao-acao" data-acao="consultar-pedido" data-pedido-id="${pedido.id}">Consultar pedido</button>`;

            return `
                <tr>
                    <td>${formatarData(pedido.criadoEm)}</td>
                    <td><strong>${escaparHTML(filial?.nome || "Filial não identificada")}</strong></td>
                    <td>${listaItens}${pedido.observacao ? `<span class="detalhe-celula">${escaparHTML(pedido.observacao)}</span>` : ""}</td>
                    <td><span class="selo-tipo ${classeSituacaoPedido(pedido.situacao)}">${textoSituacaoPedido(pedido.situacao)}</span>${compra ? `<span class="detalhe-celula">${escaparHTML(compra)}</span>` : ""}${entrega ? `<span class="detalhe-celula">${escaparHTML(entrega)}</span>` : ""}</td>
                    <td>${acoes}</td>
                </tr>
            `;
        }).join("")
        : "<tr><td colspan=\"5\" class=\"tabela-vazia\">Nenhum pedido criado ainda.</td></tr>";
}

function abrirModalAnalisarPedido(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = pedido && buscarFilial(pedido.filialId);
    if (!pedido || !usuarioEhCD()) return;
    pedidoEmAnaliseId = pedidoId;

    itensDoPedido(pedido).forEach((item) => { item.situacao ||= pedido.situacao || "pendente"; });

    elementos.tituloModalAnalisarPedido.textContent = `Pedido da filial ${filial?.nome || ""}`.trim();
    elementos.listaAnalisarPedido.innerHTML = itensDoPedido(pedido).map((item) => {
        const situacao = item.situacao || pedido.situacao || "pendente";
        const acoes = situacao === "pendente"
            ? `<div class="acoes-tabela"><button type="button" class="botao-acao acao-aprovar" data-acao="aprovar-item-pedido" data-pedido-id="${pedido.id}" data-produto-id="${item.produtoId}">Aprovar</button><button type="button" class="botao-acao acao-perigo" data-acao="recusar-item-pedido" data-pedido-id="${pedido.id}" data-produto-id="${item.produtoId}">Recusar</button></div>`
            : situacao === "aguardando_compra"
                ? `<div class="acoes-tabela"><button type="button" class="botao-acao acao-aprovar" data-acao="receber-compra-item-pedido" data-pedido-id="${pedido.id}" data-produto-id="${item.produtoId}">Receber compra</button><button type="button" class="botao-acao acao-perigo" data-acao="recusar-item-pedido" data-pedido-id="${pedido.id}" data-produto-id="${item.produtoId}">Recusar</button></div>`
                : "";
        return `<article class="item-analise-pedido"><div class="item-analise-informacoes"><strong>${escaparHTML(item.produtoNome)}</strong><span>Solicitado: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)}</span><span>Estoque informado pela filial: ${formatarNumero(item.estoqueInformado)} ${escaparHTML(item.unidade)}</span>${item.observacaoMatriz ? `<span>${escaparHTML(item.observacaoMatriz)}</span>` : ""}</div><div class="item-analise-acoes"><span class="selo-tipo ${classeSituacaoPedido(situacao)}">${textoSituacaoPedido(situacao)}</span>${acoes}</div></article>`;
    }).join("");
    abrirModal(elementos.modalAnalisarPedido);
}

function renderizarNotificacaoPedidos() {
    const pendentes = estado.pedidos.filter((pedido) => itensDoPedido(pedido).some((item) => (item.situacao || pedido.situacao) === "pendente")).length;
    elementos.notificacaoPedidos.hidden = pendentes === 0;
    elementos.notificacaoPedidos.textContent = pendentes > 99 ? "99+" : String(pendentes);
    elementos.notificacaoPedidos.setAttribute("aria-label", `${pendentes} ${pendentes === 1 ? "pedido pendente" : "pedidos pendentes"}`);
}

function renderizarFiliais() {
    elementos.listaFiliais.innerHTML = estado.filiais.map((filial) => {
        const pedidos = estado.pedidos.filter((pedido) => pedido.filialId === filial.id);
        const abertos = pedidos.filter((pedido) => ["pendente", "aguardando_compra", "em_transito"].includes(pedido.situacao)).length;
        const produtosControlados = Object.keys(estado.estoqueFiliais).filter((chave) => chave.startsWith(`${filial.id}:`)).length;

        return `
            <article class="filial-card">
                <p class="subtitulo-secao">Filial Therapeutica</p>
                <h3>${escaparHTML(filial.nome)}</h3>
                <p>${escaparHTML(filial.cidade)}</p>
                <div class="metricas-filial">
                    <div class="metrica-filial"><strong>${formatarNumero(abertos)}</strong><span>pedidos abertos</span></div>
                    <div class="metrica-filial"><strong>${formatarNumero(produtosControlados)}</strong><span>itens informados</span></div>
                </div>
                <div class="acoes-tabela">
                    <button type="button" class="botao-secundario" data-acao="abrir-portal-filial" data-filial-id="${filial.id}">Abrir portal</button>
                    <button type="button" class="botao-secundario" data-acao="consultar-estoque-filial" data-filial-id="${filial.id}">Consultar estoque</button>
                </div>
            </article>
        `;
    }).join("");
}

function renderizarHistorico() {
    const busca = elementos.buscaHistorico.value.trim().toLocaleLowerCase("pt-BR");
    const tipo = elementos.filtroHistorico.value;
    const movimentacoes = estado.movimentacoes.filter((movimentacao) => {
        const texto = `${movimentacao.produtoNome} ${movimentacao.observacao}`.toLocaleLowerCase("pt-BR");
        return (!busca || texto.includes(busca)) && (!tipo || movimentacao.tipo === tipo);
    });

    elementos.tabelaHistorico.innerHTML = movimentacoes.length
        ? movimentacoes.map((movimentacao) => {
            const filial = movimentacao.filialId ? buscarFilial(movimentacao.filialId) : null;
            const saldo = movimentacao.saldoAntes !== null && movimentacao.saldoDepois !== null
                ? `Saldo: ${formatarNumero(movimentacao.saldoAntes)} → ${formatarNumero(movimentacao.saldoDepois)}`
                : "Saldo anterior não registrado";
            const destino = filial ? `Destino: ${filial.nome}` : movimentacao.observacao || "Sem observação";

            return `
                <tr>
                    <td>${formatarData(movimentacao.criadoEm)}</td>
                    <td><span class="selo-tipo ${classeTipoMovimentacao(movimentacao.tipo)}">${textoTipoMovimentacao(movimentacao.tipo)}</span></td>
                    <td><strong>${escaparHTML(movimentacao.produtoNome)}</strong><span class="detalhe-celula">${saldo}</span></td>
                    <td>${formatarNumero(movimentacao.quantidade)} ${escaparHTML(movimentacao.unidade)}</td>
                    <td>${escaparHTML(destino)}${movimentacao.observacao && filial ? `<span class="detalhe-celula">${escaparHTML(movimentacao.observacao)}</span>` : ""}</td>
                </tr>
            `;
        }).join("")
        : "<tr><td colspan=\"5\" class=\"tabela-vazia\">Nenhuma movimentação encontrada.</td></tr>";
}

function renderizarUsuarios() {
    if (!elementos.tabelaUsuarios) return;
    elementos.tabelaUsuarios.innerHTML = usuarios.length
        ? usuarios.map((usuario) => {
            const filial = usuario.filial_id ? (buscarFilial(usuario.filial_id)?.nome || usuario.filial_id) : "—";
            const papel = usuario.papel === "cd_admin" ? "Administrador" : "Filial";
            return `<tr><td>${escaparHTML(usuario.nome || "Sem nome")}</td><td>${escaparHTML(usuario.email)}</td><td><span class="selo-tipo ${usuario.papel === "cd_admin" ? "tipo-aprovado" : "tipo-pendente"}">${papel}</span></td><td>${escaparHTML(filial)}</td><td><button type="button" class="botao-acao" data-acao="editar-usuario" data-usuario-id="${usuario.id}">Editar</button></td></tr>`;
        }).join("")
        : "<tr><td colspan=\"5\" class=\"tabela-vazia\">Nenhum usuário encontrado.</td></tr>";
}

function renderizarPortalFilial() {
    const filial = filialAtual();

    if (!filial) return;

    const statusSelecionado = elementos.filtroStatusMeusPedidos.value;
    const pedidosDaFilial = estado.pedidos.filter((pedido) => pedido.filialId === filial.id);
    const abertos = pedidosDaFilial.filter((pedido) => ["pendente", "aguardando_compra", "em_transito"].includes(pedido.situacao)).length;

    elementos.tituloPortalFilial.textContent = `Portal Therapeutica · ${filial.nome}`;
    elementos.indicadorFilialPedidos.textContent = formatarNumero(abertos);

    const produtos = produtosAtivos().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    const selecionado = elementos.itemPedidoProduto.value;
    elementos.itemPedidoProduto.innerHTML = produtos.length
        ? `<option value="">Selecione um produto</option>${produtos.map((produto) => `<option value="${produto.id}">${escaparHTML(produto.nome)} · Unidade: ${escaparHTML(produto.unidade)}</option>`).join("")}`
        : "<option value=\"\">Nenhum produto disponível</option>";

    if (produtos.some((produto) => produto.id === selecionado)) {
        elementos.itemPedidoProduto.value = selecionado;
    }

    elementos.itemPedidoProduto.disabled = produtos.length === 0;
    atualizarEstoqueAtualDoItemPedido();
    renderizarCarrinhoPedido();

    const pedidosFiltrados = pedidosDaFilial.filter((pedido) => !statusSelecionado || pedido.situacao === statusSelecionado);
    elementos.listaMeusPedidos.innerHTML = pedidosFiltrados.length
        ? pedidosFiltrados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).map((pedido) => {
            const compra = pedido.compraPrevista ? formatarDataSimples(pedido.compraPrevista) : "";
            const entrega = pedido.entregaPrevista ? formatarDataSimples(pedido.entregaPrevista) : "";
            return `
                <article class="pedido-filial-card">
                    <div class="cabecalho-pedido-filial">
                        <div>
                            <h3>Pedido de ${formatarData(pedido.criadoEm)}</h3>
                            <p>${pedido.observacao ? escaparHTML(pedido.observacao) : "Sem observação geral."}</p>
                        </div>
                        <span class="selo-tipo ${classeSituacaoPedido(pedido.situacao)}">${textoSituacaoPedido(pedido.situacao)}</span>
                    </div>
                    <div class="itens-pedido-resumo">
                        ${itensDoPedido(pedido).map((item) => {
                            const situacaoItem = item.situacao || pedido.situacao;
                            const motivoRecusa = item.observacaoMatriz || pedido.observacaoMatriz || "Motivo não informado pelo CD.";
                            return `
                                <div class="item-pedido-resumo">
                                    <strong>${escaparHTML(item.produtoNome)}</strong>
                                    <span>Estoque informado: ${formatarNumero(item.estoqueInformado)} · Solicitado: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)}</span>
                                    ${situacaoItem === "recusado" ? `<span class="motivo-recusa-pedido">Motivo da recusa: ${escaparHTML(motivoRecusa)}</span>` : ""}
                                </div>
                            `;
                        }).join("")}
                    </div>
                    ${compra ? `<p><strong>Chegada prevista no CD:</strong> ${escaparHTML(compra)}</p>` : ""}
                    ${entrega ? `<p><strong>Entrega prevista:</strong> ${escaparHTML(entrega)}</p>` : ""}
                    ${pedido.recebidoEm ? `<p><strong>Recebido em:</strong> ${formatarData(pedido.recebidoEm)}</p>` : ""}
                    ${pedido.observacaoMatriz ? `<p><strong>Resposta do CD:</strong> ${escaparHTML(pedido.observacaoMatriz)}</p>` : ""}
                    <div class="acoes-pedido-filial">
                        <button type="button" class="botao-acao" data-acao="ver-detalhes-pedido" data-pedido-id="${pedido.id}">Ver detalhes</button>
                    </div>
                </article>
            `;
        }).join("")
        : "<p class=\"resumo-vazio\">Nenhum pedido foi enviado por esta filial.</p>";
}

function renderizarCarrinhoPedido() {
    elementos.quantidadeItensCarrinho.textContent = `${itensDoPedidoAtual.length} ${itensDoPedidoAtual.length === 1 ? "item" : "itens"}`;
    elementos.itensCarrinhoPedido.innerHTML = itensDoPedidoAtual.length
        ? itensDoPedidoAtual.map((item, indice) => `
            <div class="linha-carrinho">
                <div>
                    <strong>${escaparHTML(item.produtoNome)}</strong>
                    <span>Estoque atual: ${formatarNumero(item.estoqueInformado)} · Solicitação: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)}</span>
                    ${item.observacao ? `<span>${escaparHTML(item.observacao)}</span>` : ""}
                </div>
                <button type="button" class="botao-remover-item" data-acao="remover-item-pedido" data-indice-item="${indice}">Remover</button>
            </div>
        `).join("")
        : "<p class=\"resumo-vazio\">Adicione produtos para montar a lista do pedido.</p>";
}

function atualizarEstoqueAtualDoItemPedido() {
    elementos.itemPedidoEstoque.value = "";
}

function renderizarTudo() {
    renderizarIndicadores();
    renderizarDashboard();
    renderizarFiltroCategorias();
    renderizarProdutos();
    renderizarFormularioMovimentacao();
    renderizarEstoqueBaixo();
    renderizarPedidos();
    renderizarNotificacaoPedidos();
    renderizarFiliais();
    renderizarHistorico();
    renderizarUsuarios();
    renderizarPortalFilial();
    if (pedidoEmAnaliseId && elementos.modalAnalisarPedido.classList.contains("modal-aberto")) {
        const pedidoEmAnalise = estado.pedidos.find((pedido) => pedido.id === pedidoEmAnaliseId);
        const haItensPendentes = pedidoEmAnalise?.itens?.some((item) => item.situacao === "pendente");
        if (haItensPendentes) {
            abrirModalAnalisarPedido(pedidoEmAnaliseId);
        } else {
            fecharModal(elementos.modalAnalisarPedido);
            pedidoEmAnaliseId = "";
        }
    }
}

async function carregarUsuarios() {
    if (!usuarioEhCD()) return;
    const { data, error } = await clienteSupabase.rpc("listar_usuarios");
    if (error) { console.error(error); notificar("Não foi possível carregar os usuários. Execute usuarios-admin.sql.", "erro"); return; }
    usuarios = data || [];
    renderizarUsuarios();
}

function abrirModalUsuario(id) {
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) return;
    elementos.formularioUsuario.reset();
    elementos.mensagemUsuario.textContent = "";
    elementos.usuarioId.value = usuario.id;
    elementos.usuarioEmail.value = usuario.email;
    elementos.usuarioNome.value = usuario.nome || "";
    elementos.usuarioPapel.value = usuario.papel;
    elementos.usuarioFilial.value = usuario.filial_id || "";
    elementos.usuarioFilial.disabled = usuario.papel === "cd_admin";
    abrirModal(elementos.modalUsuario);
}

function abrirModalEstoqueFilial(filialId) {
    if (!usuarioEhCD()) return;
    const filial = buscarFilial(filialId);
    if (!filial) return;

    const itensComProduto = Object.entries(estado.estoqueFiliais)
        .filter(([chave]) => chave.startsWith(`${filial.id}:`))
        .map(([chave, registro]) => ({ produto: buscarProduto(chave.slice(`${filial.id}:`.length)), registro }))
        .filter((item) => item.produto);

    elementos.tituloModalEstoqueFilial.textContent = `Estoque da filial ${filial.nome}`;
    elementos.tabelaModalEstoqueFilial.innerHTML = itensComProduto.length
        ? itensComProduto.sort((a, b) => a.produto.nome.localeCompare(b.produto.nome, "pt-BR")).map(({ produto, registro }) => `
            <tr>
                <td><strong>${escaparHTML(produto.nome)}</strong></td>
                <td>${escaparHTML(produto.categoria)}</td>
                <td><strong>${formatarNumero(registro?.quantidade ?? registro)}</strong></td>
                <td>${escaparHTML(produto.unidade)}</td>
                <td>${registro?.atualizadoEm ? formatarData(registro.atualizadoEm) : "Não informado"}</td>
            </tr>
        `).join("")
        : "<tr><td colspan=\"5\" class=\"tabela-vazia\">Nenhum estoque foi informado para esta filial.</td></tr>";
    abrirModal(elementos.modalEstoqueFilial);
}

function abrirModalProduto(produtoId = "") {
    elementos.formularioProduto.reset();
    elementos.mensagemProduto.textContent = "";
    elementos.produtoId.value = "";
    elementos.produtoQuantidade.disabled = false;
    elementos.ajudaQuantidadeProduto.textContent = "Depois use entradas e saídas para alterar o estoque.";
    elementos.tituloModalProduto.textContent = "Cadastrar produto";

    const produto = produtoId ? buscarProduto(produtoId) : null;

    if (produto) {
        elementos.tituloModalProduto.textContent = "Editar produto";
        elementos.produtoId.value = produto.id;
        elementos.produtoCodigo.value = produto.codigo;
        elementos.produtoNome.value = produto.nome;
        elementos.produtoCategoria.value = produto.categoria;
        elementos.produtoQuantidade.value = produto.quantidade;
        elementos.produtoMinimo.value = produto.estoqueMinimo;
        elementos.produtoUnidade.value = produto.unidade;
        elementos.produtoQuantidade.disabled = true;
        elementos.ajudaQuantidadeProduto.textContent = "Para preservar o histórico, altere a quantidade usando Entrada ou Saída.";
    }

    abrirModal(elementos.modalProduto);
    setTimeout(() => elementos.produtoNome.focus(), 0);
}

function abrirModalPedido(filialId = "") {
    const produtos = produtosAtivos();

    if (!produtos.length) {
        notificar("Cadastre pelo menos um produto antes de criar um pedido.", "erro");
        return;
    }

    elementos.formularioPedido.reset();
    elementos.mensagemPedido.textContent = "";
    elementos.pedidoFilial.innerHTML = FILIAIS_PADRAO.map((filial) => `<option value="${filial.id}">${escaparHTML(filial.nome)} · ${escaparHTML(filial.cidade)}</option>`).join("");
    elementos.pedidoProduto.innerHTML = produtos
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        .map((produto) => `<option value="${produto.id}">${escaparHTML(produto.nome)} · CD: ${formatarNumero(produto.quantidade)} ${escaparHTML(produto.unidade)}</option>`)
        .join("");

    if (buscarFilial(filialId)) {
        elementos.pedidoFilial.value = filialId;
    }

    abrirModal(elementos.modalPedido);
    setTimeout(() => elementos.pedidoEstoqueAtual.focus(), 0);
}

function preencherSeletoresEntrega(dataBase = new Date()) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const anoAtual = dataBase.getFullYear();
    const diaAtual = dataBase.getDate();
    const mesAtual = dataBase.getMonth() + 1;

    elementos.entregaDia.innerHTML = Array.from({ length: 31 }, (_, indice) => {
        const dia = indice + 1;
        return `<option value="${dia}">${String(dia).padStart(2, "0")}</option>`;
    }).join("");
    elementos.entregaMes.innerHTML = meses.map((mes, indice) => `<option value="${indice + 1}">${mes}</option>`).join("");
    elementos.entregaAno.innerHTML = Array.from({ length: 4 }, (_, indice) => {
        const ano = anoAtual + indice;
        return `<option value="${ano}">${ano}</option>`;
    }).join("");

    elementos.entregaDia.value = String(diaAtual);
    elementos.entregaMes.value = String(mesAtual);
    elementos.entregaAno.value = String(anoAtual);
}

function configurarModalDataPedido(pedido, modo) {
    const filial = buscarFilial(pedido.filialId);
    const itens = itensEmAcao(pedido);
    const textos = {
        entrega: {
            titulo: "Data prevista de entrega",
            resumo: `Pedido para ${filial?.nome || "a filial"} com ${itens.length} item(ns). Escolha a previsão de entrega.`,
            botao: "Aprovar envio"
        },
        compra: {
            titulo: "Previsão de chegada no CD",
            resumo: `O pedido de ${filial?.nome || "a filial"} ficará aguardando compra. Informe quando a reposição deve chegar no CD.`,
            botao: "Marcar compra"
        },
        receber_compra: {
            titulo: "Receber compra e enviar",
            resumo: `Confirme que a compra chegou no CD e escolha a previsão de entrega para ${filial?.nome || "a filial"}.`,
            botao: "Receber e enviar"
        }
    }[modo];

    elementos.formularioEntrega.reset();
    elementos.entregaPedidoId.value = pedido.id;
    elementos.entregaModo.value = modo;
    elementos.tituloModalEntrega.textContent = textos.titulo;
    elementos.entregaResumo.textContent = textos.resumo;
    elementos.botaoConfirmarData.textContent = textos.botao;
    elementos.mensagemEntrega.textContent = "";

    const itemUnico = modo === "entrega" && itens.length === 1;
    elementos.campoEntregaQuantidade.hidden = !itemUnico;
    elementos.entregaQuantidade.required = itemUnico;
    if (itemUnico) {
        const item = itens[0];
        const produto = buscarProduto(item.produtoId);
        const maximo = Math.min(item.quantidadeSolicitada, produto?.quantidade || 0);
        elementos.entregaQuantidade.min = "1";
        elementos.entregaQuantidade.max = String(maximo);
        elementos.entregaQuantidade.value = String(maximo);
        elementos.ajudaEntregaQuantidade.textContent = `Solicitado: ${formatarNumero(item.quantidadeSolicitada)} ${item.unidade}. Disponível no CD: ${formatarNumero(produto?.quantidade || 0)} ${item.unidade}.`;
    }
    preencherSeletoresEntrega(new Date());
    abrirModal(elementos.modalEntrega);
    setTimeout(() => elementos.entregaDia.focus(), 0);
}

function abrirModalEntrega(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "pendente")) return;

    const itens = itensEmAcao(pedido).filter((item) => (item.situacao || pedido.situacao) === "pendente");
    const itensIndisponiveis = itens.filter((item) => {
        const produto = buscarProduto(item.produtoId);
        return !produto || !produto.ativo || produto.quantidade <= 0;
    });

    if (itensIndisponiveis.length) {
        notificar("O CD não possui saldo suficiente para todos os itens. Registre uma entrada ou marque o pedido como aguardando compra.", "erro");
        return;
    }

    configurarModalDataPedido(pedido, "entrega");
}

function abrirModalCompra(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "pendente")) return;

    configurarModalDataPedido(pedido, "compra");
}

function abrirModalReceberCompra(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "aguardando_compra")) return;

    configurarModalDataPedido(pedido, "receber_compra");
}

function arquivarProduto(produtoId) {
    const produto = buscarProduto(produtoId);

    if (!produto) return;

    const pedidoAberto = pedidosAbertos().some((pedido) => itensDoPedido(pedido).some((item) => item.produtoId === produto.id));

    if (pedidoAberto) {
        notificar("Este produto tem pedido aberto e não pode ser arquivado agora.", "erro");
        return;
    }

    const confirmou = window.confirm(`Arquivar o produto “${produto.nome}”? O histórico será preservado.`);

    if (!confirmou) return;

    produto.ativo = false;
    produto.arquivadoEm = new Date().toISOString();
    produto.atualizadoEm = produto.arquivadoEm;
    salvarEstado();
    renderizarTudo();
    notificar("Produto arquivado. O histórico foi preservado.");
}

function aprovarPedido(pedidoId, dataEntrega, quantidadeSelecionada = null) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "pendente")) return;

    const itens = itensEmAcao(pedido).filter((item) => (item.situacao || pedido.situacao) === "pendente");
    const quantidadesParaEnviar = new Map(itens.map((item) => [item.produtoId, item.quantidadeSolicitada]));
    if (itens.length === 1 && quantidadeSelecionada !== null) {
        const quantidade = Number(quantidadeSelecionada);
        const item = itens[0];
        const produto = buscarProduto(item.produtoId);
        if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > item.quantidadeSolicitada || quantidade > (produto?.quantidade || 0)) {
            elementos.mensagemEntrega.textContent = "Informe uma quantidade disponível entre 1 e o total solicitado.";
            return;
        }
        quantidadesParaEnviar.set(item.produtoId, quantidade);
    }

    const itensIndisponiveis = itens.filter((item) => {
        const produto = buscarProduto(item.produtoId);
        return !produto || !produto.ativo || produto.quantidade < quantidadesParaEnviar.get(item.produtoId);
    });

    if (itensIndisponiveis.length) {
        notificar("O CD não possui saldo suficiente para todos os itens. Registre uma entrada ou marque o pedido como aguardando compra.", "erro");
        return;
    }

    const filial = buscarFilial(pedido.filialId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEntrega) || Number.isNaN(new Date(`${dataEntrega}T12:00:00`).getTime())) {
        elementos.mensagemEntrega.textContent = "Escolha uma data de entrega válida.";
        return;
    }

    const confirmou = window.confirm(`Aprovar o envio de ${itens.length} item(ns) para ${filial?.nome || "a filial"} com entrega prevista em ${formatarDataSimples(dataEntrega)}?`);

    if (!confirmou) return;

    itens.forEach((item) => {
        item.situacao = "em_transito";
        item.quantidadeEnviada = quantidadesParaEnviar.get(item.produtoId);
    });
    atualizarSituacaoDoPedido(pedido);
    pedido.entregaPrevista = dataEntrega;
    pedido.recebidoEm = null;
    pedido.analisadoEm = new Date().toISOString();
    pedido.observacaoMatriz = `Pedido aprovado. Entrega prevista: ${formatarDataSimples(dataEntrega)}.`;

    itens.forEach((item) => {
        const produto = buscarProduto(item.produtoId);
        const saldoAntes = produto.quantidade;

        produto.quantidade -= item.quantidadeEnviada;
        produto.atualizadoEm = new Date().toISOString();

        registrarMovimentacao({
            produto,
            tipo: "transferencia",
            quantidade: item.quantidadeEnviada,
            saldoAntes,
            saldoDepois: produto.quantidade,
            observacao: item.observacao || pedido.observacao || `Envio aprovado para entrega em ${formatarDataSimples(dataEntrega)}.`,
            filialId: pedido.filialId,
            pedidoId: pedido.id
        });
    });

    salvarEstado();
    fecharModal(elementos.modalEntrega);
    renderizarTudo();
    notificar("Pedido aprovado. Estoque do CD baixado e entrega informada à filial.");
}

function receberCompraMatriz(pedidoId, dataEntrega) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "aguardando_compra")) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataEntrega) || Number.isNaN(new Date(`${dataEntrega}T12:00:00`).getTime())) {
        elementos.mensagemEntrega.textContent = "Escolha uma data válida para entrega à filial.";
        return;
    }

    const filial = buscarFilial(pedido.filialId);
    const itens = itensEmAcao(pedido).filter((item) => item.situacao === "aguardando_compra" || !item.situacao);
    const confirmou = window.confirm(`Confirmar chegada da compra no CD e enviar ${itens.length} item(ns) para ${filial?.nome || "a filial"}?`);

    if (!confirmou) return;

    const agora = new Date().toISOString();
    pedido.compraRecebidaEm = agora;
    itens.forEach((item) => { item.situacao = "em_transito"; });
    atualizarSituacaoDoPedido(pedido);
    pedido.entregaPrevista = dataEntrega;
    pedido.recebidoEm = null;
    pedido.analisadoEm = agora;
    pedido.observacaoMatriz = `Compra recebida no CD. Envio para filial com entrega prevista: ${formatarDataSimples(dataEntrega)}.`;

    itens.forEach((item) => {
        const produto = buscarProduto(item.produtoId);
        if (!produto) return;

        const saldoAntesCompra = produto.quantidade;
        produto.quantidade += item.quantidadeSolicitada;
        produto.atualizadoEm = agora;

        registrarMovimentacao({
            produto,
            tipo: "entrada",
            quantidade: item.quantidadeSolicitada,
            saldoAntes: saldoAntesCompra,
            saldoDepois: produto.quantidade,
            observacao: `Compra recebida no CD para atender pedido da filial ${filial?.nome || ""}.`.trim(),
            filialId: pedido.filialId,
            pedidoId: pedido.id
        });

        const saldoAntesEnvio = produto.quantidade;
        produto.quantidade -= item.quantidadeSolicitada;

        registrarMovimentacao({
            produto,
            tipo: "transferencia",
            quantidade: item.quantidadeSolicitada,
            saldoAntes: saldoAntesEnvio,
            saldoDepois: produto.quantidade,
            observacao: item.observacao || pedido.observacao || `Envio criado após recebimento da compra. Entrega prevista: ${formatarDataSimples(dataEntrega)}.`,
            filialId: pedido.filialId,
            pedidoId: pedido.id
        });
    });

    salvarEstado();
    fecharModal(elementos.modalEntrega);
    renderizarTudo();
    notificar("Compra recebida, estoque do CD alimentado e envio para filial criado.");
}

function abrirModalConfirmarRecebimento(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = filialAtual();
    if (!pedido || pedido.situacao !== "em_transito" || !filial || pedido.filialId !== filial.id) return;

    const itensEnviados = itensDoPedido(pedido).filter((item) => (item.situacao || pedido.situacao) === "em_transito");
    if (!itensEnviados.length) return;

    pedidoEmConfirmacaoId = pedido.id;
    elementos.listaConfirmacaoRecebimento.innerHTML = itensDoPedido(pedido).map((item) => {
        const situacao = item.situacao || pedido.situacao;
        const enviado = situacao === "em_transito";
        const descricao = enviado
            ? "Enviado pelo CD — confirme o recebimento deste item."
            : `Não será enviado: ${item.observacaoMatriz || "item cancelado pelo CD."}`;
        return `<article class="item-analise-pedido"><div class="item-analise-informacoes"><strong>${escaparHTML(item.produtoNome)}</strong><span>Solicitado: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)}</span><span>${escaparHTML(descricao)}</span></div><div class="item-analise-acoes"><span class="selo-tipo ${classeSituacaoPedido(situacao)}">${enviado ? "Enviado" : textoSituacaoPedido(situacao)}</span></div></article>`;
    }).join("");
    abrirModal(elementos.modalConfirmarRecebimento);
}

function abrirModalDetalhesPedido(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = filialAtual();
    if (!pedido || !filial || pedido.filialId !== filial.id) return;

    elementos.tituloModalDetalhesPedido.textContent = `Pedido de ${formatarData(pedido.criadoEm)}`;
    elementos.resumoDetalhesPedido.textContent = pedido.observacao || "Sem observação geral.";
    elementos.listaDetalhesPedido.innerHTML = itensDoPedido(pedido).map((item) => {
        const situacao = item.situacao || pedido.situacao || "pendente";
        const foiEnviado = ["em_transito", "recebido"].includes(situacao);
        const quantidadeEnviada = foiEnviado ? (item.quantidadeEnviada || item.quantidadeSolicitada) : 0;
        const confirmadoEm = item.recebidoEm || (situacao === "recebido" ? pedido.recebidoEm : null);
        const descricao = foiEnviado
            ? situacao === "recebido" ? "Recebido pela filial." : "Enviado pelo CD e aguardando confirmação."
            : {
                recusado: "Não enviado: item recusado pelo CD.",
                aguardando_compra: "Não enviado: aguardando compra pelo CD.",
                pendente: "Não enviado: aguardando análise do CD."
            }[situacao] || "Não enviado pelo CD.";
        return `
            <article class="item-detalhes-pedido">
                <div>
                    <strong>${escaparHTML(item.produtoNome)}</strong>
                    <span>Solicitado: ${formatarNumero(item.quantidadeSolicitada)} ${escaparHTML(item.unidade)} · Enviado: ${formatarNumero(quantidadeEnviada)} ${escaparHTML(item.unidade)}</span>
                    <span>Estoque informado pela filial: ${formatarNumero(item.estoqueInformado)} ${escaparHTML(item.unidade)}</span>
                    <span>${escaparHTML(descricao)}</span>
                </div>
                <div class="acoes-item-detalhes">
                    <span class="selo-tipo ${foiEnviado ? "tipo-aprovado" : classeSituacaoPedido(situacao)}">${foiEnviado ? "Enviado" : "Não enviado"}</span>
                    ${situacao === "em_transito" ? `<button type="button" class="botao-acao acao-aprovar" data-acao="confirmar-recebimento-item" data-pedido-id="${pedido.id}" data-produto-id="${item.produtoId}">Confirmar item</button>` : ""}
                    ${confirmadoEm ? `<span class="data-recebimento-item">Confirmado em<br>${formatarData(confirmadoEm)}</span>` : ""}
                </div>
            </article>
        `;
    }).join("");
    abrirModal(elementos.modalDetalhesPedido);
}

async function confirmarRecebimentoItem(pedidoId, produtoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = filialAtual();
    const item = pedido && itensDoPedido(pedido).find((registro) => registro.produtoId === produtoId);
    if (!pedido || !item || (item.situacao || pedido.situacao) !== "em_transito" || !filial || pedido.filialId !== filial.id) return;

    if (clienteSupabase) {
        const { error } = await clienteSupabase.rpc("confirmar_recebimento_item_pedido", { p_pedido_id: pedido.id, p_produto_id: item.produtoId });
        if (error) {
            console.error(error);
            notificar(`Não foi possível confirmar o item: ${error.message}`, "erro");
            return;
        }
        await carregarDadosSupabase();
        abrirModalDetalhesPedido(pedido.id);
        notificar("Recebimento do item confirmado.");
        return;
    }

    const produto = buscarProduto(item.produtoId);
    if (!produto) return;
    const agora = new Date().toISOString();
    const chave = chaveEstoqueFilial(pedido.filialId, produto.id);
    const registroAtual = estado.estoqueFiliais[chave];
    const saldoAtual = numeroInteiroNaoNegativo(registroAtual?.quantidade ?? registroAtual ?? item.estoqueInformado);
    estado.estoqueFiliais[chave] = { quantidade: saldoAtual + (item.quantidadeEnviada || item.quantidadeSolicitada), atualizadoEm: agora };
    item.situacao = "recebido";
    item.recebidoEm = agora;
    atualizarSituacaoDoPedido(pedido);
    if (pedido.situacao === "recebido") {
        pedido.recebidoEm = agora;
        pedido.observacaoMatriz = pedido.observacaoMatriz || "Todos os itens enviados foram recebidos pela filial.";
    }
    salvarEstado();
    renderizarTudo();
    abrirModalDetalhesPedido(pedido.id);
    notificar("Recebimento do item confirmado.");
}

async function confirmarItensEnviados(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = filialAtual();
    if (!pedido || pedido.situacao !== "em_transito" || !filial || pedido.filialId !== filial.id) return;

    if (clienteSupabase) {
        const { error } = await clienteSupabase.rpc("confirmar_recebimento_pedido", { p_pedido_id: pedido.id });
        if (error) {
            console.error(error);
            notificar(`Não foi possível confirmar o recebimento: ${error.message}`, "erro");
            return;
        }

        fecharModal(elementos.modalConfirmarRecebimento);
        pedidoEmConfirmacaoId = "";
        await carregarDadosSupabase();
        notificar("Recebimento dos itens enviados confirmado.");
        return;
    }

    const agora = new Date().toISOString();
    itensDoPedido(pedido).filter((item) => (item.situacao || pedido.situacao) === "em_transito").forEach((item) => {
        const produto = buscarProduto(item.produtoId);
        if (!produto) return;
        const chave = chaveEstoqueFilial(pedido.filialId, produto.id);
        const registroAtual = estado.estoqueFiliais[chave];
        const saldoAtual = numeroInteiroNaoNegativo(registroAtual?.quantidade ?? registroAtual ?? item.estoqueInformado);
        estado.estoqueFiliais[chave] = { quantidade: saldoAtual + item.quantidadeSolicitada, atualizadoEm: agora };
        item.situacao = "recebido";
    });

    atualizarSituacaoDoPedido(pedido);
    pedido.recebidoEm = agora;
    pedido.observacaoMatriz = pedido.observacaoMatriz || "Pedido recebido pela filial.";
    salvarEstado();
    fecharModal(elementos.modalConfirmarRecebimento);
    pedidoEmConfirmacaoId = "";
    renderizarTudo();
    notificar("Recebimento dos itens enviados confirmado.");
}

function confirmarRecebimentoPedido(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    const filial = filialAtual();

    if (!pedido || pedido.situacao !== "em_transito" || !filial || pedido.filialId !== filial.id) return;

    const confirmou = window.confirm("Confirmar que todos os produtos deste pedido chegaram na filial?");

    if (!confirmou) return;

    const agora = new Date().toISOString();

    itensDoPedido(pedido).filter((item) => (item.situacao || pedido.situacao) === "em_transito").forEach((item) => {
        const produto = buscarProduto(item.produtoId);
        if (!produto) return;

        const chave = chaveEstoqueFilial(pedido.filialId, produto.id);
        const registroAtual = estado.estoqueFiliais[chave];
        const saldoAtual = numeroInteiroNaoNegativo(registroAtual?.quantidade ?? registroAtual ?? item.estoqueInformado);

        estado.estoqueFiliais[chave] = {
            quantidade: saldoAtual + item.quantidadeSolicitada,
            atualizadoEm: agora
        };
    });

    itensDoPedido(pedido).filter((item) => (item.situacao || pedido.situacao) === "em_transito").forEach((item) => { item.situacao = "recebido"; });
    atualizarSituacaoDoPedido(pedido);
    pedido.recebidoEm = agora;
    pedido.observacaoMatriz = pedido.observacaoMatriz || "Pedido recebido pela filial.";
    salvarEstado();
    renderizarTudo();
    notificar("Recebimento confirmado. Estoque da filial atualizado.");
}

function marcarAguardandoCompra(pedidoId, dataCompra) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !itensEmAcao(pedido).some((item) => (item.situacao || pedido.situacao) === "pendente")) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataCompra) || Number.isNaN(new Date(`${dataCompra}T12:00:00`).getTime())) {
        elementos.mensagemEntrega.textContent = "Escolha uma data válida para a chegada no CD.";
        return;
    }

    itensEmAcao(pedido).forEach((item) => { item.situacao = "aguardando_compra"; });
    atualizarSituacaoDoPedido(pedido);
    pedido.compraPrevista = dataCompra;
    pedido.observacaoMatriz = `Aguardando compra. Chegada prevista no CD: ${formatarDataSimples(dataCompra)}.`;
    pedido.analisadoEm = new Date().toISOString();
    salvarEstado();
    fecharModal(elementos.modalEntrega);
    renderizarTudo();
    notificar("Pedido marcado como aguardando compra.");
}

async function recusarPedido(pedidoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);

    if (!pedido || !["pendente", "aguardando_compra"].includes(pedido.situacao)) return;

    const motivo = window.prompt("Informe o motivo da recusa:");

    if (motivo === null) return;

    const observacaoMatriz = motivo.trim() || "Pedido recusado pelo CD.";
    const analisadoEm = new Date().toISOString();

    if (clienteSupabase && usuarioEhCD()) {
        const { data, error } = await clienteSupabase.from("pedidos")
            .update({
                situacao: "recusado",
                observacao_matriz: observacaoMatriz,
                analisado_em: analisadoEm,
                atualizado_em: analisadoEm
            })
            .eq("id", pedido.id)
            .eq("atualizado_em", pedido.atualizadoEm)
            .select("id");

        if (error) {
            console.error(error);
            notificar(`Não foi possível recusar o pedido: ${error.message}`, "erro");
            return;
        }

        if (!data?.length) {
            await carregarDadosSupabase();
            notificar("O pedido foi alterado por outra sessão. Os dados foram atualizados; tente novamente.", "erro");
            return;
        }

        await carregarDadosSupabase();
        notificar("Pedido recusado.");
        return;
    }

    pedido.situacao = "recusado";
    pedido.observacaoMatriz = observacaoMatriz;
    pedido.analisadoEm = analisadoEm;
    salvarEstado();
    renderizarTudo();
    notificar("Pedido recusado.");
}

async function recusarItemPedido(pedidoId, produtoId) {
    const pedido = estado.pedidos.find((item) => item.id === pedidoId);
    if (!pedido) {
        notificar("Não foi possível localizar o pedido. Atualize a página e tente novamente.", "erro");
        return;
    }

    const item = itensDoPedido(pedido).find((registro) => String(registro.produtoId) === String(produtoId));
    if (!item) {
        notificar("Não foi possível localizar o item do pedido. Atualize a página e tente novamente.", "erro");
        return;
    }

    const situacao = item.situacao || pedido.situacao || "pendente";
    if (!["pendente", "aguardando_compra"].includes(situacao)) {
        notificar("Este item já foi analisado e não pode ser recusado.", "erro");
        return;
    }

    const motivo = window.prompt(`Informe o motivo da recusa de ${item.produtoNome}:`);
    if (motivo === null) return;

    const observacaoMatriz = motivo.trim() || "Item recusado pelo CD.";
    const atualizadoEmAnterior = pedido.atualizadoEm;

    if (clienteSupabase && usuarioEhCD()) {
        const { data: itemAtualizado, error: erroItem } = await clienteSupabase.from("pedido_itens")
            .update({ situacao: "recusado", observacao_matriz: observacaoMatriz })
            .eq("pedido_id", pedido.id)
            .eq("produto_id", item.produtoId)
            .select("pedido_id");

        if (erroItem || !itemAtualizado?.length) {
            if (erroItem) console.error(erroItem);
            notificar(erroItem ? `Não foi possível recusar o item: ${erroItem.message}` : "Não foi possível localizar o item para recusa. Atualize a página e tente novamente.", "erro");
            return;
        }

        item.situacao = "recusado";
        item.observacaoMatriz = observacaoMatriz;
        atualizarSituacaoDoPedido(pedido);
        pedido.analisadoEm = new Date().toISOString();

        const { data, error: erroPedido } = await clienteSupabase.from("pedidos")
            .update({ situacao: pedido.situacao, analisado_em: pedido.analisadoEm, atualizado_em: pedido.atualizadoEm })
            .eq("id", pedido.id)
            .eq("atualizado_em", atualizadoEmAnterior)
            .select("id");

        if (erroPedido || !data?.length) {
            if (erroPedido) console.error(erroPedido);
            await carregarDadosSupabase();
            notificar(erroPedido ? `O item foi recusado, mas não foi possível atualizar o pedido: ${erroPedido.message}` : "O item foi recusado, mas o pedido foi alterado em outra sessão. Os dados foram atualizados.", "erro");
            return;
        }

        await carregarDadosSupabase();
        notificar("Item recusado.");
        return;
    }

    item.situacao = "recusado";
    item.observacaoMatriz = observacaoMatriz;
    atualizarSituacaoDoPedido(pedido);
    salvarEstado();
    renderizarTudo();
    notificar("Item recusado.");
}

function exportarBackup() {
    const backup = {
        ...estado,
        exportadoEm: new Date().toISOString(),
        aplicacao: "Estoque Therapeutica"
    };
    const arquivo = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    const data = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `backup-therapeutica-${data}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notificar("Backup baixado com sucesso.");
}

async function importarBackup(evento) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) return;

    try {
        const conteudo = await arquivo.text();
        const dados = JSON.parse(conteudo);

        if (!dados || typeof dados !== "object") {
            throw new Error("Arquivo inválido");
        }

        const confirmou = window.confirm("Importar este backup substituirá os dados atuais deste navegador. Deseja continuar?");

        if (!confirmou) return;

        estado = normalizarEstado(dados);
        salvarEstado();

        renderizarTudo();
        navegar("dashboard");
        notificar("Backup importado com sucesso.");
    } catch {
        notificar("Não foi possível importar esse arquivo JSON.", "erro");
    } finally {
        evento.target.value = "";
    }
}

function limparDados() {
    const confirmou = window.confirm("Limpar todos os produtos, pedidos e histórico deste protótipo? Esta ação não pode ser desfeita sem um backup.");

    if (!confirmou) return;

    localStorage.removeItem(STORAGE_KEY);
    carregarDadosSupabase();
    produtoSelecionadoMovimentacao = "";

    renderizarTudo();
    navegar("dashboard");
    notificar("Dados locais removidos.");
}

function carregarDadosDemo() {
    const confirmou = window.confirm("Carregar dados de demonstração? Isso substituirá produtos, pedidos e histórico salvos neste navegador.");

    if (!confirmou) return;

    estado = criarEstadoDemo();
    salvarEstado();
    produtoSelecionadoMovimentacao = "";
    itensDoPedidoAtual = [];

    renderizarTudo();
    navegar("dashboard");
    notificar("Dados de demonstração carregados.");
}

function lidarComAcao(acao, elemento) {
    switch (acao) {
        case "novo-produto":
            abrirModalProduto();
            break;
        case "nova-entrada":
            navegar("movimentacao", { tipoMovimentacao: "entrada" });
            break;
        case "ver-historico":
            navegar("historico");
            break;
        case "ver-alertas":
            navegar("estoque-baixo");
            break;
        case "movimentar":
            navegar("movimentacao", {
                tipoMovimentacao: elemento.dataset.tipo,
                produtoId: elemento.dataset.produtoId
            });
            break;
        case "editar-produto":
            abrirModalProduto(elemento.dataset.produtoId);
            break;
        case "editar-usuario":
            abrirModalUsuario(elemento.dataset.usuarioId);
            break;
        case "arquivar-produto":
            arquivarProduto(elemento.dataset.produtoId);
            break;
        case "novo-pedido":
            abrirModalPedido();
            break;
        case "novo-pedido-filial":
            abrirModalPedido(elemento.dataset.filialId);
            break;
        case "abrir-portal-filial":
            portalAtual = elemento.dataset.filialId;
            elementos.seletorPortal.value = portalAtual;
            itensDoPedidoAtual = [];
            navegar("portal-filial");
            break;
        case "consultar-estoque-filial":
            abrirModalEstoqueFilial(elemento.dataset.filialId);
            break;
        case "abrir-novo-pedido-filial":
            navegar("novo-pedido-filial");
            break;
        case "remover-item-pedido":
            itensDoPedidoAtual.splice(Number(elemento.dataset.indiceItem), 1);
            renderizarCarrinhoPedido();
            break;
        case "analisar-pedido":
            abrirModalAnalisarPedido(elemento.dataset.pedidoId);
            break;
        case "consultar-pedido":
            abrirModalAnalisarPedido(elemento.dataset.pedidoId);
            break;
        case "aprovar-item-pedido":
    itensSelecionadosPedido = [elemento.dataset.produtoId];
            abrirModalEntrega(elemento.dataset.pedidoId);
            break;
        case "comprar-item-pedido":
            itensSelecionadosPedido = [elemento.dataset.produtoId];
            abrirModalCompra(elemento.dataset.pedidoId);
            break;
        case "receber-compra-item-pedido":
            itensSelecionadosPedido = [elemento.dataset.produtoId];
            abrirModalReceberCompra(elemento.dataset.pedidoId);
            break;
        case "recusar-item-pedido":
            recusarItemPedido(elemento.dataset.pedidoId, elemento.dataset.produtoId);
            break;
        case "aprovar-pedido":
            abrirModalEntrega(elemento.dataset.pedidoId);
            break;
        case "aguardar-compra":
            abrirModalCompra(elemento.dataset.pedidoId);
            break;
        case "receber-compra":
            abrirModalReceberCompra(elemento.dataset.pedidoId);
            break;
        case "confirmar-recebimento-item":
            confirmarRecebimentoItem(elemento.dataset.pedidoId, elemento.dataset.produtoId);
            break;
        case "ver-detalhes-pedido":
            abrirModalDetalhesPedido(elemento.dataset.pedidoId);
            break;
        case "recusar-pedido":
            recusarPedido(elemento.dataset.pedidoId);
            break;
        default:
            break;
    }
}

elementos.navegacao.forEach((item) => {
    item.addEventListener("click", () => {
        navegar(item.dataset.pagina, { tipoMovimentacao: item.dataset.tipoMovimentacao });
    });
});

document.addEventListener("click", (evento) => {
    const fechar = evento.target.closest("[data-fechar-modal]");

    if (fechar) {
        const modal = document.querySelector(`#${fechar.dataset.fecharModal}`);
        if (modal) fecharModal(modal);
        return;
    }

    const botaoAcao = evento.target.closest("[data-acao]");
    if (botaoAcao) {
        lidarComAcao(botaoAcao.dataset.acao, botaoAcao);
    }
});

elementos.listaAnalisarPedido?.addEventListener("click", (evento) => {
    const botaoRecusar = evento.target.closest('[data-acao="recusar-item-pedido"]');
    if (!botaoRecusar) return;

    evento.stopPropagation();
    recusarItemPedido(botaoRecusar.dataset.pedidoId, botaoRecusar.dataset.produtoId);
});

[elementos.modalProduto, elementos.modalPedido, elementos.modalEntrega, elementos.modalAnalisarPedido, elementos.modalUsuario, elementos.modalEstoqueFilial, elementos.modalDetalhesPedido].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) fecharModal(modal);
    });
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharModal(elementos.modalProduto);
        fecharModal(elementos.modalPedido);
        fecharModal(elementos.modalEntrega);
        fecharModal(elementos.modalAnalisarPedido);
        fecharModal(elementos.modalUsuario);
        fecharModal(elementos.modalEstoqueFilial);
        fecharModal(elementos.modalDetalhesPedido);
    }
});

elementos.buscaProdutos.addEventListener("input", renderizarProdutos);
elementos.filtroCategoria.addEventListener("change", renderizarProdutos);
elementos.buscaHistorico.addEventListener("input", renderizarHistorico);
elementos.filtroHistorico.addEventListener("change", renderizarHistorico);
elementos.filtroStatusPedidos.addEventListener("change", renderizarPedidos);
elementos.filtroStatusMeusPedidos.addEventListener("change", renderizarPortalFilial);
elementos.movimentoProduto.addEventListener("change", () => {
    produtoSelecionadoMovimentacao = elementos.movimentoProduto.value;
    atualizarInformacaoProdutoMovimento();
    atualizarBotaoCadastrarProdutoXml();
});
elementos.movimentoXml.addEventListener("change", importarXmlMovimentacao);
elementos.movimentoItemXml.addEventListener("change", () => preencherItemXmlMovimentacao(elementos.movimentoItemXml.value));
elementos.botaoRemoverXml.addEventListener("click", () => limparImportacaoXml());
elementos.botaoCadastrarProdutoXml.addEventListener("click", abrirCadastroProdutoDoXml);

elementos.formularioProduto.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const id = elementos.produtoId.value;
    const nome = elementos.produtoNome.value.trim();
    const codigo = elementos.produtoCodigo.value.trim();
    const categoria = elementos.produtoCategoria.value;
    const unidade = elementos.produtoUnidade.value;
    const quantidade = numeroInteiroNaoNegativo(elementos.produtoQuantidade.value);
    const estoqueMinimo = numeroInteiroNaoNegativo(elementos.produtoMinimo.value);

    if (!nome || !categoria || !unidade) {
        elementos.mensagemProduto.textContent = "Preencha todos os campos obrigatórios.";
        return;
    }

    const duplicado = produtosAtivos().find((produto) => produto.id !== id && produto.nome.toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR"));

    if (duplicado) {
        elementos.mensagemProduto.textContent = "Já existe um produto ativo com esse nome.";
        return;
    }

    if (id) {
        const produto = buscarProduto(id);
        if (!produto) return;

        produto.codigo = codigo;
        produto.nome = nome;
        produto.categoria = categoria;
        produto.estoqueMinimo = estoqueMinimo;
        produto.unidade = unidade;
        produto.atualizadoEm = new Date().toISOString();
        salvarEstado();
        fecharModal(elementos.modalProduto);
        renderizarTudo();
        notificar("Produto atualizado.");
        return;
    }

    const produto = {
        id: gerarId("prod"),
        codigo,
        nome,
        categoria,
        quantidade,
        estoqueMinimo,
        unidade,
        ativo: true,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        arquivadoEm: null
    };

    const produtoSalvo = produto;
    estado.produtos.push(produtoSalvo);

    if (quantidade > 0) {
        registrarMovimentacao({
            produto: produtoSalvo,
            tipo: "entrada",
            quantidade,
            saldoAntes: 0,
            saldoDepois: quantidade,
            observacao: "Estoque inicial no cadastro do produto."
        });
    }

    await salvarEstado();
    fecharModal(elementos.modalProduto);
    renderizarTudo();
    if (Number.isInteger(indiceItemXmlSelecionado)) {
        preencherItemXmlMovimentacao(indiceItemXmlSelecionado);
    }
    notificar("Produto cadastrado com sucesso.");
});

elementos.formularioMovimentacao.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const produto = buscarProduto(elementos.movimentoProduto.value);
    const quantidade = Number(elementos.movimentoQuantidade.value);
    const observacao = elementos.movimentoObservacao.value.trim();
    const filial = tipoMovimentacaoAtual === "saida" ? buscarFilial(elementos.movimentoFilial.value) : null;

    elementos.mensagemMovimentacao.textContent = "";

    if (!produto || !produto.ativo) {
        elementos.mensagemMovimentacao.textContent = "Selecione um produto válido.";
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
        elementos.mensagemMovimentacao.textContent = "Informe uma quantidade inteira maior que zero.";
        return;
    }

    if (tipoMovimentacaoAtual === "saida" && quantidade > produto.quantidade) {
        elementos.mensagemMovimentacao.textContent = "A saída não pode ser maior que o estoque disponível no CD.";
        return;
    }

    const saldoAntes = produto.quantidade;
    produto.quantidade += tipoMovimentacaoAtual === "entrada" ? quantidade : -quantidade;
    produto.atualizadoEm = new Date().toISOString();

    if (filial) {
        const chave = chaveEstoqueFilial(filial.id, produto.id);
        const estoqueAtual = numeroInteiroNaoNegativo(estado.estoqueFiliais[chave]?.quantidade ?? estado.estoqueFiliais[chave]);
        estado.estoqueFiliais[chave] = {
            quantidade: estoqueAtual + quantidade,
            atualizadoEm: produto.atualizadoEm
        };
    }

    registrarMovimentacao({
        produto,
        tipo: filial ? "transferencia" : tipoMovimentacaoAtual,
        quantidade,
        saldoAntes,
        saldoDepois: produto.quantidade,
        observacao,
        filialId: filial?.id || ""
    });

    salvarEstado();
    elementos.movimentoQuantidade.value = "";
    elementos.movimentoFilial.value = "";
    elementos.movimentoObservacao.value = "";
    limparImportacaoXml(false);
    renderizarTudo();
    notificar(tipoMovimentacaoAtual === "entrada" ? "Entrada registrada." : "Saída registrada.");
});

elementos.formularioPedido.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const filial = buscarFilial(elementos.pedidoFilial.value);
    const produto = buscarProduto(elementos.pedidoProduto.value);
    const estoqueInformado = Number(elementos.pedidoEstoqueAtual.value);
    const quantidadeSolicitada = Number(elementos.pedidoQuantidade.value);
    const observacao = elementos.pedidoObservacao.value.trim();

    elementos.mensagemPedido.textContent = "";

    if (!filial || !produto || !produto.ativo) {
        elementos.mensagemPedido.textContent = "Selecione uma filial e um produto válidos.";
        return;
    }

    if (!Number.isInteger(estoqueInformado) || estoqueInformado < 0 || !Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada <= 0) {
        elementos.mensagemPedido.textContent = "Informe números inteiros válidos para o estoque atual e a quantidade solicitada.";
        return;
    }

    estado.pedidos.unshift({
        id: gerarId("ped"),
        filialId: filial.id,
        itens: [{
            produtoId: produto.id,
            produtoNome: produto.nome,
            unidade: produto.unidade,
            estoqueInformado,
            quantidadeSolicitada,
            observacao: ""
        }],
        observacao,
        observacaoMatriz: "",
        situacao: "pendente",
        criadoEm: new Date().toISOString(),
        analisadoEm: null,
        atualizadoEm: agora
    });

    salvarEstado();
    fecharModal(elementos.modalPedido);
    renderizarTudo();
    notificar("Pedido enviado para análise do CD.");
});

elementos.formularioEntrega.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dia = String(elementos.entregaDia.value).padStart(2, "0");
    const mes = String(elementos.entregaMes.value).padStart(2, "0");
    const ano = elementos.entregaAno.value;
    const ultimoDia = new Date(Number(ano), Number(mes), 0).getDate();

    elementos.mensagemEntrega.textContent = "";

    if (Number(dia) > ultimoDia) {
        elementos.mensagemEntrega.textContent = "Este mês não possui esse dia. Escolha outra data.";
        return;
    }

    const dataSelecionada = `${ano}-${mes}-${dia}`;

    if (elementos.entregaModo.value === "compra") {
        marcarAguardandoCompra(elementos.entregaPedidoId.value, dataSelecionada);
        return;
    }

    if (elementos.entregaModo.value === "receber_compra") {
        receberCompraMatriz(elementos.entregaPedidoId.value, dataSelecionada);
        return;
    }

    aprovarPedido(elementos.entregaPedidoId.value, dataSelecionada, elementos.campoEntregaQuantidade.hidden ? null : elementos.entregaQuantidade.value);
});

elementos.seletorPortal.addEventListener("change", () => {
    portalAtual = elementos.seletorPortal.value;
    itensDoPedidoAtual = [];
    navegar(estaNoPortalFilial() ? "portal-filial" : "dashboard");
});

elementos.itemPedidoProduto.addEventListener("change", atualizarEstoqueAtualDoItemPedido);

elementos.formularioItemPedido.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const filial = filialAtual();
    const produto = buscarProduto(elementos.itemPedidoProduto.value);
    const estoqueInformado = Number(elementos.itemPedidoEstoque.value);
    const quantidadeSolicitada = Number(elementos.itemPedidoQuantidade.value);
    const observacao = elementos.itemPedidoObservacao.value.trim();

    elementos.mensagemItemPedido.textContent = "";

    if (!filial || !produto || !produto.ativo) {
        elementos.mensagemItemPedido.textContent = "Selecione um produto válido.";
        return;
    }

    if (!Number.isInteger(estoqueInformado) || estoqueInformado < 0 || !Number.isInteger(quantidadeSolicitada) || quantidadeSolicitada <= 0) {
        elementos.mensagemItemPedido.textContent = "Informe quantidades inteiras válidas.";
        return;
    }

    if (itensDoPedidoAtual.some((item) => item.produtoId === produto.id)) {
        elementos.mensagemItemPedido.textContent = "Esse produto já está na lista. Remova-o para informar uma quantidade diferente.";
        return;
    }

    itensDoPedidoAtual.push({
        produtoId: produto.id,
        produtoNome: produto.nome,
        unidade: produto.unidade,
        estoqueInformado,
        quantidadeSolicitada,
        observacao
    });

    elementos.formularioItemPedido.reset();
    atualizarEstoqueAtualDoItemPedido();
    renderizarCarrinhoPedido();
});

elementos.botaoLimparCarrinho.addEventListener("click", () => {
    itensDoPedidoAtual = [];
    elementos.mensagemPedidoFilial.textContent = "";
    renderizarCarrinhoPedido();
});

elementos.botaoEnviarPedidoLista.addEventListener("click", async () => {
    const filial = filialAtual();
    const observacao = elementos.observacaoPedidoCompleto.value.trim();

    elementos.mensagemPedidoFilial.textContent = "";

    if (!filial) {
        elementos.mensagemPedidoFilial.textContent = "Selecione uma filial antes de enviar o pedido.";
        return;
    }

    if (!itensDoPedidoAtual.length) {
        elementos.mensagemPedidoFilial.textContent = "Adicione pelo menos um item à lista.";
        return;
    }

    const itens = itensDoPedidoAtual.map((item) => ({ ...item }));
    const agora = new Date().toISOString();

    const pedido = {
        id: gerarId("ped"),
        filialId: filial.id,
        itens,
        observacao,
        observacaoMatriz: "",
        situacao: "pendente",
        criadoEm: agora,
        analisadoEm: null,
        atualizadoEm: agora
    };

    if (clienteSupabase && !usuarioEhCD()) {
        const { error: erroPedido } = await clienteSupabase.from("pedidos").insert(pedidoParaBanco(pedido));

        if (erroPedido) {
            console.error(erroPedido);
            elementos.mensagemPedidoFilial.textContent = `Não foi possível enviar o pedido: ${erroPedido.message}`;
            return;
        }

        const { error: erroItens } = await clienteSupabase.from("pedido_itens").upsert(itensParaBanco([pedido]));

        if (erroItens) {
            console.error(erroItens);
            elementos.mensagemPedidoFilial.textContent = `O pedido foi criado, mas os itens não puderam ser gravados: ${erroItens.message}`;
            await carregarDadosSupabase();
            return;
        }

        idsPedidosRemotos.add(pedido.id);
        itensDoPedidoAtual = [];
        elementos.observacaoPedidoCompleto.value = "";
        await carregarDadosSupabase();
        notificar("Lista de pedido enviada para o CD.");
        navegar("meus-pedidos");
        return;
    }

    estado.pedidos.unshift(pedido);

    itensDoPedidoAtual = [];
    elementos.observacaoPedidoCompleto.value = "";
    salvarEstado();
    renderizarTudo();
    notificar("Lista de pedido enviada para o CD.");
    navegar("meus-pedidos");
});

elementos.botaoSair.addEventListener("click", async () => {
    if (!clienteSupabase) return;
    await clienteSupabase.auth.signOut();
    window.location.replace("./login.html");
});

elementos.usuarioPapel.addEventListener("change", () => {
    const administrador = elementos.usuarioPapel.value === "cd_admin";
    elementos.usuarioFilial.disabled = administrador;
    if (administrador) elementos.usuarioFilial.value = "";
});

elementos.formularioUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const papel = elementos.usuarioPapel.value;
    const filialId = papel === "cd_admin" ? null : elementos.usuarioFilial.value;
    if (papel === "filial" && !filialId) { elementos.mensagemUsuario.textContent = "Selecione a filial do usuário."; return; }
    const { error } = await clienteSupabase.from("usuarios").update({ nome: elementos.usuarioNome.value.trim(), papel, filial_id: filialId }).eq("id", elementos.usuarioId.value);
    if (error) { console.error(error); elementos.mensagemUsuario.textContent = "Não foi possível salvar as alterações."; return; }
    fecharModal(elementos.modalUsuario);
    notificar("Usuário atualizado.");
    await carregarUsuarios();
});
elementos.botaoExportar.addEventListener("click", exportarBackup);
elementos.arquivoImportar.addEventListener("change", importarBackup);
elementos.botaoDadosDemo.addEventListener("click", carregarDadosDemo);
elementos.botaoLimparDados.addEventListener("click", limparDados);

elementos.seletorPortal.value = portalAtual;
navegar("dashboard");

async function iniciarAplicacaoAutenticada() {
    if (!conectarSupabase()) { notificar("Não foi possível carregar o serviço do Supabase.", "erro"); return; }
    const { data: { session } } = await clienteSupabase.auth.getSession();
    if (!session) { window.location.replace("./login.html"); return; }
    usuarioAtual = session.user;
    const { data: perfil, error } = await clienteSupabase.from("usuarios")
        .select("id, nome, papel, filial_id")
        .eq("id", usuarioAtual.id)
        .single();
    if (error || !perfil) { console.error(error); notificar("Perfil não encontrado. Execute supabase/reparar-perfis.sql no SQL Editor e defina o administrador.", "erro"); return; }
    perfilAtual = perfil;
    aplicarPermissoesDoUsuario();
    const navegacaoSalva = recuperarNavegacaoAtual();
    if (usuarioEhCD() && navegacaoSalva?.portal && [CENTRO_DISTRIBUICAO_ID, ...estado.filiais.map((filial) => filial.id)].includes(navegacaoSalva.portal)) {
        portalAtual = navegacaoSalva.portal;
        elementos.seletorPortal.value = portalAtual;
    }
    navegar(navegacaoSalva?.pagina || (usuarioEhCD() ? "dashboard" : "portal-filial"), { tipoMovimentacao: navegacaoSalva?.tipoMovimentacao });
    await carregarDadosSupabase();
    await carregarUsuarios();
    clienteSupabase.channel("estoque-em-tempo-real")
        .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, carregarDadosSupabase)
        .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, carregarDadosSupabase)
        .on("postgres_changes", { event: "*", schema: "public", table: "pedido_itens" }, carregarDadosSupabase)
        .on("postgres_changes", { event: "*", schema: "public", table: "estoque_filiais" }, carregarDadosSupabase)
        .on("postgres_changes", { event: "*", schema: "public", table: "movimentacoes" }, carregarDadosSupabase)
        .subscribe();
    clienteSupabase.auth.onAuthStateChange((_evento, sessao) => { if (!sessao) window.location.replace("./login.html"); });
}

window.addEventListener("online", () => carregarDadosSupabase());
window.addEventListener("load", iniciarAplicacaoAutenticada);

if (false) window.addEventListener("load", () => {
    if (conectarSupabase()) {
        carregarDadosSupabase();
    } else {
        notificar("Supabase não carregou. A interface continua disponível com os dados locais.", "erro");
    }
});
