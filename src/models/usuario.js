/**
 * @file usuario.js
 * @module models
 * @description Módulo para manipulação de usuários, incluindo cadastro, validação, autenticação e atualização.
 */

const { connect, MyDataBaseCollections } = require('../db/mongodb.js');
const { limparCPF, validarCPF, validarUsuario } = require('../shared/validar-usuario.js');

/**
 * Representa e valida um CPF.
 */
class CPF {
  /**
   * Cria uma instância de CPF limpando e validando o valor bruto.
   * @param {string} cpfRaw CPF com ou sem máscara.
   * @throws {Error} Caso o CPF seja inválido.
   */
  constructor(cpfRaw) {
    this.cpf = limparCPF(cpfRaw);
    const erro = validarCPF(this.cpf);
    if (erro) throw new Error(erro);
  }

  /**
   * Retorna o CPF limpo.
   * @returns {string}
   */
  toString() {
    return this.cpf;
  }
}

/**
 * Representa um usuário do sistema.
 */
class Usuario {
  /**
   * Cria uma instância de usuário com validação básica.
   * @param {Object} params
   * @param {string} params.nome
   * @param {string} params.sobrenome
   * @param {string} params.cpf
   * @param {string} params.email
   * @param {string} params.senha
   */
  constructor({ nome, sobrenome, cpf, email, senha }) {
    this.nome = nome.trim();
    this.sobrenome = sobrenome.trim();
    this.email = email.trim();
    this.senha = senha;

    try {
      this.cpf = new CPF(cpf).toString();
    } catch (e) {
      this.cpf = null;
      this.erroCPF = e.message;
    }
  }

  /**
   * Valida os campos do usuário, usando confirmarSenha para validar confirmação.
   * @param {string} [confirmarSenha=this.senha] Senha para confirmar.
   * @returns {Object} Objeto com erros por campo, vazio se válido.
   */
  validarCampos(confirmarSenha = this.senha) {
    const dados = {
      nome: this.nome,
      sobrenome: this.sobrenome,
      cpf: this.cpf || '',
      email: this.email,
      senha: this.senha,
      confirmarSenha,
    };
    return validarUsuario(dados);
  }

  /**
   * Retorna se o usuário está válido segundo a validação dos campos.
   * @param {string} confirmarSenha Senha para confirmar.
   * @returns {boolean}
   */
  ehValido(confirmarSenha) {
    return Object.keys(this.validarCampos(confirmarSenha)).length === 0;
  }

  /**
   * Converte para objeto para salvar no banco.
   * @returns {Object}
   */
  toDBObject() {
    return {
      nome: this.nome,
      sobrenome: this.sobrenome,
      cpf: this.cpf,
      email: this.email,
      senha: this.senha,
    };
  }

  /**
   * Cadastra um novo usuário após validar dados e verificar duplicidade.
   * @param {Object} dadosUsuario Dados do usuário.
   * @param {string} confirmarSenha Senha para confirmação.
   * @returns {Promise<boolean>} true se cadastro realizado.
   * @throws {Error} Em caso de dados inválidos ou duplicidade.
   */
  static async cadastrarUsuario(dadosUsuario, confirmarSenha) {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);

    const usuario = new Usuario(dadosUsuario);
    const erros = usuario.validarCampos(confirmarSenha);
    if (Object.keys(erros).length > 0) {
      const err = new Error("Dados inválidos para cadastro de usuário.");
      err.errors = erros;
      throw err;
    }

    const existeEmail = await usuariosCol.findOne({ email: usuario.email });
    if (existeEmail) throw new Error("Email já cadastrado.");

    const existeCPF = await usuariosCol.findOne({ cpf: usuario.cpf });
    if (existeCPF) throw new Error("CPF já cadastrado.");

    await usuariosCol.insertOne(usuario.toDBObject());
    return true;
  }

  /**
   * Atualiza dados do usuário por e-mail.
   * @param {string} email E-mail do usuário a ser atualizado.
   * @param {Object} novosDados Novos dados para atualizar.
   * @returns {Promise<boolean>} true se atualizado.
   * @throws {Error} Em caso de dados inválidos ou usuário não encontrado.
   */
  static async atualizarPorEmail(email, novosDados) {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);

    const usuario = new Usuario({ email, ...novosDados });
    const erros = usuario.validarCampos();
    if (Object.keys(erros).length > 0) {
      const err = new Error("Dados inválidos para atualização de usuário.");
      err.errors = erros;
      throw err;
    }

    const resultado = await usuariosCol.updateOne(
      { email },
      { $set: usuario.toDBObject() }
    );

    if (resultado.matchedCount === 0) {
      throw new Error("Usuário não encontrado para atualizar.");
    }

    return true;
  }

  /**
   * Busca usuário por e-mail.
   * @param {string} email E-mail do usuário.
   * @returns {Promise<Object|null>} Usuário encontrado ou null.
   */
  static async buscarPorEmail(email) {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);
    return await usuariosCol.findOne({ email });
  }

  /**
   * Lista todos os usuários cadastrados.
   * @returns {Promise<Array<Object>>} Lista de usuários.
   */
  static async listarTodos() {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);
    return await usuariosCol.find().toArray();
  }

  /**
   * Autentica um usuário pelo e-mail e senha.
   * @param {string} email E-mail do usuário.
   * @param {string} senha Senha do usuário.
   * @returns {Promise<{nome: string, email: string}>} Dados básicos do usuário autenticado.
   * @throws {Error} Se e-mail não cadastrado ou senha inválida.
   */
  static async autenticar(email, senha) {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);

    const usuario = await usuariosCol.findOne({ email });
    if (!usuario) {
      throw new Error("E-Mail Não Cadastrado");
    }
    if (usuario.senha !== senha) {
      throw new Error("Senha Inválida");
    }

    return { nome: usuario.nome, email: usuario.email };
  }

  /**
   * Cadastra um usuário administrador inicial se não existir.
   * @param {string} [email='admin@admin.com'] E-mail do administrador.
   * @returns {Promise<void>}
   */
  static async cadastrarInicial(email = 'admin@admin.com') {
    const db = await connect();
    const usuariosCol = db.collection(MyDataBaseCollections.Usuarios);
    const count = await usuariosCol.countDocuments({ email });

    if (count > 0) {
      console.log(`✔️ Já existe Administrador cadastrado`);
      return;
    }

    const usuario = new Usuario({
      nome: 'Administrador',
      sobrenome: 'Administrador',
      cpf: '00000000000',
      email,
      senha: '123admin'
    });

    await usuariosCol.insertOne(usuario.toDBObject());
    console.log(`✅ Administrador cadastrado: ${email}`);
  }
}

// Cadastra admin inicial automaticamente
(async () => {
  await Usuario.cadastrarInicial();
})();

module.exports = { Usuario };
