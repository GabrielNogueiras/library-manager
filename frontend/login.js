document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value.trim();
    const elementoMensagem = document.getElementById('mensagem');

    elementoMensagem.textContent = 'Verificando...';
    elementoMensagem.className = '';

    try {
        const resposta = await fetch('http://localhost:3001/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            elementoMensagem.textContent = 'Login realizado com sucesso! Redirecionando...';
            elementoMensagem.className = 'sucesso';

            localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            elementoMensagem.textContent = dados.erro || 'Erro ao fazer login.';
            elementoMensagem.className = 'erro';
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        elementoMensagem.textContent = 'Não foi possível conectar ao servidor.';
        elementoMensagem.className = 'erro';
    }
});