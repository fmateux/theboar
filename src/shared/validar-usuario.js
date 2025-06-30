/**
 * @file validar-usuario.js
 * @description Funções para validação de CPF e dados de usuário.
 */

/**
 * @module validarUsuario
 */

/**
 * Remove todos os caracteres não numéricos de um CPF.
 * @function
 * @param {string} cpfRaw CPF com ou sem formatação
 * @returns {string} CPF apenas com números
 * @memberof module:validarUsuario
 */
function limparCPF(cpfRaw) {
  return cpfRaw.replace(/[^\d]+/g, '');
}

/**
 * Valida um CPF verificando tamanho, dígitos iguais e dígitos verificadores.
 * @function
 * @param {string} cpfRaw CPF com ou sem formatação
 * @returns {string} Mensagem de erro vazia se válido ou mensagem de erro específica
 * @memberof module:validarUsuario
 */
function validarCPF(cpfRaw) {
  const cpf = limparCPF(cpfRaw);
  if (cpf.length !== 11) return "CPF inválido: deve conter 11 dígitos.";
  if (/^(\d)\1{10}$/.test(cpf)) return "CPF inválido: todos os dígitos iguais.";
  if (!validarDigitosCPF(cpf)) return "CPF inválido: dígitos verificadores não conferem.";
  return "";
}

/**
 * Valida os dígitos verificadores do CPF.
 * @function
 * @param {string} cpf CPF somente números (11 dígitos)
 * @returns {boolean} true se os dígitos verificadores forem válidos, false caso contrário
 * @memberof module:validarUsuario
 */
function validarDigitosCPF(cpf) {
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9), 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i), 10) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;
  return resto === parseInt(cpf.charAt(10), 10);
}

/**
 * Valida os dados de um usuário.
 * @function
 * @param {Object} dados Objeto contendo os campos do usuário
 * @param {string} dados.nome Nome do usuário
 * @param {string} dados.sobrenome Sobrenome do usuário
 * @param {string} dados.cpf CPF do usuário (com ou sem formatação)
 * @param {string} dados.email Email do usuário
 * @param {string} dados.senha Senha do usuário
 * @param {string} dados.confirmarSenha Confirmação da senha
 * @returns {Object} Objeto com mensagens de erro para cada campo inválido (campos válidos não são incluídos)
 * @memberof module:validarUsuario
 */
function validarUsuario(dados) {
  const erros = {
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  };

  if (!dados.nome || dados.nome.trim().length < 2) erros.nome = "Nome muito curto.";
  if (!dados.sobrenome || dados.sobrenome.trim().length < 2) erros.sobrenome = "Sobrenome muito curto.";
  if (!dados.email || !dados.email.includes('@') || dados.email.startsWith('@') || dados.email.endsWith('@')) erros.email = "Email inválido.";
  erros.cpf = validarCPF(dados.cpf);
  if (!dados.senha || dados.senha.length < 6) erros.senha = "Senha muito curta.";
  if (dados.senha !== dados.confirmarSenha) erros.confirmarSenha = "As senhas não coincidem.";

  for (const key in erros) {
    if (erros[key] === "") delete erros[key];
  }

  return erros;
}

module.exports = {
  limparCPF,
  validarCPF,
  validarUsuario
};
