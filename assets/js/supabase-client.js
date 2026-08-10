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
        window.therapeuticaSupabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
    }
    return window.therapeuticaSupabase;
}
