document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value.trim();
    const elementoMensagem = document.getElementById('mensagem');

    elementoMensagem.textContent = 'Cadastrando...';
    elementoMensagem.className = '';

    try {
        const resposta = await fetch('http://localhost:3001/usuarios/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            elementoMensagem.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
            elementoMensagem.className = 'sucesso';


            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            elementoMensagem.textContent = dados.erro || 'Erro ao cadastrar usuário.';
            elementoMensagem.className = 'erro';
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        elementoMensagem.textContent = 'Não foi possível conectar ao servidor.';
        elementoMensagem.className = 'erro';
    }
});