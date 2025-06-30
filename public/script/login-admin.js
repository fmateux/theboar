/**
 * @file login-admin.js
 * @description Script de validação e envio do formulário de login do administrador
 */

/**
 * @module loginAdmin
 */

/**
 * Campo da senha do administrador.
 * @type {HTMLInputElement}
 * @memberof module:loginAdmin
 */
const senhaLoginAdmin = document.getElementById("senhaLoginAdmin");

/**
 * Botão para entrar no sistema administrativo.
 * @type {HTMLButtonElement}
 * @memberof module:loginAdmin
 */
const btnEntrarAdmin = document.getElementById("btnEntrarAdmin");

/**
 * Botão de voltar para a página inicial.
 * @constant {HTMLButtonElement|null}
 * @memberof module:loginAdmin
 */
const btnVoltar = document.querySelector(".botaovoltar button");
if (btnVoltar) {
  /**
   * Redireciona para a página inicial ao clicar no botão voltar.
   * @function
   * @memberof module:loginAdmin
   * @returns {void}
   */
  btnVoltar.addEventListener("click", () => {
    window.location.href = "/";
  });
}


/**
 * Valida a senha digitada pelo administrador.
 * Habilita ou desabilita o botão de login com base na validade da senha.
 * @function
 * @memberof module:loginAdmin
 * @returns {void}
 */
function validarLoginAdmin() {
  const senhaValida = senhaLoginAdmin.value.length >= 6;
  document.getElementById("statusSenhaLoginAdmin").textContent = senhaValida ? "" : "❌ Senha muito curta";
  btnEntrarAdmin.disabled = !senhaValida;
}

/**
 * Ativa a validação em tempo real da senha.
 * @memberof module:loginAdmin
 */
senhaLoginAdmin.addEventListener("input", validarLoginAdmin);

/**
 * Evento de submit do formulário de login de administrador.
 * Envia os dados via POST para o backend se a senha for válida.
 * @function
 * @memberof module:loginAdmin
 * @returns {Promise<void>}
 */
document.getElementById("formLoginAdmin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = "admin@admin.com";
  const senha = senhaLoginAdmin.value;

  try {
    const resposta = await fetch("/login-admin", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, senha }),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      alert(resultado.message);
      localStorage.setItem("usuarioLogado", "true");
      localStorage.setItem("emailUsuario", resultado.usuario.email);
      window.location.href = "/perfil-admin";
    } else {
      alert(resultado.message);
    }
  } catch (err) {
    console.error("Erro ao logar admin:", err);
    alert("Erro interno. Tente novamente mais tarde.");
  }
});