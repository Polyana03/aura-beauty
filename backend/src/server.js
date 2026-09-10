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
      users: [],
      professionals: [],
      services: [],
      appointments: []
    }, null, 2)
  );
}

app.use(cors());
app.use(express.json());

function readDb() {
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend funcionando', status: 'ok' });
});

// USERS
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const db = readDb();
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  const emailExists = db.users.some((user) => user.email === email);

  if (emailExists) {
    return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: 'cliente'
  };

  db.users.push(newUser);
  writeDb(db);

  res.status(201).json(newUser);
});

app.post('/api/login', (req, res) => {
  const db = readDb();
  const { email, password } = req.body;

  const user = db.users.find(
    (item) => item.email === email && item.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Login realizado com sucesso!', user: userWithoutPassword });
});

// PROFESSIONALS
app.get('/api/professionals', (req, res) => {
  const db = readDb();
  res.json(db.professionals);
});

app.post('/api/professionals', (req, res) => {
  const db = readDb();
  const { name, specialty } = req.body;

  if (!name || !specialty) {
    return res.status(400).json({ message: 'Nome e especialidade são obrigatórios.' });
  }

  const newProfessional = {
    id: Date.now(),
    name,
    specialty
  };

  db.professionals.push(newProfessional);
  writeDb(db);

  res.status(201).json(newProfessional);
});

// SERVICES
app.get('/api/services', (req, res) => {
  const db = readDb();
  res.json(db.services);
});

app.post('/api/services', (req, res) => {
  const db = readDb();
  const { name, price, duration } = req.body;

  if (!name || !price || !duration) {
    return res.status(400).json({ message: 'Nome, preço e duração são obrigatórios.' });
  }

  const newService = {
    id: Date.now(),
    name,
    price,
    duration
  };

  db.services.push(newService);
  writeDb(db);

  res.status(201).json(newService);
});

// APPOINTMENTS
app.get('/api/appointments', (req, res) => {
  const db = readDb();
  res.json(db.appointments);
});

app.post('/api/appointments', (req, res) => {
  const db = readDb();
  const { clientName, professionalId, serviceId, date, time } = req.body;

  if (!clientName || !professionalId || !serviceId || !date || !time) {
    return res.status(400).json({ message: 'Todos os campos do agendamento são obrigatórios.' });
  }

  const newAppointment = {
    id: Date.now(),
    clientName,
    professionalId,
    serviceId,
    date,
    time,
    status: 'agendado'
  };

  db.appointments.push(newAppointment);
  writeDb(db);

  res.status(201).json(newAppointment);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
