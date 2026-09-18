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
const campoBusca = document.getElementById('campoBusca');
const botaoLimparBusca = document.querySelector('.btn-fechar');
const mesAtualEl = document.getElementById('mesAtual');
const calendarioDias = document.getElementById('calendarioDias');
const mesAnterior = document.getElementById('mesAnterior');
const mesSeguinte = document.getElementById('mesSeguinte');
const horarioEscolhidoEl = document.getElementById('horarioEscolhido');

let horarioSelecionado = '';
let mesCalendario = new Date();
let agendamentosCadastrados = [];
const precosPorServico = {};

function configurarBusca() {
  if (!campoBusca) return;

  campoBusca.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Enter') return;

    const termo = campoBusca.value.toLowerCase();
    if (termo.includes('início') || termo.includes('inicio')) {
      window.location.href = 'inicio.html';
    } else if (termo.includes('agenda')) {
      window.location.href = 'agenda.html';
    }
  });

  if (botaoLimparBusca) {
    botaoLimparBusca.addEventListener('click', function () {
      campoBusca.value = '';
      campoBusca.focus();
    });
  }
}

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

function obterDataLocal() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
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
  const dataAtual = obterDataLocal();
  inputData.min = dataAtual;
  inputData.value = dataAtual;
  mesCalendario = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  renderizarCalendario();
}

function formatarDataCalendario(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function renderizarCalendario() {
  if (!mesAtualEl || !calendarioDias) return;

  const ano = mesCalendario.getFullYear();
  const mes = mesCalendario.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dataSelecionada = inputData.value;
  const dataMinima = obterDataLocal();

  mesAtualEl.textContent = mesCalendario.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).replace(/^./, (letra) => letra.toUpperCase());

  calendarioDias.innerHTML = '';

  for (let indice = 0; indice < primeiroDia; indice += 1) {
    calendarioDias.insertAdjacentHTML('beforeend', '<span class="dia-vazio" aria-hidden="true"></span>');
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const data = formatarDataCalendario(ano, mes, dia);
    const passado = data < dataMinima;
    const selecionado = data === dataSelecionada && !passado ? ' selecionado' : '';
    calendarioDias.insertAdjacentHTML(
      'beforeend',
      `<button type="button" class="dia-calendario${selecionado}${passado ? ' passado' : ''}" data-data="${data}"${passado ? ' disabled' : ''}>${dia}</button>`
    );
  }

  calendarioDias.querySelectorAll('.dia-calendario').forEach((botao) => {
    botao.addEventListener('click', function () {
      if (botao.disabled) return;
      inputData.value = botao.dataset.data;
      horarioSelecionado = '';
      atualizarHorarioEscolhido();
      renderizarCalendario();
      criarListaHorarios();
    });
  });

  if (mesAnterior) {
    const mesAtual = new Date();
    mesAnterior.disabled = ano === mesAtual.getFullYear() && mes === mesAtual.getMonth();
  }
}

function atualizarHorarioEscolhido() {
  if (horarioEscolhidoEl) {
    horarioEscolhidoEl.textContent = horarioSelecionado || 'Nenhum';
  }
}

function criarListaHorarios() {
  const horarios = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const horariosOcupados = agendamentosCadastrados
    .filter((agendamento) => agendamento.status !== 'cancelado' && agendamento.data === inputData.value)
    .map((agendamento) => agendamento.hora);

  listaHorarios.innerHTML = horarios
    .map(
      (horario) => {
        const ocupado = horariosOcupados.includes(horario);
        const selecionado = horario === horarioSelecionado && !ocupado ? ' selected' : '';
        return `
        <button
          type="button"
          class="time-button${selecionado}${ocupado ? ' indisponivel' : ''}"
          data-horario="${horario}"
          ${ocupado ? 'disabled' : ''}
        >
          <span>${horario}</span>${ocupado ? '<small>Ocupado</small>' : ''}
        </button>
      `;
      }
    )
    .join('');

  const botoes = document.querySelectorAll('.time-button');

  botoes.forEach(function (botao) {
    botao.addEventListener('click', function () {
      if (botao.disabled) return;
      horarioSelecionado = botao.dataset.horario;
      atualizarHorarioEscolhido();
      criarListaHorarios();
    });
  });
}

async function carregarDisponibilidade() {
  try {
    agendamentosCadastrados = await buscarAgendamentos();
    criarListaHorarios();
  } catch (erro) {
    console.error(erro);
  }
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

  if (data < obterDataLocal()) {
    alert('Não é possível agendar uma data que já passou. Escolha hoje ou uma data futura.');
    inputData.focus();
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
  configurarBusca();
  preencherDataMinima();
  criarListaHorarios();
  inputData.addEventListener('change', function () {
    const dataEscolhida = new Date(`${inputData.value}T12:00:00`);
    if (!Number.isNaN(dataEscolhida.getTime())) {
      mesCalendario = new Date(dataEscolhida.getFullYear(), dataEscolhida.getMonth(), 1);
      horarioSelecionado = '';
      atualizarHorarioEscolhido();
      renderizarCalendario();
      criarListaHorarios();
    }
  });

  mesAnterior.addEventListener('click', function () {
    if (mesAnterior.disabled) return;
    mesCalendario.setMonth(mesCalendario.getMonth() - 1);
    renderizarCalendario();
  });

  mesSeguinte.addEventListener('click', function () {
    mesCalendario.setMonth(mesCalendario.getMonth() + 1);
    renderizarCalendario();
  });

  carregarDisponibilidade();
  carregarServicos();
}
