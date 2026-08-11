const CHAVE_MANTER_CONECTADO = "therapeutica-manter-conectado";

function manterSessaoEntreNavegacoes() {
    return localStorage.getItem(CHAVE_MANTER_CONECTADO) === "true" || sessionStorage.getItem(CHAVE_MANTER_CONECTADO) !== "false";
}

function configurarPersistenciaSessao(manterConectado) {
    if (manterConectado) {
        localStorage.setItem(CHAVE_MANTER_CONECTADO, "true");
        sessionStorage.removeItem(CHAVE_MANTER_CONECTADO);
    } else {
        localStorage.removeItem(CHAVE_MANTER_CONECTADO);
        sessionStorage.setItem(CHAVE_MANTER_CONECTADO, "false");
    }
    window.therapeuticaSupabase = null;
}

function obterClienteSupabase() {
    if (!window.supabase?.createClient) {
        console.error("Biblioteca do Supabase não foi carregada. Verifique bloqueadores de conteúdo ou a conexão com o CDN.");
        return null;
    }
    const config = window.APP_CONFIG;
    if (!config?.SUPABASE_URL || !config?.SUPABASE_PUBLISHABLE_KEY) {
        console.error("Configuração do Supabase ausente. Execute: node scripts/gerar-config.js");
        return null;
    }
    if (!window.therapeuticaSupabase) {
        const armazenamento = manterSessaoEntreNavegacoes() ? localStorage : sessionStorage;
        window.therapeuticaSupabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: true, storage: armazenamento }
        });
    }
    return window.therapeuticaSupabase;
}
