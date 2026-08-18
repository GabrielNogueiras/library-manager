const API_URL = "http://localhost:3001/livros";

const form = document.getElementById("formLivro");
const tabela = document.getElementById("tabelaLivros");
const inputIndex = document.getElementById("indexLivro");

carregarLivros();


async function carregarLivros() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Falha na resposta do servidor");
    }

    const livros = await resposta.json();
    renderizarTabela(livros);
  } catch (erro) {
    console.error("Erro ao buscar livros:", erro);
  }
}

function renderizarTabela(livros) {
  tabela.innerHTML = "";

  livros.forEach((livro) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${livro.titulo}</td>
      <td>${livro.autor}</td>
      <td>${livro.ano}</td>
      <td>
        <button type="button" onclick="prepararEdicao('${livro.id}')">Editar</button>
        <button type="button" onclick="excluirLivro('${livro.id}')">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}


form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const autor = document.getElementById("autor").value;
  const ano = document.getElementById("ano").value;
  const id = inputIndex.value;

  const livro = { titulo, autor, ano };

  try {
    if (id === "") {
  
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livro),
      });
    } else {
  
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livro),
      });
      inputIndex.value = "";
    }

    form.reset();
    await carregarLivros(); 
  } catch (erro) {
    console.error("Erro ao salvar livro:", erro);
  }
});


async function excluirLivro(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    await carregarLivros();
  } catch (erro) {
    console.error("Erro ao excluir livro:", erro);
  }
}


async function prepararEdicao(id) {
  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    const livro = await resposta.json();

    document.getElementById("titulo").value = livro.titulo;
    document.getElementById("autor").value = livro.autor;
    document.getElementById("ano").value = livro.ano;

    inputIndex.value = livro.id;
  } catch (erro) {
    console.error("Erro ao buscar livro para edição:", erro);
  }
}