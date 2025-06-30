/**
 * @file perfil.js
 * @description Script responsável pelo controle de edição e atualização de perfil do usuário, incluindo exibição e ocultação da senha.
 */

/**
 * @module perfil
 */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Botão para ativar modo de edição do perfil.
   * @type {HTMLButtonElement}
   * @memberof module:perfil
   */
  const btnEditar = document.getElementById('btnEditar');

  /**
   * Botão para salvar as alterações do perfil.
   * @type {HTMLButtonElement}
   * @memberof module:perfil
   */
  const btnSalvar = document.getElementById('btnSalvar');

  /**
   * Botão para voltar da tela de perfil.
   * @type {HTMLButtonElement}
   * @memberof module:perfil
   */
  const btnVoltar = document.getElementById('btnVoltar');

  /**
   * Formulário do perfil do usuário.
   * @type {HTMLFormElement}
   * @memberof module:perfil
   */
  const form = document.getElementById('formPerfil');

  /**
   * Inputs do formulário editáveis (text, email e password).
   * @type {NodeListOf<HTMLInputElement>}
   * @memberof module:perfil
   */
  const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');

  /**
   * Campo de senha do formulário.
   * @type {HTMLInputElement}
   * @memberof module:perfil
   */
  const senhaInput = document.getElementById('senha');

  /**
   * Ícone para alternar a visibilidade da senha.
   * @type {HTMLElement}
   * @memberof module:perfil
   */
  const togglePassword = document.getElementById('togglePassword');
  
  /**
   * Botão para navegar até a página de pedidos.
   * @type {HTMLButtonElement}
   * @memberof module:perfil
   */
  const btnPedidos = document.getElementById('btnPedidos');

  // Inicialmente, esconder botão salvar e ícone do olho
  btnSalvar.style.display = 'none';
  togglePassword.style.display = 'none';

  /**
   * Habilita edição dos campos do formulário e mostra elementos apropriados.
   * @function
   * @memberof module:perfil
   */
  btnEditar.addEventListener('click', () => {
    inputs.forEach(input => input.disabled = false);
    togglePassword.style.display = 'inline-block';
    btnSalvar.style.display = 'inline-block';
    btnEditar.style.display = 'none';
  });

  /**
   * Envia os dados atualizados do perfil via POST em JSON e atualiza a interface de acordo.
   * @function
   * @memberof module:perfil
   * @param {Event} e Evento de clique
   * @returns {Promise<void>}
   */
  btnSalvar.addEventListener('click', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/perfil/atualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        inputs.forEach(input => input.disabled = true);
        btnSalvar.style.display = 'none';
        togglePassword.style.display = 'none';
        btnEditar.style.display = 'inline-block';
        senhaInput.type = 'password';
        togglePassword.textContent = '👁️';
      } else {
        alert('Erro: ' + result.message);
      }
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  });

  /**
   * Alterna a visibilidade do campo de senha entre texto e senha.
   * @function
   * @memberof module:perfil
   */
  togglePassword.addEventListener('click', () => {
    if (senhaInput.type === 'password') {
      senhaInput.type = 'text';
      togglePassword.textContent = '🙈';
    } else {
      senhaInput.type = 'password';
      togglePassword.textContent = '👁️';
    }
  });
  
  /**
   * Redireciona para a página de pedidos.
   * @function
   * @memberof module:perfil
   */
  btnPedidos.addEventListener('click', () => {
    window.location.href = '/pedidos';
  });

  /**
   * Voltar para página anterior.
   * @function
   * @memberof module:perfil
   */
  btnVoltar.addEventListener('click', () => {
    window.location.href = '/';
  });
});
