const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
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
  usuarioNome.textContent = usuario.nome;
  usuarioAvatar.textContent = usuario.nome.charAt(0).toUpperCase();
}

async function carregarAgendamentos() {
  try {
    const resposta = await fetch(`${apiUrl}/agendamentos`);

    if (!resposta.ok) {
      throw new Error('Erro ao buscar agendamentos.');
    }

    const agendamentos = await resposta.json();

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
  carregarAgendamentos();
}
