const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const perfilNome = document.getElementById('perfilNome');
const perfilEmail = document.getElementById('perfilEmail');
const perfilTipo = document.getElementById('perfilTipo');
const botaoSair = document.getElementById('sairBtn');
const formulario = document.getElementById('formAgendamento');
const selectServicos = document.getElementById('servico');
const inputNome = document.getElementById('nomeCliente');
const inputData = document.getElementById('data');
const textareaObservacao = document.getElementById('observacao');
const listaHorarios = document.getElementById('listaHorarios');
const valorServicoEl = document.getElementById('valorServico');
const valorTotalEl = document.getElementById('valorTotal');

let horarioSelecionado = '';
const precosPorServico = {};

function pegarUsuarioLogado() {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuario) {
    window.location.href = 'index.html';
    return null;
  }

  return usuario;
}

function configurarUsuario(usuario) {
  usuarioNome.textContent = `Olá, ${usuario.nome}!`;
  usuarioAvatar.src = '../../imagem/mulher.jpg';
  usuarioAvatar.alt = usuario.nome;

  if (perfilNome) perfilNome.textContent = usuario.nome;
  if (perfilEmail) perfilEmail.textContent = usuario.email || 'Não informado';
  if (perfilTipo) perfilTipo.textContent = 'Cliente';
}

function configurarMenuPerfil() {
  const perfilMenu = document.getElementById('perfilMenu');
  const setaBtn = document.querySelector('.seta-btn');

  if (!perfilMenu || !setaBtn) {
    return;
  }

  setaBtn.addEventListener('click', function () {
    const aberto = perfilMenu.classList.toggle('ativo');
    perfilMenu.setAttribute('aria-hidden', String(!aberto));
    setaBtn.setAttribute('aria-expanded', String(aberto));
  });

  document.addEventListener('click', function (event) {
    const clicouDentro = perfilMenu.contains(event.target) || setaBtn.contains(event.target);

    if (!clicouDentro) {
      perfilMenu.classList.remove('ativo');
      perfilMenu.setAttribute('aria-hidden', 'true');
      setaBtn.setAttribute('aria-expanded', 'false');
    }
  });
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

async function buscarAgendamentos() {
  const resposta = await fetch(`${apiUrl}/agendamentos`);

  if (!resposta.ok) {
    throw new Error('Erro ao buscar agendamentos.');
  }

  return resposta.json();
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

function atualizarResumoValor() {
  const servicoSelecionado = selectServicos.value;
  const valor = precosPorServico[servicoSelecionado] || 0;

  if (valorServicoEl) {
    valorServicoEl.textContent = formatarMoeda(valor);
  }

  if (valorTotalEl) {
    valorTotalEl.textContent = formatarMoeda(valor);
  }
}

async function carregarServicos() {
  try {
    const resposta = await fetch(`${apiUrl}/servicos`);

    if (!resposta.ok) {
      throw new Error('Erro ao carregar os serviços.');
    }

    const servicos = await resposta.json();

    servicos.forEach((servico) => {
      precosPorServico[servico.nome] = Number(servico.preco) || 0;
    });

    selectServicos.innerHTML = `
      <option value="">Selecione um serviço</option>
      ${servicos
        .map((servico) => `<option value="${servico.nome}">${servico.nome}</option>`)
        .join('')}
    `;

    selectServicos.addEventListener('change', atualizarResumoValor);
    atualizarResumoValor();
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível carregar os serviços.');
  }
}

async function verificarHorarioDisponivel(data, hora) {
  const agendamentos = await buscarAgendamentos();
  return !agendamentos.some((agendamento) => {
    return agendamento.status !== 'cancelado' && agendamento.data === data && agendamento.hora === hora;
  });
}

formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const nome = inputNome.value.trim();
  const servico = selectServicos.value;
  const data = inputData.value;
  const observacao = textareaObservacao.value.trim();
  const valorTotal = precosPorServico[servico] || 0;

  if (!nome || !servico || !data || !horarioSelecionado) {
    alert('Preencha nome, serviço, data e escolha um horário.');
    return;
  }

  try {
    const horarioDisponivel = await verificarHorarioDisponivel(data, horarioSelecionado);

    if (!horarioDisponivel) {
      alert('Esse horário já está ocupado para essa data. Escolha outro disponível.');
      return;
    }

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
        observacao: observacao || 'Sem observação',
        valor: valorTotal
      })
    });

    if (!resposta.ok) {
      throw new Error('Erro ao criar agendamento.');
    }

    alert(`Agendamento realizado com sucesso! Total: ${formatarMoeda(valorTotal)}`);
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
  configurarMenuPerfil();
  preencherDataMinima();
  criarListaHorarios();
  carregarServicos();
}
