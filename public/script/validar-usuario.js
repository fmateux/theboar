/**
 * @file validar-usuario.js
 * @module validarUsuario
 * @description Funções para validar CPF e dados de usuário no formulário de cadastro.
 */

/**
 * Remove todos os caracteres que não são dígitos do CPF.
 * @function
 * @memberof module:validarUsuario
 * @param {string} cpfRaw CPF bruto (com ou sem máscara)
 * @returns {string} CPF limpo (apenas dígitos)
 */
export function limparCPF(cpfRaw) {
  return cpfRaw.replace(/[^\d]+/g, '');
}

/**
 * Valida o CPF completo, incluindo tamanho, padrão e dígitos verificadores.
 * @function
 * @memberof module:validarUsuario
 * @param {string} cpfRaw CPF bruto (com ou sem máscara)
 * @returns {string} Mensagem de erro ou string vazia se válido
 */
export function validarCPF(cpfRaw) {
  const cpf = limparCPF(cpfRaw);
  if (cpf.length !== 11) return "CPF inválido: deve conter 11 dígitos.";
  if (/^(\d)\1{10}$/.test(cpf)) return "CPF inválido: todos os dígitos iguais.";
  if (!validarDigitosCPF(cpf)) return "CPF inválido: dígitos verificadores não conferem.";
  return "";
}

/**
 * Valida os dígitos verificadores do CPF
 * @function
 * @memberof module:validarUsuario
 * @param {string} cpf CPF limpo com 11 dígitos
 * @returns {boolean} true se os dígitos verificadores conferem
 * @private
 */
function validarDigitosCPF(cpf) {
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;

  return resto === parseInt(cpf.charAt(10));
}

/**
 * Valida os dados básicos do usuário para cadastro.
 * @function
 * @memberof module:validarUsuario
 * @param {Object} dados Dados do usuário
 * @param {string} dados.nome Nome do usuário
 * @param {string} dados.sobrenome Sobrenome do usuário
 * @param {string} dados.cpf CPF do usuário
 * @param {string} dados.email Email do usuário
 * @param {string} dados.senha Senha do usuário
 * @param {string} dados.confirmarSenha Confirmação da senha
 * @returns {Object} Objeto com erros para cada campo (chave removida se não houver erro)
 */
export function validarUsuario(dados) {
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
  if (
    !dados.email ||
    !dados.email.includes('@') ||
    dados.email.startsWith('@') ||
    dados.email.endsWith('@')
  ) erros.email = "Email inválido.";

  erros.cpf = validarCPF(dados.cpf);

  if (!dados.senha || dados.senha.length < 6) erros.senha = "Senha muito curta.";
  if (dados.senha !== dados.confirmarSenha) erros.confirmarSenha = "As senhas não coincidem.";

  // Remove chaves sem erro para retornar só erros efetivos
  for (const key in erros) {
    if (erros[key] === "") delete erros[key];
  }

  return erros;
}
