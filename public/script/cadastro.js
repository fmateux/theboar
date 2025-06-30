/**
 * @file cadastro.js
 * @description Script para validação e envio do formulário de cadastro de usuários
 */

/**
 * @module cadastro
 */

import { validarUsuario } from './validar-usuario.js';

/**
 * Campo nome do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const nome = document.getElementById('nome');

/**
 * Campo sobrenome do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const sobrenome = document.getElementById('sobrenome');

/**
 * Campo email do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const email = document.getElementById('email');

/**
 * Campo CPF do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const cpf = document.getElementById('cpf');

/**
 * Campo senha do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const senha1 = document.getElementById('senha');

/**
 * Campo confirmação de senha do cadastro.
 * @type {HTMLInputElement}
 * @memberof module:cadastro
 */
const senha2 = document.getElementById('confirmarSenha');

/**
 * Botão para criar conta.
 * @type {HTMLButtonElement}
 * @memberof module:cadastro
 */
const btnCriarConta = document.getElementById('btnCriarConta');

/**
 * Botão de voltar para a página inicial.
 * @constant {HTMLButtonElement|null}
 * @memberof module:cadastro
 */
const btnVoltar = document.querySelector(".botaovoltar button");
if (btnVoltar) {
  /**
   * Redireciona para a página inicial ao clicar no botão voltar.
   * @function
   * @memberof module:cadastro
   * @returns {void}
   */
  btnVoltar.addEventListener("click", () => {
    window.location.href = "/";
  });
}

/**
 * Atualiza os campos de status de erro na interface com as mensagens recebidas.
 * @function
 * @param {Object} erros Objeto contendo mensagens de erro para cada campo
 * @returns {void}
 * @memberof module:cadastro
 */
function atualizarStatus(erros) {
  document.getElementById('statusNome').textContent = erros.nome || '';
  document.getElementById('statusSobrenome').textContent = erros.sobrenome || '';
  document.getElementById('statusEmail').textContent = erros.email || '';
  document.getElementById('statusCpf').textContent = erros.cpf || '';
  document.getElementById('statusSenha').textContent = erros.senha || '';
  document.getElementById('statusConfirmarSenha').textContent = erros.confirmarSenha || '';
}

/**
 * Valida os dados do formulário de cadastro e atualiza a interface.
 * Habilita ou desabilita o botão de criação de conta conforme a validade dos dados.
 * @function
 * @returns {void}
 * @memberof module:cadastro
 */
function validarCadastro() {
  const dados = {
    nome: nome.value,
    sobrenome: sobrenome.value,
    cpf: cpf.value,
    email: email.value,
    senha: senha1.value,
    confirmarSenha: senha2.value,
  };

  const erros = validarUsuario(dados);
  atualizarStatus(erros);
  btnCriarConta.disabled = Object.keys(erros).length > 0;
}

// Adiciona listener de input para todos os campos para validar em tempo real
[nome, sobrenome, email, cpf, senha1, senha2].forEach(input => {
  input.addEventListener('input', validarCadastro);
});

/**
 * Evento de submit do formulário de cadastro.
 * Realiza validação final, envia dados via POST e trata respostas/erros.
 * @function
 * @param {Event} e Evento de submissão
 * @returns {Promise<void>}
 * @memberof module:cadastro
 */
document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  validarCadastro();

  if (btnCriarConta.disabled) return;

  const dados = {
    nome: nome.value.trim(),
    sobrenome: sobrenome.value.trim(),
    cpf: cpf.value.trim(),
    email: email.value.trim(),
    senha: senha1.value,
  };

  try {
    const resposta = await fetch('/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erroTexto = await resposta.text();
      alert("Erro ao criar conta: " + erroTexto);
      return;
    }

    alert("Conta criada com sucesso!");
    window.location.href = '/';
  } catch (err) {
    alert("Erro ao enviar dados: " + err.message);
  }
});
