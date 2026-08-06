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
