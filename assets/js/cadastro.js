window.location.replace('./login.html');

/*
const btn = document.querySelector('#verSenha');
const btnConfirm = document.querySelector('#verConfirmSenha');
const inputSenha = document.querySelector('#senha');
const inputConfirmSenha = document.querySelector('#confirmarSenha');

function alternarVisibilidade(botao, campoSenha) {
    botao.addEventListener('mousedown', (evento) => evento.preventDefault());

    botao.addEventListener('click', () => {
        const senhaVisivel = campoSenha.type === 'text';

        campoSenha.type = senhaVisivel ? 'password' : 'text';
        botao.classList.toggle('fa-eye-slash', !senhaVisivel);
        botao.classList.toggle('fa-eye', senhaVisivel);
        botao.setAttribute('aria-label', senhaVisivel ? 'Mostrar senha' : 'Ocultar senha');
    });
}

alternarVisibilidade(btn, inputSenha);
alternarVisibilidade(btnConfirm, inputConfirmSenha);

const formulario = document.querySelector('#formulario-cadastro');
const nome = document.querySelector('#usuario');
const email = document.querySelector('#email');
const filial = document.querySelector('#filial');
const mensagem = document.querySelector('#mensagem-cadastro');

formulario?.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (inputSenha.value.length < 8) { mensagem.textContent = 'A senha deve ter pelo menos 8 caracteres.'; return; }
    if (inputSenha.value !== inputConfirmSenha.value) { mensagem.textContent = 'As senhas não coincidem.'; return; }
    const cliente = obterClienteSupabase();
    if (!cliente) { mensagem.textContent = 'Não foi possível carregar o serviço de cadastro.'; return; }
    mensagem.textContent = 'Criando conta...';
    const { error } = await cliente.auth.signUp({
        email: email.value.trim(), password: inputSenha.value,
        options: { data: { nome: nome.value.trim(), filial_id: filial.value } }
    });
    if (error) { mensagem.textContent = error.message; return; }
    mensagem.style.color = '#486b34';
    mensagem.textContent = 'Conta criada. Verifique seu e-mail para confirmar o acesso.';
});
*/
