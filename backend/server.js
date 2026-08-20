const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'chave_segura_123';

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
      CREATE TABLE IF NOT EXISTS public.livros (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        ano VARCHAR(10) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.usuario (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(' Tabelas "livros" e "usuario" verificadas com sucesso');
  } catch (erroTabela) {
    console.error(' Erro ao criar tabelas:', erroTabela.message);
  } finally {
    release();
  }
});


app.get('/livros', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM public.livros ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (erro) {
    console.error('Erro no GET /livros:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

app.get('/livros/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM public.livros WHERE id = $1', [id]);

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
      'INSERT INTO public.livros (titulo, autor, ano) VALUES ($1, $2, $3) RETURNING *',
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
      'UPDATE public.livros SET titulo = $1, autor = $2, ano = $3 WHERE id = $4 RETURNING *',
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
    const resultado = await pool.query('DELETE FROM public.livros WHERE id = $1 RETURNING *', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Livro não encontrado' });
    }

    res.status(204).send();
  } catch (erro) {
    console.error('Erro no DELETE /livros/:id:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

app.post('/usuarios/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await pool.query(
      'INSERT INTO public.usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senhaHash]
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario.rows[0]
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro no cadastro:', err);
    res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
});

app.post('/usuarios/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    console.log(`\n Tentativa de login para o e-mail: [${email}]`);

    const usuarioBD = await pool.query(
      'SELECT * FROM public.usuario WHERE email = $1',
      [email]
    );

    if (usuarioBD.rows.length === 0) {
      console.log(' E-mail NÃO foi encontrado no banco de dados.');
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const usuario = usuarioBD.rows[0];
    console.log(' Usuário encontrado no banco:', usuario.email);

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      console.log(' Senha INCORRETA para este e-mail.');
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    } 

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('🎉 Login bem-sucedido! Token JWT gerado.');

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (err) {
    console.error('Erro detalhado no login:', err);
    res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

app.listen(PORT, () => {
  console.log(` Servidor Node.js rodando em http://localhost:${PORT}`);
});