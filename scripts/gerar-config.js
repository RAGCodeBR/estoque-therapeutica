const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const arquivoEnv = path.join(raiz, ".env.local");
const arquivoSaida = path.join(raiz, "assets", "js", "env.js");

if (!fs.existsSync(arquivoEnv)) {
    throw new Error("Crie o arquivo .env.local antes de gerar a configuração.");
}

const valores = Object.fromEntries(
    fs.readFileSync(arquivoEnv, "utf8")
        .split(/\r?\n/)
        .map((linha) => linha.trim())
        .filter((linha) => linha && !linha.startsWith("#"))
        .map((linha) => {
            const indice = linha.indexOf("=");
            return [linha.slice(0, indice), linha.slice(indice + 1)];
        })
);

if (!valores.SUPABASE_URL || !valores.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY são obrigatórias no .env.local.");
}

const configuracao = {
    SUPABASE_URL: valores.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: valores.SUPABASE_PUBLISHABLE_KEY
};

fs.writeFileSync(arquivoSaida, `window.APP_CONFIG = ${JSON.stringify(configuracao, null, 2)};\n`, "utf8");
console.log("assets/js/env.js gerado com sucesso.");
