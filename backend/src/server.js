const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'data', 'db.json');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({
      usuarios: [],
      profissionais: [],
      servicos: [],
      agendamentos: []
    }, null, 2)
  );
}

app.use(cors());
app.use(express.json());

function lerBanco() {
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function salvarBanco(dados) {
  fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend funcionando', status: 'ok' });
});

app.get('/api/usuarios', (req, res) => {
  const db = lerBanco();
  res.json(db.usuarios);
});

app.post('/api/usuarios', (req, res) => {
  const db = lerBanco();
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const emailExiste = db.usuarios.some((usuario) => usuario.email === email);

  if (emailExiste) {
    return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
  }

  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha,
    tipoUsuario: 'cliente'
  };

  db.usuarios.push(novoUsuario);
  salvarBanco(db);

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  res.status(201).json(usuarioSemSenha);
});

app.post('/api/login', (req, res) => {
  const db = lerBanco();
  const { email, senha } = req.body;

  const usuario = db.usuarios.find(
    (item) => item.email === email && item.senha === senha
  );

  if (!usuario) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const { senha: _, ...usuarioSemSenha } = usuario;
  res.json({ message: 'Login realizado com sucesso!', usuario: usuarioSemSenha });
});

app.get('/api/profissionais', (req, res) => {
  const db = lerBanco();
  res.json(db.profissionais);
});

app.post('/api/profissionais', (req, res) => {
  const db = lerBanco();
  const { nome, especialidade } = req.body;

  if (!nome || !especialidade) {
    return res.status(400).json({ message: 'Nome e especialidade são obrigatórios.' });
  }

  const novoProfissional = {
    id: Date.now(),
    nome,
    especialidade
  };

  db.profissionais.push(novoProfissional);
  salvarBanco(db);

  res.status(201).json(novoProfissional);
});

app.get('/api/servicos', (req, res) => {
  const db = lerBanco();
  res.json(db.servicos);
});

app.post('/api/servicos', (req, res) => {
  const db = lerBanco();
  const { nome, preco, duracao } = req.body;

  if (!nome || !preco || !duracao) {
    return res.status(400).json({ message: 'Nome, preço e duração são obrigatórios.' });
  }

  const novoServico = {
    id: Date.now(),
    nome,
    preco,
    duracao
  };

  db.servicos.push(novoServico);
  salvarBanco(db);

  res.status(201).json(novoServico);
});

app.get('/api/agendamentos', (req, res) => {
  const db = lerBanco();
  res.json(db.agendamentos);
});

app.post('/api/agendamentos', (req, res) => {
  const db = lerBanco();
  const { cliente, profissionalId, servicoId, data, hora } = req.body;

  if (!cliente || !profissionalId || !servicoId || !data || !hora) {
    return res.status(400).json({ message: 'Todos os campos do agendamento são obrigatórios.' });
  }

  const novoAgendamento = {
    id: Date.now(),
    cliente,
    profissionalId,
    servicoId,
    data,
    hora,
    status: 'agendado'
  };

  db.agendamentos.push(novoAgendamento);
  salvarBanco(db);

  res.status(201).json(novoAgendamento);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
