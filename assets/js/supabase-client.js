const SUPABASE_URL = "https://vspdodyjzybowlaerrnk.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_syhF57isNxl3VtC1PWfq7w_RgHUnHsO";

function obterClienteSupabase() {
    if (!window.supabase?.createClient) return null;
    if (!window.therapeuticaSupabase) {
        window.therapeuticaSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    }
    return window.therapeuticaSupabase;
}
