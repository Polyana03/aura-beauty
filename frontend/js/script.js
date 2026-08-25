
const formularioLogin = document.querySelector("#form_login");
const formularioCriar = document.querySelector("#form_cadastrar");

const email = document.querySelector("#email");
const senha = document.querySelector("#senha");

// Pega os usuários que já estão salvos ou cria uma lista vazia caso ainda não exista.
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];


// LOGIN

formularioLogin.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const valorEmail = email.value.trim();
    const valorSenha = senha.value.trim();


    // Validações
    if (valorEmail === "" || valorSenha === "") {
        alert("Por favor, preencha todos os campos!");
        return;
    }
    if (!valorEmail.includes("@") || !valorEmail.includes(".")) {
        alert("Digite um e-mail válido!");
        return;
    }


    // Procura o usuário
    const usuarioEncontrado = usuarios.find(function (usuario) {
        return usuario.email === valorEmail &&
               usuario.senha === valorSenha;
    });


    // Se não encontrou
    if (!usuarioEncontrado) {
        alert("E-mail ou senha incorretos!");
        return;
    }


    // Salva o usuário logado
    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuarioEncontrado)
    );


    alert("Login realizado com sucesso!");


    // Troca para a página inicial
    window.location.href = "index.html";

});


// CRIAR CONTA

formularioCriar.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const valorEmail = email.value.trim();
    const valorSenha = senha.value.trim();


    // Validações
    if (valorEmail === "" || valorSenha === "") {
        alert("Preencha o e-mail e a senha para criar sua conta!");
        return;
    }
    if (!valorEmail.includes("@") || !valorEmail.includes(".")) {
        alert("Digite um e-mail válido!");
        return;
    }


    // Verifica se o e-mail já existe
    const emailExiste = usuarios.some(function (usuario) {
        return usuario.email === valorEmail;
    });


    if (emailExiste) {
        alert("Este e-mail já está cadastrado!");
        return;
    }


    // Cria novo usuário
    const novoUsuario = {
        id: Date.now(),
        email: valorEmail,
        senha: valorSenha
    };

    usuarios.push(novoUsuario);

    
    // Salva no localStorage
    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );

    alert("Conta criada com sucesso!");


    // Limpar os campos
    formularioLogin.reset();

});
