const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const perfilNome = document.getElementById('perfilNome');
const perfilEmail = document.getElementById('perfilEmail');
const perfilTipo = document.getElementById('perfilTipo');
const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');
const listaProfissionais = document.getElementById('listaProfissionais');
const listaServicos = document.getElementById('listaServicos');
const proximoHorario = document.getElementById('proximoHorario');
const botaoSair = document.getElementById('sairBtn');
const campoBusca = document.getElementById('campoBusca');
const botaoLimparBusca = document.querySelector('.btn-fechar');
const estatAgendamentosHoje = document.getElementById('estatAgendamentosHoje');
const estatMesAtual = document.getElementById('estatMesAtual');
const labelMesAtual = document.getElementById('labelMesAtual');
const estatFaturamentoMes = document.getElementById('estatFaturamentoMes');
const estatFaturamentoDia = document.getElementById('estatFaturamentoDia');
const imagensProfissionais = {
  Polyana: '../../imagem/polyana.jpg',
  Iara: '../../imagem/iara.jpg',
  Suerllainy: '../../imagem/suerllainy.jpg'
};

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
  mensagemBoasVindas.textContent = `Olá, ${usuario.nome}!`;

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

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0);
}

function atualizarEstatisticas(agendamentos, servicos) {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const precosPorServico = Object.fromEntries(
    servicos.map((servico) => [servico.nome, Number(servico.preco) || 0])
  );

  const agendamentosHoje = agendamentos.filter((agendamento) => {
    if (agendamento.status === 'cancelado') return false;
    const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
    return dataAgendamento >= inicioHoje && dataAgendamento < new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);
  });

  const agendamentosMes = agendamentos.filter((agendamento) => {
    if (agendamento.status === 'cancelado') return false;
    const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
    return dataAgendamento >= inicioMes && dataAgendamento <= new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
  });

  const faturamentoDia = agendamentosHoje.reduce((total, agendamento) => {
    return total + (precosPorServico[agendamento.servico] || 0);
  }, 0);

  const faturamentoMes = agendamentosMes.reduce((total, agendamento) => {
    return total + (precosPorServico[agendamento.servico] || 0);
  }, 0);

  if (estatAgendamentosHoje) {
    estatAgendamentosHoje.textContent = String(agendamentosHoje.length);
  }

  if (estatMesAtual) {
    estatMesAtual.textContent = String(agendamentosMes.length);
  }

  if (labelMesAtual) {
    labelMesAtual.textContent = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);
  }

  if (estatFaturamentoMes) {
    estatFaturamentoMes.textContent = formatarMoeda(faturamentoMes);
  }

  if (estatFaturamentoDia) {
    estatFaturamentoDia.textContent = formatarMoeda(faturamentoDia);
  }
}

async function carregarDados() {
  try {
    const respostaProfissionais = fetch(`${apiUrl}/profissionais`);
    const respostaServicos = fetch(`${apiUrl}/servicos`);
    const respostaAgendamentos = fetch(`${apiUrl}/agendamentos`);

    const [profissionais, servicos, agendamentos] = await Promise.all([
      (await respostaProfissionais).json(),
      (await respostaServicos).json(),
      (await respostaAgendamentos).json()
    ]);

    atualizarEstatisticas(agendamentos, servicos);
    renderizarProfissionais(profissionais);
    renderizarServicos(servicos);
    renderizarProximoHorario(agendamentos);
  } catch (erro) {
    console.error(erro);
    proximoHorario.textContent = 'Não foi possível carregar os dados.';
  }
}

function renderizarProfissionais(profissionais) {
  if (!profissionais.length) {
    listaProfissionais.innerHTML = '<p class="vazio">Nenhum profissional cadastrado.</p>';
    return;
  }

  listaProfissionais.innerHTML = profissionais
    .map(
      (profissional) => `
        <article class="card-profissional">
          <div class="identidade-profissional">
            <img src="${imagensProfissionais[profissional.nome] || '../../imagem/mulher.jpg'}" alt="${profissional.nome}" />
            <div class="dados-prof">
              <h4>${profissional.nome}</h4>
              <p>${profissional.cargo}</p>
            </div>
          </div>
          <div class="servicos-lista">
            <h5>Serviços Ofertados</h5>
            <ul>
              ${profissional.servicos.map((servico) => `<li>${servico}</li>`).join('')}
            </ul>
          </div>
        </article>
      `
    )
    .join('');
}

function renderizarResultadosBusca(termo) {
  const busca = termo.trim().toLowerCase();

  if (!busca) {
    carregarDados();
    return;
  }

  Promise.all([
    fetch(`${apiUrl}/profissionais`).then((resposta) => resposta.json()),
    fetch(`${apiUrl}/servicos`).then((resposta) => resposta.json()),
    fetch(`${apiUrl}/agendamentos`).then((resposta) => resposta.json())
  ]).then(([profissionais, servicos, agendamentos]) => {
    const profissionaisFiltrados = profissionais.filter((profissional) => {
      const texto = `${profissional.nome} ${profissional.cargo} ${(profissional.servicos || []).join(' ')}`.toLowerCase();
      return texto.includes(busca);
    });
    const servicosFiltrados = servicos.filter((servico) => servico.nome.toLowerCase().includes(busca));
    const agendamentosFiltrados = agendamentos.filter((agendamento) => {
      const texto = `${agendamento.cliente} ${agendamento.servico} ${agendamento.data} ${agendamento.hora}`.toLowerCase();
      return texto.includes(busca);
    });

    renderizarProfissionais(profissionaisFiltrados);
    renderizarProximoHorario(agendamentosFiltrados);

    if (!profissionaisFiltrados.length && !servicosFiltrados.length && !agendamentosFiltrados.length) {
      listaProfissionais.innerHTML = '<p class="vazio">Nenhum resultado encontrado.</p>';
      proximoHorario.textContent = 'Nenhum resultado encontrado.';
    }
  }).catch((erro) => {
    console.error(erro);
    listaProfissionais.innerHTML = '<p class="vazio">Não foi possível realizar a busca.</p>';
  });
}

function renderizarServicos(servicos) {
  if (!listaServicos) {
    return;
  }

  if (!servicos.length) {
    listaServicos.innerHTML = '<li class="vazio">Nenhum serviço cadastrado.</li>';
    return;
  }

  listaServicos.innerHTML = servicos
    .map((servico) => `<li>${servico.nome}</li>`)
    .join('');
}

function renderizarProximoHorario(agendamentos) {
  if (!agendamentos.length) {
    proximoHorario.textContent = 'Ainda não há agendamentos cadastrados.';
    return;
  }

  const agora = new Date();

  const agendamentosFuturos = agendamentos
    .filter((agendamento) => {
      if (agendamento.status === 'cancelado') return false;
      const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
      return dataAgendamento >= agora;
    })
    .sort(function (a, b) {
      const dataA = `${a.data}T${a.hora}`;
      const dataB = `${b.data}T${b.hora}`;

      return new Date(dataA) - new Date(dataB);
    });

  if (!agendamentosFuturos.length) {
    proximoHorario.textContent = 'Nenhum agendamento futuro cadastrado.';
    return;
  }

  const agendamento = agendamentosFuturos[0];
  const dataFormatada = new Date(`${agendamento.data}T12:00:00`).toLocaleDateString('pt-BR');

  proximoHorario.innerHTML = `
    <div>
      <strong>${agendamento.servico}</strong> — ${dataFormatada} às ${agendamento.hora}
    </div>
  `;
}

if (campoBusca) {
  campoBusca.addEventListener('input', function () {
    renderizarResultadosBusca(campoBusca.value);
  });
}

if (botaoLimparBusca && campoBusca) {
  botaoLimparBusca.addEventListener('click', function () {
    campoBusca.value = '';
    campoBusca.focus();
    carregarDados();
  });
}

botaoSair.addEventListener('click', function () {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
});

const usuario = pegarUsuarioLogado();

if (usuario) {
  configurarUsuario(usuario);
  configurarMenuPerfil();
  carregarDados();
}
