const olho = document.querySelector('#botaoOlho');
const senha = document.querySelector('#senhaLogin');

if (olho && senha) {
    olho.addEventListener('mousedown', (evento) => evento.preventDefault());

    olho.addEventListener('click', () => {
        const senhaVisivel = senha.type === 'text';

        senha.type = senhaVisivel ? 'password' : 'text';
        olho.classList.toggle('fa-eye-slash', !senhaVisivel);
        olho.classList.toggle('fa-eye', senhaVisivel);
        olho.setAttribute('aria-label', senhaVisivel ? 'Mostrar senha' : 'Ocultar senha');
    });
}

const formulario = document.querySelector('#formulario-login');
const email = document.querySelector('#email-login');
const mensagem = document.querySelector('#mensagem-login');
const esqueciSenha = document.querySelector('#esqueci-senha');

function informar(texto, erro = true) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? '#a94332' : '#486b34';
}

formulario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const cliente = obterClienteSupabase();
    if (!cliente) return informar('Não foi possível carregar o serviço de login.');
    informar('Entrando...', false);
    const { error } = await cliente.auth.signInWithPassword({ email: email.value.trim(), password: senha.value });
    if (error) return informar('E-mail ou senha inválidos.');
    window.location.replace('./index.html');
});

esqueciSenha?.addEventListener('click', async (evento) => {
    evento.preventDefault();
    const cliente = obterClienteSupabase();
    const endereco = email.value.trim();
    if (!endereco) return informar('Informe seu e-mail para recuperar a senha.');
    const { error } = await cliente.auth.resetPasswordForEmail(endereco, { redirectTo: `${window.location.origin}${window.location.pathname}` });
    informar(error ? 'Não foi possível enviar o e-mail de recuperação.' : 'E-mail de recuperação enviado.', Boolean(error));
});
