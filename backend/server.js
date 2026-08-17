const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

app.use(cors());
app.use(express.json());


let livros = [];

app.get('/livros', (req, res) => {
  res.json(livros);
});

app.get('/livros/:id', (req, res) => {
  const { id } = req.params;
  const livro = livros.find(l => l.id === id);

  if (!livro) {
    return res.status(404).json({ mensagem: 'Livro não encontrado' });
  }

  res.json(livro);
});

app.post('/livros', (req, res) => {
  const novoLivro = { 
    id: Date.now().toString(), 
    ...req.body 
  };

  livros.push(novoLivro);
  res.status(201).json(novoLivro);
});

app.put('/livros/:id', (req, res) => {
  const { id } = req.params;
  const index = livros.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ mensagem: 'Livro não encontrado' });
  }

  livros[index] = { id, ...req.body };
  res.json(livros[index]);
});

app.delete('/livros/:id', (req, res) => {
  const { id } = req.params;
  livros = livros.filter(l => l.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js rodando em http://localhost:${PORT}`);
});