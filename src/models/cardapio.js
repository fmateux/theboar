/**
 * @file cardapio.js
 * @module models
 * @description Módulo para manipulação do cardápio, incluindo carregamento e cadastro inicial no MongoDB.
 */

const {
	connect,
	MyDataBaseCollections
} = require('../db/mongodb.js');

/**
 * Representa um item do cardápio.
 * @memberof module:models
 */
class CardapioItem {
  /**
   * Cria um item do cardápio.
   * @param {number} id - Identificador único do item.
   * @param {string} tipo - Tipo do item (ex: 'Prato Principal', 'Sobremesa', 'Bebida').
   * @param {string} titulo - Nome do item.
   * @param {string} descricao - Descrição detalhada do item.
   * @param {number} valor - Preço do item.
   */
  constructor(id, tipo, titulo, descricao, valor) {
    this.id = id;
    this.tipo = tipo;
    this.titulo = titulo;
    this.descricao = descricao;
    this.valor = valor;
  }

  /**
   * Cria uma instância de CardapioItem a partir de um objeto simples (ex: vindo do banco).
   * @param {Object} obj - Objeto com as propriedades do item.
   * @returns {CardapioItem} Novo objeto CardapioItem.
   * @memberof module:models.CardapioItem
   * @static
   */
  static fromObject(obj) {
    return new CardapioItem(obj.id, obj.tipo, obj.titulo, obj.descricao, obj.valor);
  }
}

/**
 * Representa o cardápio contendo vários itens.
 * @memberof module:models
 */
class Cardapio {
  /**
   * Cria um cardápio.
   * @param {CardapioItem[]} itens - Lista de itens do cardápio.
   */
  constructor(itens = []) {
    this.itens = itens.map(CardapioItem.fromObject);
  }

  /**
   * Busca um item do cardápio pelo seu ID.
   * @param {number} id - ID do item.
   * @returns {CardapioItem|undefined} Item encontrado ou undefined se não achar.
   * @memberof module:models.Cardapio
   */
  buscarPorId(id) {
    return this.itens.find(item => item.id === id);
  }

  /**
   * Lista todos os itens do cardápio.
   * @returns {CardapioItem[]} Lista de itens.
   * @memberof module:models.Cardapio
   */
  listarTodos() {
    return this.itens;
  }

  /**
   * Carrega o cardápio completo do banco de dados MongoDB.
   * @async
   * @returns {Promise<Cardapio>} Cardápio com os itens carregados.
   * @memberof module:models.Cardapio
   * @static
   */
  static async carregarDoBanco() {
    const db = await connect();
    const dados = await db.collection(MyDataBaseCollections.Cardapio).find().toArray();
    return new Cardapio(dados);
  }

  /**
   * Insere um cardápio inicial fixo no banco, caso a coleção esteja vazia.
   * @async
   * @returns {Promise<void>}
   * @memberof module:models.Cardapio
   * @static
   */
  static async cadastrarInicial() {
    const db = await connect();

    const cardapioFixo = [
      new CardapioItem(1,  'Prato Principal', 'Bife Acebolado Completo',     'Arroz branco, feijão preto, bife acebolado e salada fresca',                  25.50),
      new CardapioItem(2,  'Prato Principal', 'Macarrão com Almôndegas',     'Macarrão ao molho sugo com almôndegas artesanais e queijo parmesão ralado',   32.00),
      new CardapioItem(3,  'Prato Principal', 'Hambúrguer Artesanal',        'Hambúrguer artesanal com queijo cheddar, alface, tomate e maionese especial', 18.90),
      new CardapioItem(4,  'Prato Principal', 'Frango Grelhado com Legumes', 'Frango grelhado com legumes sauté e arroz integral',                          28.75),
      new CardapioItem(5,  'Prato Principal', 'Peixe Assado com Purê',       'Peixe assado com ervas finas, purê de batatas e legumes cozidos',             35.90),
      new CardapioItem(6,  'Prato Principal', 'Escondidinho de Carne Seca',  'Escondidinho de carne seca com purê de mandioca e queijo gratinado',          30.00),
      new CardapioItem(7,  'Prato Principal', 'Risoto de Cogumelos',         'Risoto de cogumelos com parmesão e toque de vinho branco',                    33.50),
      new CardapioItem(8,  'Sobremesa',       'Pudim de Leite Condensado',   'Pudim de leite condensado com calda de caramelo',                             12.00),
      new CardapioItem(9,  'Sobremesa',       'Torta de Maçã',               'Torta de maçã com canela e cobertura crocante',                               14.50),
      new CardapioItem(10, 'Sobremesa',       'Mousse de Chocolate',         'Mousse de chocolate meio amargo com raspas de laranja',                       11.00),
      new CardapioItem(11, 'Sobremesa',       'Brownie com Sorvete',         'Brownie de chocolate com sorvete de creme',                                   13.75),
      new CardapioItem(12, 'Bebida',          'Suco Natural de Laranja',     'Suco natural de laranja espremido na hora',                                    8.50),
      new CardapioItem(13, 'Bebida',          'Café Expresso Cremoso',       'Café expresso com leite vaporizado e espuma cremosa',                          7.00),
      new CardapioItem(14, 'Bebida',          'Refrigerante Lata',           'Refrigerante lata (diversos sabores)',                                         6.00),
      new CardapioItem(15, 'Bebida',          'Chá Gelado de Limão',         'Chá gelado de limão com hortelã',                                              7.50),
    ];

    const collection = db.collection(MyDataBaseCollections.Cardapio);
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log("✅ Já existe Cardápio cadastrado");
      return;
    }

    await collection.insertMany(cardapioFixo);
    console.log("✅ Cardápio inicial inserido com sucesso.");
  }
}

(async () =>{
  await Cardapio.cadastrarInicial();
})();

module.exports = {
  Cardapio,
  CardapioItem
};
