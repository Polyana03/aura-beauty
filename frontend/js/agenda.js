const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const perfilNome = document.getElementById('perfilNome');
const perfilEmail = document.getElementById('perfilEmail');
const perfilTipo = document.getElementById('perfilTipo');
const listaAgendamentos = document.getElementById('listaAgendamentos');
const botaoSair = document.getElementById('sairBtn');

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
  usuarioAvatar.src = '../imagem/mulher.jpg';
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

async function carregarAgendamentos() {
  try {
    const resposta = await fetch(`${apiUrl}/agendamentos`);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar agendamentos.');
    }

    const agendamentos = await resposta.json();

    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);

    const agendamentosDoDia = agendamentos.filter((agendamento) => {
      const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
      return dataAgendamento >= inicioHoje && dataAgendamento < fimHoje;
    });

    if (!agendamentosDoDia.length) {
      listaAgendamentos.innerHTML = '<p class="vazio">Nenhum agendamento para hoje.</p>';
      return;
    }

    const agendamentosOrdenados = [...agendamentosDoDia].sort(function (a, b) {
      const dataA = `${a.data}T${a.hora}`;
      const dataB = `${b.data}T${b.hora}`;

      return new Date(dataA) - new Date(dataB);
    });

    listaAgendamentos.innerHTML = agendamentosOrdenados
      .map(
        (agendamento) => `
          <article class="agenda-item">
            <div class="agenda-data">
              <strong>${agendamento.data}</strong>
              <span>${agendamento.hora}</span>
            </div>
            <div class="agenda-info">
              <h4>${agendamento.cliente}</h4>
              <p>${agendamento.servico}</p>
              <small>${agendamento.observacao || 'Sem observação'}</small>
            </div>
            <div class="agenda-status">Confirmado</div>
          </article>
        `
      )
      .join('');
  } catch (erro) {
    console.error(erro);
    listaAgendamentos.innerHTML = '<p class="vazio">Não foi possível carregar a agenda.</p>';
  }
}

botaoSair.addEventListener('click', function () {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
});

const usuario = pegarUsuarioLogado();

if (usuario) {
  configurarUsuario(usuario);
  configurarMenuPerfil();
  carregarAgendamentos();
}
