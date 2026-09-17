const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const perfilNome = document.getElementById('perfilNome');
const perfilEmail = document.getElementById('perfilEmail');
const perfilTipo = document.getElementById('perfilTipo');
const listaAgendamentos = document.getElementById('listaAgendamentos');
const botaoSair = document.getElementById('sairBtn');
const campoBusca = document.getElementById('campoBusca');
const estatAgendamentosHoje = document.getElementById('estatAgendamentosHoje');
const estatMesAtual = document.getElementById('estatMesAtual');
const labelMesAtual = document.getElementById('labelMesAtual');
const estatFaturamentoMes = document.getElementById('estatFaturamentoMes');
const estatFaturamentoDia = document.getElementById('estatFaturamentoDia');

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

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function atualizarEstatisticas(agendamentos) {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const mesAtual = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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

  const servicos = JSON.parse(localStorage.getItem('servicosAuraBeauty') || '[]');
  const precosPorServico = Object.fromEntries(
    servicos.map((servico) => [servico.nome, Number(servico.preco) || 0])
  );

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

async function carregarAgendamentos(termoBusca = '') {
  try {
    const resposta = await fetch(`${apiUrl}/agendamentos`);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar agendamentos.');
    }

    let agendamentos = await resposta.json();

    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      agendamentos = agendamentos.filter((agendamento) => {
        const texto = `${agendamento.cliente} ${agendamento.servico} ${agendamento.data} ${agendamento.hora}`.toLowerCase();
        return texto.includes(termo);
      });
    }

    atualizarEstatisticas(agendamentos);

    if (!agendamentos.length) {
      listaAgendamentos.innerHTML = '<p class="vazio">Nenhum agendamento encontrado.</p>';
      return;
    }

    const agendamentosOrdenados = [...agendamentos].sort(function (a, b) {
      const dataA = `${a.data}T${a.hora}`;
      const dataB = `${b.data}T${b.hora}`;

      return new Date(dataA) - new Date(dataB);
    });

    listaAgendamentos.innerHTML = agendamentosOrdenados
      .map((agendamento) => {
        const dataCompleta = new Date(`${agendamento.data}T${agendamento.hora}`);
        const dataFormatada = new Date(`${agendamento.data}T12:00:00`).toLocaleDateString('pt-BR');
        const cancelado = agendamento.status === 'cancelado';
        const status = cancelado ? 'Cancelado' : dataCompleta < new Date() ? 'Realizado' : 'Confirmado';
        const imagem = '../../imagem/mulher.jpg';
        const botaoCancelar = !cancelado && dataCompleta >= new Date()
          ? `<button type="button" class="botao-cancelar" data-id="${agendamento.id}">Cancelar</button>`
          : '';

        return `
          <article class="agenda-item">
            <div class="agenda-data">
              <strong>${dataFormatada}</strong>
              <span>${agendamento.hora}</span>
            </div>
            <img class="agenda-avatar" src="${imagem}" alt="${agendamento.cliente}" />
            <div class="agenda-info">
              <h4>${agendamento.cliente}</h4>
              <p>${agendamento.servico}</p>
              <small>${agendamento.observacao || 'Sem observação'}</small>
            </div>
            <div class="agenda-acoes">
              <div class="agenda-status ${cancelado ? 'status-cancelado' : ''}">${status}</div>
              ${botaoCancelar}
            </div>
          </article>
        `;
      })
      .join('');
  } catch (erro) {
    console.error(erro);
    listaAgendamentos.innerHTML = '<p class="vazio">Não foi possível carregar a agenda.</p>';
  }
}

async function cancelarAgendamento(id) {
  const desejaCancelar = window.confirm('Deseja cancelar este agendamento?');

  if (!desejaCancelar) return;

  try {
    const resposta = await fetch(`${apiUrl}/agendamentos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelado' })
    });

    if (!resposta.ok) throw new Error('Erro ao cancelar agendamento.');

    await carregarAgendamentos(campoBusca.value);
  } catch (erro) {
    console.error(erro);
    window.alert('Não foi possível cancelar o agendamento.');
  }
}

listaAgendamentos.addEventListener('click', function (event) {
  const botao = event.target.closest('.botao-cancelar');
  if (botao) cancelarAgendamento(botao.dataset.id);
});

async function carregarServicosComPreco() {
  try {
    const resposta = await fetch(`${apiUrl}/servicos`);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar serviços.');
    }

    const servicos = await resposta.json();
    localStorage.setItem('servicosAuraBeauty', JSON.stringify(servicos));
    return servicos;
  } catch (erro) {
    console.error(erro);
    return [];
  }
}

if (campoBusca) {
  campoBusca.addEventListener('input', function () {
    carregarAgendamentos(campoBusca.value);
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
  carregarServicosComPreco();
  carregarAgendamentos();
}
