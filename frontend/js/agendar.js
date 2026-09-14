const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const botaoSair = document.getElementById('sairBtn');
const formulario = document.getElementById('formAgendamento');
const selectServicos = document.getElementById('servico');
const inputNome = document.getElementById('nomeCliente');
const inputData = document.getElementById('data');
const textareaObservacao = document.getElementById('observacao');
const listaHorarios = document.getElementById('listaHorarios');

let horarioSelecionado = '';

function pegarUsuarioLogado() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuario) {
    window.location.href = 'index.html';
    return null;
  }

  return usuario;
}

function configurarUsuario(usuario) {
  usuarioNome.textContent = usuario.nome;
  usuarioAvatar.textContent = usuario.nome.charAt(0).toUpperCase();
}

function preencherDataMinima() {
  const hoje = new Date();
  const dataAtual = hoje.toISOString().split('T')[0];
  inputData.min = dataAtual;
}

function criarListaHorarios() {
  const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

  listaHorarios.innerHTML = horarios
    .map(
      (horario) => `
        <button
          type="button"
          class="time-button ${horario === horarioSelecionado ? 'selected' : ''}"
          data-horario="${horario}"
        >
          ${horario}
        </button>
      `
    )
    .join('');

  const botoes = document.querySelectorAll('.time-button');

  botoes.forEach(function (botao) {
    botao.addEventListener('click', function () {
      horarioSelecionado = botao.dataset.horario;
      criarListaHorarios();
    });
  });
}

async function carregarServicos() {
  try {
    const resposta = await fetch(`${apiUrl}/servicos`);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar os serviços.');
    }

    const servicos = await resposta.json();

    selectServicos.innerHTML = `
      <option value="">Selecione um serviço</option>
      ${servicos
        .map((servico) => `<option value="${servico.nome}">${servico.nome}</option>`)
        .join('')}
    `;
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível carregar os serviços.');
  }
}

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const servico = selectServicos.value;
  const data = inputData.value;
  const observacao = textareaObservacao.value.trim();

  if (!nome || !servico || !data || !horarioSelecionado) {
    alert('Preencha nome, serviço, data e escolha um horário.');
    return;
  }

  try {
    const resposta = await fetch(`${apiUrl}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cliente: nome,
        servico: servico,
        data: data,
        hora: horarioSelecionado,
        observacao: observacao || 'Sem observação'
      })
    });

    if (!resposta.ok) {
      throw new Error('Erro ao criar agendamento.');
    }

    alert('Agendamento realizado com sucesso!');
    window.location.href = 'agenda.html';
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível confirmar o agendamento.');
  }
});

botaoSair.addEventListener('click', function () {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
});

const usuario = pegarUsuarioLogado();

if (usuario) {
  configurarUsuario(usuario);
  preencherDataMinima();
  criarListaHorarios();
  carregarServicos();
}
