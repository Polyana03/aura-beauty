const apiUrl = 'http://localhost:3001';
const usuarioNome = document.getElementById('usuarioNome');
const usuarioAvatar = document.getElementById('usuarioAvatar');
const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');
const listaProfissionais = document.getElementById('listaProfissionais');
const listaServicos = document.getElementById('listaServicos');
const proximoHorario = document.getElementById('proximoHorario');
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
  mensagemBoasVindas.textContent = `Olá, ${usuario.nome}!`;
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
        <article class="prof-card">
          <div class="avatar-profissional">${profissional.nome.charAt(0).toUpperCase()}</div>
          <div class="prof-info">
            <h4>${profissional.nome}</h4>
            <p>${profissional.cargo}</p>
            <small>${profissional.servicos.join(', ')}</small>
          </div>
        </article>
      `
    )
    .join('');
}

function renderizarServicos(servicos) {
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

  const agendamentoMaisProximo = [...agendamentos].sort(function (a, b) {
    const dataA = `${a.data}T${a.hora}`;
    const dataB = `${b.data}T${b.hora}`;

    return new Date(dataA) - new Date(dataB);
  })[0];

  proximoHorario.textContent = `${agendamentoMaisProximo.servico} - ${agendamentoMaisProximo.hora}`;
}

botaoSair.addEventListener('click', function () {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
});

const usuario = pegarUsuarioLogado();

if (usuario) {
  configurarUsuario(usuario);
  carregarDados();
}
