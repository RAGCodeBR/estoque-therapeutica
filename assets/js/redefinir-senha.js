const formularioNovaSenha = document.querySelector('#formulario-nova-senha');
const novaSenha = document.querySelector('#nova-senha');
const confirmarSenha = document.querySelector('#confirmar-senha');
const mensagemNovaSenha = document.querySelector('#mensagem-nova-senha');

function informarNovaSenha(texto, erro = true) {
    mensagemNovaSenha.textContent = texto;
    mensagemNovaSenha.style.color = erro ? '#a94332' : '#486b34';
}

formularioNovaSenha?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (novaSenha.value !== confirmarSenha.value) return informarNovaSenha('As senhas não coincidem.');
    const cliente = obterClienteSupabase();
    if (!cliente) return informarNovaSenha('Não foi possível carregar o serviço de recuperação.');
    const botao = formularioNovaSenha.querySelector('button[type="submit"]');
    botao.disabled = true;
    informarNovaSenha('Salvando nova senha...', false);
    const { error } = await cliente.auth.updateUser({ password: novaSenha.value });
    if (error) {
        botao.disabled = false;
        return informarNovaSenha('Este link é inválido ou expirou. Solicite um novo link de recuperação.');
    }
    informarNovaSenha('Senha alterada com sucesso. Redirecionando para o login...', false);
    setTimeout(() => window.location.replace('./login.html'), 1800);
});
