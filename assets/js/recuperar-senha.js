const formularioRecuperacao = document.querySelector('#formulario-recuperacao');
const emailRecuperacao = document.querySelector('#email-recuperacao');
const mensagemRecuperacao = document.querySelector('#mensagem-recuperacao');

function informarRecuperacao(texto, erro = true) {
    mensagemRecuperacao.textContent = texto;
    mensagemRecuperacao.style.color = erro ? '#a94332' : '#486b34';
}

formularioRecuperacao?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const cliente = obterClienteSupabase();
    if (!cliente) return informarRecuperacao('Não foi possível carregar o serviço de recuperação.');

    const botao = formularioRecuperacao.querySelector('button[type="submit"]');
    botao.disabled = true;
    informarRecuperacao('Enviando link...', false);
    // O e-mail pode ser solicitado durante o desenvolvimento local, mas o link
    // precisa abrir uma página acessível também fora deste computador.
    const destino = 'https://ragcodebr.github.io/estoque-therapeutica/redefinir-senha.html';
    const { error } = await cliente.auth.resetPasswordForEmail(emailRecuperacao.value.trim(), { redirectTo: destino });
    botao.disabled = false;
    if (error) {
        console.error('Falha ao solicitar recuperação de senha:', error);
        return informarRecuperacao(`Não foi possível enviar o e-mail: ${error.message}`);
    }

    informarRecuperacao('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.', false);
});
