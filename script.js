let livros = JSON.parse(localStorage.getItem('livrosSalvos')) || [];

const form = document.getElementById("formLivro");
const tabela = document.getElementById("tabelaLivros");
const inputIndex = document.getElementById("indexLivro");

renderizarTabela();

function salvarLocalStorage(){
    localStorage.setItem('livrosSalvos', JSON.stringify(livros))
}

function renderizarTabela(){
    tabela.innerHTML = "";

    livros.forEach((livro, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${livro.ano}</td>
            <td>
                <button type="button" onclick="prepararEdicao(${index})">Editar</button>
                <button type="button" onclick="excluirLivro(${index})">Excluir</button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

form.addEventListener("submit", function(event){
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const ano = document.getElementById("ano").value;
    const index = inputIndex.value;

    const livro = { titulo, autor, ano };

    if (index === ""){
        livros.push(livro);
    } else {
        livros[index] = livro;
        inputIndex.value = "";
    }

    localStorage.setItem('livrosSalvos', JSON.stringify(livros));
    renderizarTabela();

    form.reset();
});

function excluirLivro(index){
    livros.splice(index, 1);
    localStorage.setItem('livrosSalvos', JSON.stringify(livros));
    renderizarTabela();
}

function prepararEdicao(index){
   
    document.getElementById("titulo").value = livros[index].titulo;
    document.getElementById("autor").value = livros[index].autor;
    document.getElementById("ano").value = livros[index].ano;

    inputIndex.value = index;
}