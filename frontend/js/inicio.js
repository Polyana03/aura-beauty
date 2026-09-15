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
const imagensProfissionais = {
  Polyana: '../imagem/polyana.jpg',
  Iara: '../imagem/iara.jpg',
  Suerllainy: '../imagem/suerllainy.jpg'
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
  usuarioAvatar.src = '../imagem/mulher.jpg';
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
        <article class="card-profissional">
          <img src="${imagensProfissionais[profissional.nome] || '../imagem/mulher.jpg'}" alt="${profissional.nome}" />
          <div class="dados-prof">
            <h4>${profissional.nome}</h4>
            <p>${profissional.cargo}</p>
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

  const agora = new Date();

  const agendamentosFuturos = agendamentos
    .filter((agendamento) => {
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

  const agendamentoMaisProximo = agendamentosFuturos[0];

  proximoHorario.textContent = `${agendamentoMaisProximo.servico} - ${agendamentoMaisProximo.hora}`;
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
