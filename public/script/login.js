/**
 * @file login.js
 * @description Script de validação e envio de formulário de login
 */

/**
 * @module login
 */

/**
 * Campo de e-mail do login.
 * @type {HTMLInputElement}
 * @memberof module:login
 */
const emailLogin = document.getElementById("emailLogin");

/**
 * Campo de senha do login.
 * @type {HTMLInputElement}
 * @memberof module:login
 */
const senhaLogin = document.getElementById("senhaLogin");

/**
 * Botão de login.
 * @type {HTMLButtonElement}
 * @memberof module:login
 */
const btnEntrar = document.getElementById("btnEntrar");

/**
 * Botão para voltar à página inicial ("/").
 * @constant {HTMLButtonElement|null}
 * @memberof module:login
 */
const btnVoltar = document.querySelector(".botaovoltar button");
if (btnVoltar) {
  /**
   * Manipulador de clique para redirecionar à página inicial.
   * @function
   * @memberof module:login
   * @returns {void}
   */
  btnVoltar.addEventListener("click", () => {
    window.location.href = "/";
  });
}

/**
 * Botão para acessar a página de login do administrador ("/login-admin").
 * @constant {HTMLButtonElement|null}
 * @memberof module:login
 */
const btnLoginAdmin = document.querySelector(".botaoadmin button");
if (btnLoginAdmin) {
  /**
   * Manipulador de clique para redirecionar à página de login admin.
   * @function
   * @memberof module:login
   * @returns {void}
   */
  btnLoginAdmin.addEventListener("click", () => {
    window.location.href = "/login-admin";
  });
}

/**
 * Valida os campos de e-mail e senha no formulário de login.
 * Atualiza mensagens de erro e ativa/desativa o botão de envio.
 * @function
 * @memberof module:login
 */
function validarLogin() {
  const emailValido = emailLogin.value.includes("@");
  const senhaValida = senhaLogin.value.length >= 6;

  document.getElementById("statusEmailLogin").textContent = emailValido ? "" : "❌ Email inválido";
  document.getElementById("statusSenhaLogin").textContent = senhaValida ? "" : "❌ Senha muito curta";

  btnEntrar.disabled = !(emailValido && senhaValida);
}

/**
 * Adiciona eventos de input para validar campos enquanto o usuário digita.
 * @memberof module:login
 */
[emailLogin, senhaLogin].forEach((input) => {
  input.addEventListener("input", validarLogin);
});

/**
 * Evento de submit do formulário de login.
 * Realiza a validação final e envia os dados via POST se válidos.
 * Em caso de sucesso, armazena dados no localStorage e redireciona para o perfil.
 * @function
 * @returns {Promise<void>}
 * @memberof module:login
 */
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailLogin.value;
  const senha = senhaLogin.value;

  try {
    const resposta = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, senha }),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      // Sucesso no login
      alert(resultado.message);
      localStorage.setItem("usuarioLogado", "true");
      localStorage.setItem("emailUsuario", resultado.usuario.email);
      window.location.href = "/perfil";
    } else {
      // Erro de autenticação
      alert(resultado.message);
    }
  } catch (err) {
    console.error("Erro ao logar:", err);
    alert("Erro interno. Tente novamente mais tarde.");
  }
});
