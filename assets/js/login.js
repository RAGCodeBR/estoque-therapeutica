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
