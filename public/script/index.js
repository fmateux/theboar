/**
 * @file index.js
 * @description Script da home page para gerenciar estado de login e autenticação
 */

/**
 * @module index
 */

/**
 * Elemento de status do login.
 * @constant {HTMLElement}
 * @memberof module:index
 */
const statusLogin = document.getElementById('statusLogin');

/**
 * Container dos botões de autenticação (login, cadastro, logout, etc.).
 * @constant {HTMLElement}
 * @memberof module:index
 */
const botoesDiv = document.getElementById('authButtons');

/**
 * Botão fixo para acessar a página de apresentação.
 * @constant {HTMLButtonElement|null}
 * @memberof module:index
 */
const btnApresentacaoFixo = document.querySelector('.btn-apresentacao-fixo');
if (btnApresentacaoFixo) {
  /**
   * Manipulador de clique para redirecionar à página de apresentação.
   * @function
   * @memberof module:index
   * @returns {void}
   */
  btnApresentacaoFixo.addEventListener('click', () => {
    window.location.href = '/apresentacao';
  });
}

/**
 * Verifica se o usuário está logado e atualiza os botões de interface.
 * Exibe opções de perfil, admin e logout, ou login e cadastro conforme o caso.
 * @function
 * @returns {void}
 * @memberof module:index
 */
function verificarLogin() {
  const logado = localStorage.getItem('usuarioLogado') === 'true';
  const email = (localStorage.getItem('emailUsuario') || '').trim().toLowerCase();

  botoesDiv.innerHTML = ''; // Limpa os botões antes de adicionar novos

  if (logado) {
    statusLogin.textContent = '🔓 Você está logado.';
    const isAdmin = email === 'admin@admin.com';

    // Botão "Perfil" apenas se NÃO for admin
    if (!isAdmin) {
      /**
       * Botão para acessar o perfil do usuário.
       * @type {HTMLButtonElement}
       * @memberof module:index
       */
      const btnPerfil = document.createElement('button');
      btnPerfil.textContent = '👤 Perfil';
      btnPerfil.onclick = () => {
        window.location.href = '/perfil';
      };
      botoesDiv.appendChild(btnPerfil);
    }

    // Botão "Administrador" apenas se for admin
    if (isAdmin) {
      /**
       * Botão para acessar o painel administrativo.
       * @type {HTMLButtonElement}
       * @memberof module:index
       */
      const btnPerfilAdmin = document.createElement('button');
      btnPerfilAdmin.textContent = '👑 Administrador';
      btnPerfilAdmin.onclick = () => {
        window.location.href = '/perfil-admin';
      };
      botoesDiv.appendChild(btnPerfilAdmin);
    }

    /**
     * Botão para realizar logout.
     * @type {HTMLButtonElement}
     * @memberof module:index
     */
    const btnLogout = document.createElement('button');
    btnLogout.textContent = '🚪 Sair';
    btnLogout.onclick = logout;
    botoesDiv.appendChild(btnLogout);

  } else {
    statusLogin.textContent = '🔒 Você não está logado.';

    /**
     * Botão para acessar página de login.
     * @type {HTMLButtonElement}
     * @memberof module:index
     */
    const btnLogin = document.createElement('button');
    btnLogin.textContent = '🔐 Login';
    btnLogin.onclick = () => {
      window.location.href = '/login';
    };
    botoesDiv.appendChild(btnLogin);

    /**
     * Botão para acessar página de cadastro.
     * @type {HTMLButtonElement}
     * @memberof module:index
     */
    const btnCadastro = document.createElement('button');
    btnCadastro.textContent = '📝 Cadastrar';
    btnCadastro.onclick = () => {
      window.location.href = '/cadastro';
    };
    botoesDiv.appendChild(btnCadastro);
  }
}

/**
 * Realiza logout do sistema,
 * limpa as informações do localStorage e atualiza a interface.
 * @function
 * @returns {void}
 * @memberof module:index
 */
function logout() {
  localStorage.setItem('usuarioLogado', 'false');
  localStorage.removeItem('emailUsuario');
  verificarLogin();
  alert('Você saiu do sistema.');
}

// Executa verificação de login ao carregar a página
verificarLogin();
