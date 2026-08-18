const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'library_db',
  password: 'postgreSQLnogueira66',
  port: 5432,
});


pool.connect(async (err, client, release) => {
  if (err) {
    console.error(' ERRO AO CONECTAR COM O POSTGRESQL:', err.message);
    return;
  }
  
  console.log(' Conectado ao banco PostgreSQL');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS livros (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        ano VARCHAR(10) NOT NULL
      );
    `);
    console.log(' Tabela "livros" verificada e pronta para uso');
  } catch (erroTabela) {
    console.error(' Erro ao criar tabela automaticamente:', erroTabela.message);
  } finally {
    release();
  }
});


app.get('/livros', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM livros ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro no GET /livros:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});


app.get('/debug-banco', async (req, res) => {
  try {
    const db = await pool.query('SELECT current_database(), current_user');
    const total = await pool.query('SELECT count(*) FROM livros');
    res.json({
      bancoConectado: db.rows[0].current_database,
      usuario: db.rows[0].current_user,
      totalLivrosSalvos: total.rows[0].count
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});


app.get('/livros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM livros WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro no GET /livros/:id:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});


app.post('/livros', async (req, res) => {
  try {
    const { titulo, autor, ano } = req.body;

    if (!titulo || !autor || !ano) {
      return res.status(400).json({ erro: 'Preencha todos os campos (titulo, autor, ano).' });
    }

    const resultado = await pool.query(
      'INSERT INTO livros (titulo, autor, ano) VALUES ($1, $2, $3) RETURNING *',
      [titulo, autor, ano]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro no POST /livros:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});


app.put('/livros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, ano } = req.body;

    if (!titulo || !autor || !ano) {
      return res.status(400).json({ erro: 'Preencha todos os campos (titulo, autor, ano).' });
    }

    const resultado = await pool.query(
      'UPDATE livros SET titulo = $1, autor = $2, ano = $3 WHERE id = $4 RETURNING *',
      [titulo, autor, ano, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro no PUT /livros/:id:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});


app.delete('/livros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM livros WHERE id = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    console.error('Erro no DELETE /livros/:id:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});


app.listen(PORT, () => {
  console.log(` Servidor Node.js rodando em http://localhost:${PORT}`);
});