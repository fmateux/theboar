/**
 * @file mongodb.js
 * @module mongodb
 * @description Módulo para operações com banco de dados MongoDB, incluindo conexão e acesso às coleções.
 */

/**
 * @external MongoClient
 * @see https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html
 */

/**
 * @external Db
 * @see https://mongodb.github.io/node-mongodb-native/3.6/api/Db.html
 */

require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

/**
 * URI de conexão ao MongoDB obtida do arquivo .env.
 * @constant {string}
 * @memberof module:mongodb
 */
const uri = process.env.MONGO_URI;

/**
 * Cliente MongoDB configurado.
 * @constant {MongoClient}
 * @memberof module:mongodb
 */
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

/**
 * Instância do banco de dados (armazenada após conexão).
 * @type {Db|undefined}
 * @memberof module:mongodb
 */
let db;

/**
 * Nome do banco de dados.
 * @constant {string}
 * @memberof module:mongodb
 */
const MyDataBase = "TheBoar";

/**
 * Nomes das coleções usadas no banco de dados.
 * @constant {Object.<string, string>}
 * @memberof module:mongodb
 */
const MyDataBaseCollections = {
  Cardapio: 'Cardapio',
  Pedidos: 'Pedidos',
  Usuarios: 'Usuarios',
};

/**
 * Conecta ao banco de dados MongoDB, reutilizando a conexão se já estiver estabelecida.
 * @async
 * @function connect
 * @memberof module:mongodb
 * @returns {Promise.<Db>} Instância do banco de dados "TheBoar"
 * @throws {Error} Caso não consiga conectar ao banco
 */
async function connect() {
  if (!db) {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    db = client.db(MyDataBase);
  }
  return db;
}

module.exports = {
  connect,
  MyDataBaseCollections,
};
