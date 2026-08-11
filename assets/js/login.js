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
const manterConectado = document.querySelector('#manter-conectado');

if (manterConectado) {
    manterConectado.checked = manterSessaoEntreNavegacoes();
    manterConectado.addEventListener('change', () => configurarPersistenciaSessao(manterConectado.checked));
}

function informar(texto, erro = true) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? '#a94332' : '#486b34';
}

formulario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    configurarPersistenciaSessao(manterConectado?.checked ?? true);
    const cliente = obterClienteSupabase();
    if (!cliente) return informar('Não foi possível carregar o serviço de login.');
    informar('Entrando...', false);
    const { error } = await cliente.auth.signInWithPassword({ email: email.value.trim(), password: senha.value });
    if (error) return informar('E-mail ou senha inválidos.');
    window.location.replace('./index.html');
});
