const apiUrl = 'http://localhost:3001';
const formularioLogin = document.getElementById('formLogin');
const formularioCriar = document.getElementById('formCriar');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');

async function buscarUsuarios() {
  const resposta = await fetch(`${apiUrl}/usuarios`);

  if (!resposta.ok) {
    throw new Error('Erro ao buscar usuários.');
  }

  return resposta.json();
}

formularioLogin.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const email = inputEmail.value.trim();
  const senha = inputSenha.value.trim();

  if (!email || !senha) {
    alert('Preencha o e-mail e a senha para entrar.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    alert('Digite um e-mail válido.');
    return;
  }

  try {
    const usuarios = await buscarUsuarios();
    const usuario = usuarios.find(function (item) {
      return item.email === email && item.senha === senha;
    });

    if (!usuario) {
      alert('E-mail ou senha incorretos.');
      return;
    }

    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      })
    );

    alert('Login realizado com sucesso!');
    window.location.href = 'inicio.html';
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível fazer login no momento.');
  }
});

formularioCriar.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const email = inputEmail.value.trim();
  const senha = inputSenha.value.trim();

  if (!email || !senha) {
    alert('Preencha o e-mail e a senha para criar sua conta.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    alert('Digite um e-mail válido.');
    return;
  }

  try {
    const usuarios = await buscarUsuarios();
    const emailExiste = usuarios.some(function (usuario) {
      return usuario.email === email;
    });

    if (emailExiste) {
      alert('Este e-mail já está cadastrado.');
      return;
    }

    const novoUsuario = {
      id: Date.now(),
      nome: email.split('@')[0],
      email: email,
      senha: senha
    };

    const resposta = await fetch(`${apiUrl}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoUsuario)
    });

    if (!resposta.ok) {
      throw new Error('Erro ao criar usuário.');
    }

    alert('Conta criada com sucesso!');
    formularioLogin.reset();
    inputEmail.focus();
  } catch (erro) {
    console.error(erro);
    alert('Não foi possível criar a conta agora.');
  }
});
