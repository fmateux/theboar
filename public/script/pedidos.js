/**
 * @file pedidos.js
 * @description Script para manipulação do formulário de pedidos e exibição dos pedidos realizados
 */

/**
 * @module pedidos
 */

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Elementos da página relacionados a pedidos
   * @constant {HTMLElement}
   * @memberof module:pedidos
   */
  const tabelaCardapio = document.getElementById('tabelaCardapio');
  const itensSelecionadosDiv = document.getElementById('itensSelecionados');
  const valorTotalInput = document.getElementById('valorTotal');
  const formPedido = document.getElementById('formPedido');
  const msgResposta = document.getElementById('msgResposta');
  const corpoPedidos = document.getElementById('corpoPedidos');

  /**
   * Atualiza a lista de itens selecionados e o valor total no formulário.
   * @function
   * @memberof module:pedidos
   * @returns {Array<Object>} Lista de itens selecionados com dados id, título, tipo, quantidade e subtotal
   */
  function atualizarItensSelecionados() {
    let total = 0;
    const itensSelecionados = [];
    itensSelecionadosDiv.innerHTML = ''; // limpa a lista

    let temItens = false;

    tabelaCardapio.querySelectorAll('tbody tr').forEach(tr => {
      const select = tr.querySelector('select.quantidade-select');
      const quantidade = parseInt(select.value, 10);

      if (quantidade > 0) {
        temItens = true;

        const id = tr.getAttribute('data-id');
        const titulo = tr.getAttribute('data-titulo');
        const tipo = tr.getAttribute('data-tipo');
        const valorUnitario = parseFloat(tr.getAttribute('data-valor'));

        const subtotal = valorUnitario * quantidade;
        total += subtotal;

        itensSelecionados.push({ id, titulo, tipo, quantidade, subtotal });

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-selecionado');
        itemDiv.textContent = `${quantidade}x ${titulo} (${tipo}) - R$ ${subtotal.toFixed(2)}`;
        itensSelecionadosDiv.appendChild(itemDiv);
      }
    });

    if (!temItens) {
      itensSelecionadosDiv.innerHTML = '<p>Nenhum item selecionado.</p>';
    } else {
      msgResposta.textContent = ''; // limpa mensagem ao selecionar itens
    }

    valorTotalInput.value = total.toFixed(2);

    return itensSelecionados;
  }

  /**
   * Carrega e exibe a lista de pedidos realizados do usuário.
   * @async
   * @function
   * @memberof module:pedidos
   * @returns {Promise<void>}
   */
  async function carregarPedidos() {
    try {
      const res = await fetch('/pedidos/carregar');
      const data = await res.json();

      if (data.success && Array.isArray(data.pedidos)) {
        // Ordena os pedidos por data decrescente
        data.pedidos.sort((a, b) => new Date(b.data) - new Date(a.data));

        corpoPedidos.innerHTML = '';
        data.pedidos.forEach(pedido => {
          const tr = document.createElement('tr');

          const tdId = document.createElement('td');
          tdId.textContent = pedido.id;

          const tdData = document.createElement('td');
          tdData.textContent = new Date(pedido.data).toLocaleString('pt-BR'); // inclui hora

          const tdItens = document.createElement('td');
          const ul = document.createElement('ul');
          ul.classList.add('lista-itens');
          pedido.itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.quantidade}x ${item.titulo} (${item.tipo}) - R$ ${item.valorTotal}`;
            ul.appendChild(li);
          });
          tdItens.appendChild(ul);

          const tdObs = document.createElement('td');
          tdObs.textContent = pedido.observacao || '-';

          const tdStatus = document.createElement('td');
          tdStatus.textContent = pedido.status;

          const tdTotal = document.createElement('td');
          const totalPedido = pedido.itens.reduce((s, i) => s + parseFloat(i.valorTotal), 0).toFixed(2);
          tdTotal.textContent = `R$ ${totalPedido}`;

          [tdId, tdData, tdItens, tdObs, tdStatus, tdTotal].forEach(td => tr.appendChild(td));
          corpoPedidos.appendChild(tr);
        });
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    }
  }

  // Evento para atualizar itens selecionados quando a quantidade mudar
  tabelaCardapio.addEventListener('change', e => {
    if (e.target.matches('select.quantidade-select')) {
      atualizarItensSelecionados();
    }
  });

  // Inicializa estado da página
  atualizarItensSelecionados();
  carregarPedidos();

  /**
   * Envio do formulário de pedido
   * @memberof module:pedidos
   */
  formPedido.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itens = atualizarItensSelecionados();
    if (itens.length === 0) {
      msgResposta.textContent = 'Selecione ao menos um item com quantidade maior que zero.';
      return;
    }

    const itensParaEnviar = itens.map(item => ({
      idCardapio: Number(item.id),
      quantidade: item.quantidade,
    }));

    const observacao = document.getElementById('observacao').value;

    try {
      const response = await fetch('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: itensParaEnviar, observacao }),
      });

      const result = await response.json();

      if (result.success) {
        msgResposta.textContent = 'Pedido feito com sucesso!';

        // Zera as quantidades dos selects
        tabelaCardapio.querySelectorAll('select.quantidade-select').forEach(select => {
          select.value = '0';
        });

        formPedido.reset();
        atualizarItensSelecionados();
        await carregarPedidos();
      } else {
        msgResposta.textContent = result.message || 'Erro ao enviar pedido.';
      }
    } catch (error) {
      msgResposta.textContent = 'Erro na requisição: ' + error.message;
    }
  });

  // Botão para voltar para o perfil
  document.getElementById('btnVoltarPedidos').addEventListener('click', () => {
    window.location.href = '/perfil';
  });
});
