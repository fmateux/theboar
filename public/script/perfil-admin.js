/**
 * @file perfil-admin.js
 * @description Script de administração de perfis de usuários com controle de exibição de senha e gerenciamento de pedidos.
 * @module perfilAdmin
 */

document.addEventListener("DOMContentLoaded", () => {
  /**
   * Lista de usuários exibida no painel.
   * @type {HTMLElement}
   * @memberof module:perfilAdmin
   */
  const listaUsuarios = document.getElementById("listaUsuarios");

  /**
   * Formulário para edição de perfil.
   * @type {HTMLFormElement}
   * @memberof module:perfilAdmin
   */
  const form = document.getElementById("formAdminPerfil");

  /** Botões de edição, salvar e voltar */
  const btnEditar = document.getElementById("btnEditar");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnVoltar = document.getElementById("btnVoltar");

  /** Campos de entrada do perfil */
  const inputNome = document.getElementById("nome");
  const inputSobrenome = document.getElementById("sobrenome");
  const inputEmail = document.getElementById("email");
  const inputCPF = document.getElementById("cpf");
  const inputSenha = document.getElementById("senha");

  /** Ícone para mostrar/ocultar senha */
  const togglePassword = document.getElementById("togglePassword");

  /** Contêiner de pedidos e controles */
  const pedidosContainer = document.getElementById("pedidosUsuario");
  const botoesPedidosContainer = document.getElementById("botoesPedidosContainer");

  /** Botões de editar e salvar pedidos */
  const btnEditarPedidos = document.getElementById("btnEditarPedidos");
  const btnSalvarPedidos = document.getElementById("btnSalvarPedidos");

  /** Array com todos os usuários carregados */
  let usuarios = [];

  /** Índice do usuário atualmente selecionado */
  let usuarioSelecionadoIndex = null;

  /** Flag indicando se está no modo de edição */
  let editando = false;

  /** Array com selects dos status dos pedidos */
  let selectsStatusPedidos = [];

  /** Mapa para controlar alterações nos status dos pedidos */
  let statusAlterados = new Map();

  // Inicialmente esconder o ícone do olho
  togglePassword.style.display = 'none';

  /**
   * Busca os usuários do backend e atualiza a lista visual.
   * @async
   * @function
   * @memberof module:perfilAdmin
   * @returns {Promise<void>}
   */
  async function buscarUsuarios() {
    listaUsuarios.innerHTML = "";
    try {
      const res = await fetch("/perfil-admin/usuarios");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = await res.json();

      if (usuarios.length === 0) {
        listaUsuarios.innerHTML = "<li>Nenhum usuário encontrado.</li>";
        return;
      }

      carregarListaUsuariosVisual();
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
      listaUsuarios.innerHTML = "<li style='color: red;'>Erro ao carregar usuários. Tente novamente.</li>";
    }
  }

  /**
   * Atualiza a lista de usuários no DOM.
   * @function
   * @memberof module:perfilAdmin
   */
  function carregarListaUsuariosVisual() {
    listaUsuarios.innerHTML = "";
    usuarios.forEach((u, i) => {
      const li = document.createElement("li");
      li.classList.add("usuario-lista-item");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "usuarioSelecionado";
      radio.value = i;
      radio.id = `usuarioRadio${i}`;
      if (usuarioSelecionadoIndex === i) radio.checked = true;

      radio.addEventListener("change", () => selecionarUsuario(i));

      const label = document.createElement("label");
      label.htmlFor = `usuarioRadio${i}`;
      label.classList.add("usuario-label");
      label.title = `${u.nome} ${u.sobrenome} - ${u.email}`;
      label.textContent = `${u.nome} ${u.sobrenome} - ${u.email}`;

      li.appendChild(radio);
      li.appendChild(label);
      listaUsuarios.appendChild(li);
    });
  }

  /**
   * Seleciona um usuário e atualiza os campos do formulário.
   * @function
   * @memberof module:perfilAdmin
   * @param {number} index Índice do usuário selecionado
   */
  function selecionarUsuario(index) {
    usuarioSelecionadoIndex = index;
    const usuarioSelecionado = usuarios[index];
    if (!usuarioSelecionado) return;

    inputNome.value = usuarioSelecionado.nome || "";
    inputSobrenome.value = usuarioSelecionado.sobrenome || "";
    inputEmail.value = usuarioSelecionado.email || "";
    inputCPF.value = usuarioSelecionado.cpf || "";
    inputSenha.value = usuarioSelecionado.senha || "";

    setCamposEditaveis(false);
    editando = false;
    togglePassword.style.display = 'none';
    inputSenha.type = "password";
    togglePassword.textContent = "👁️";

    carregarPedidosDoUsuario(usuarioSelecionado.email);
  }

  /**
   * Define se os campos do perfil são editáveis.
   * @function
   * @memberof module:perfilAdmin
   * @param {boolean} editavel Define se os campos estarão editáveis
   */
  function setCamposEditaveis(editavel) {
    inputNome.disabled = !editavel;
    inputSobrenome.disabled = !editavel;
    inputEmail.disabled = !editavel;
    inputCPF.disabled = !editavel;
    inputSenha.disabled = !editavel;
  }

  // Alterna visibilidade da senha
  togglePassword.addEventListener("click", () => {
    if (inputSenha.type === "password") {
      inputSenha.type = "text";
      togglePassword.textContent = "🙈";
    } else {
      inputSenha.type = "password";
      togglePassword.textContent = "👁️";
    }
  });

  btnEditar.addEventListener("click", () => {
    if (usuarioSelecionadoIndex === null) {
      alert("Selecione um usuário para editar.");
      return;
    }
    setCamposEditaveis(true);
    togglePassword.style.display = "inline-block";
    editando = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!editando) {
      alert("Clique em editar antes de salvar.");
      return;
    }
    if (usuarioSelecionadoIndex === null) {
      alert("Nenhum usuário selecionado.");
      return;
    }

    const usuarioSelecionado = usuarios[usuarioSelecionadoIndex];

    const dadosAtualizados = {
      id: usuarioSelecionado.id || usuarioSelecionado._id,
      nome: inputNome.value.trim(),
      sobrenome: inputSobrenome.value.trim(),
      email: inputEmail.value.trim(),
      cpf: inputCPF.value.trim(),
    };

    if (inputSenha.value.trim() !== "") {
      dadosAtualizados.senha = inputSenha.value.trim();
    }

    try {
      const res = await fetch("/perfil-admin/atualizar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados),
      });

      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);

      alert("Usuário atualizado com sucesso!");
      usuarios = usuarios.map(u =>
        (u.id === dadosAtualizados.id || u._id === dadosAtualizados.id)
          ? { ...u, ...dadosAtualizados }
          : u
      );
      selecionarUsuario(usuarios.findIndex(u => (u.id === dadosAtualizados.id || u._id === dadosAtualizados.id)));
      carregarListaUsuariosVisual();

      editando = false;
      setCamposEditaveis(false);

      // Após salvar, resetar o input senha e esconder o ícone
      inputSenha.type = "password";
      togglePassword.textContent = "👁️";
      togglePassword.style.display = "none";
    } catch (e) {
      console.error("Erro ao salvar usuário:", e);
      alert("Erro ao salvar usuário. Tente novamente.");
    }
  });

  /**
   * Carrega os pedidos do usuário selecionado e monta tabela com status editável.
   * @async
   * @function
   * @memberof module:perfilAdmin
   * @param {string} emailUsuario Email do usuário para carregar pedidos
   * @returns {Promise<void>}
   */
  async function carregarPedidosDoUsuario(emailUsuario) {
    pedidosContainer.innerHTML = "<p>Carregando pedidos...</p>";

    statusAlterados.clear();
    selectsStatusPedidos = [];
    setEditavelPedidos(false);

    try {
      const res = await fetch(`/perfil-admin/pedidos?usuarioEmail=${encodeURIComponent(emailUsuario)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const pedidos = await res.json();

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        pedidosContainer.innerHTML = "<p>Nenhum pedido encontrado.</p>";
        botoesPedidosContainer.style.display = "none";
        return;
      }

      pedidos.sort((a, b) => new Date(b.data) - new Date(a.data));

      botoesPedidosContainer.style.display = "block";

      const tabela = document.createElement("table");
      tabela.classList.add("tabela-pedidos-usuario");
      tabela.style.width = "100%";
      tabela.style.borderCollapse = "collapse";
      tabela.style.marginTop = "10px";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr style="background-color: #ddd;">
          <th style="border: 1px solid #ccc; padding: 5px;">ID Pedido</th>
          <th style="border: 1px solid #ccc; padding: 5px;">Itens</th>
          <th style="border: 1px solid #ccc; padding: 5px;">Observação</th>
          <th style="border: 1px solid #ccc; padding: 5px;">Data</th>
          <th style="border: 1px solid #ccc; padding: 5px;">Total (R$)</th>
          <th style="border: 1px solid #ccc; padding: 5px;">Status</th>
        </tr>
      `;
      tabela.appendChild(thead);

      const tbody = document.createElement("tbody");

      const statusPedidos = ['Confirmado', 'Em preparo', 'Entregue', 'Cancelado'];

      pedidos.forEach(pedido => {
        const tr = document.createElement("tr");

        let itensStr = "";
        if (pedido.itens && Array.isArray(pedido.itens)) {
          itensStr = pedido.itens.map(item => {
            const nomeItem = item.titulo || "Sem nome";
            const qtd = item.quantidade ?? 1;
            const precoUnitario = parseFloat(item.valorUnitario || item.valorTotal || "0") / qtd;
            return `${qtd}x ${nomeItem} - R$ ${precoUnitario.toFixed(2)}`;
          }).join("<br>");
        }

        let total = 0;
        if (pedido.itens && Array.isArray(pedido.itens)) {
          total = pedido.itens.reduce((acc, item) => acc + parseFloat(item.valorTotal || "0"), 0);
        }

        const selectStatus = document.createElement("select");
        selectStatus.style.width = "100%";
        selectStatus.dataset.pedidoId = pedido._id || pedido.id;
        selectStatus.disabled = true;

        statusPedidos.forEach(status => {
          const option = document.createElement("option");
          option.value = status;
          option.textContent = status;
          if (status === pedido.status) {
            option.selected = true;
          }
          selectStatus.appendChild(option);
        });

        const tdStatus = document.createElement("td");
        tdStatus.style.border = "1px solid #ccc";
        tdStatus.style.padding = "5px";
        tdStatus.appendChild(selectStatus);

        tr.innerHTML = `
          <td style="border: 1px solid #ccc; padding: 5px;">${pedido._id || pedido.id || "N/A"}</td>
          <td style="border: 1px solid #ccc; padding: 5px;">${itensStr}</td>
          <td style="border: 1px solid #ccc; padding: 5px;">${pedido.observacao || ""}</td>
          <td style="border: 1px solid #ccc; padding: 5px;">${pedido.data ? new Date(pedido.data).toLocaleString() : "N/A"}</td>
          <td style="border: 1px solid #ccc; padding: 5px; text-align: right;">${total.toFixed(2)}</td>
        `;

        tr.appendChild(tdStatus);
        tbody.appendChild(tr);

        selectsStatusPedidos.push(selectStatus);

        selectStatus.addEventListener("change", (e) => {
          const novoStatus = e.target.value;
          const pedidoId = e.target.dataset.pedidoId;
          statusAlterados.set(pedidoId, novoStatus);
        });
      });

      tabela.appendChild(tbody);
      pedidosContainer.innerHTML = "";
      pedidosContainer.appendChild(tabela);
      pedidosContainer.appendChild(botoesPedidosContainer);
    } catch (e) {
      pedidosContainer.innerHTML = "<p style='color:red;'>Erro ao carregar pedidos.</p>";
      botoesPedidosContainer.style.display = "none";
      console.error("Erro ao carregar pedidos:", e);
    }
  }

  /**
   * Define o estado editável dos selects de status e botões.
   * @function
   * @memberof module:perfilAdmin
   * @param {boolean} editavel Se os selects devem estar habilitados
   */
  function setEditavelPedidos(editavel) {
    selectsStatusPedidos.forEach(select => {
      select.disabled = !editavel;
    });
    btnSalvarPedidos.disabled = !editavel;
    btnEditarPedidos.disabled = editavel;
  }

  btnEditarPedidos.addEventListener("click", () => {
    if (usuarioSelecionadoIndex === null) {
      alert("Selecione um usuário antes de editar os pedidos.");
      return;
    }
    setEditavelPedidos(true);
  });

  btnSalvarPedidos.addEventListener("click", async () => {
    if (statusAlterados.size === 0) {
      alert("Nenhuma alteração para salvar.");
      setEditavelPedidos(false);
      return;
    }

    try {
      const updates = [];
      for (const [pedidoId, novoStatus] of statusAlterados.entries()) {
        updates.push({ pedidoId, status: novoStatus });
      }

      const res = await fetch("/perfil-admin/atualizar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error(`Erro HTTP ao atualizar status dos pedidos: ${res.status}`);

      alert("Status dos pedidos atualizados com sucesso!");
      statusAlterados.clear();
      setEditavelPedidos(false);
    } catch (e) {
      console.error("Erro ao salvar status dos pedidos:", e);
      alert("Erro ao salvar status dos pedidos. Tente novamente.");
    }
  });

  btnVoltar.addEventListener("click", () => {
      window.location.href = "/";
  });

  // Inicia carregando a lista de usuários
  buscarUsuarios();
});
