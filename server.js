/**
 * @file server.js
 * @description Servidor Fastify para aplicação com proteções de segurança adicionadas (Helmet, CSP, etc).
 */

/**
 * @typedef {Object} FastifyRequest
 * @property {Object} headers Objeto com os headers da requisição
 * @property {Object} body Objeto com o corpo da requisição
 * @property {Object} query Objeto com os parâmetros de query string
 * @property {Object} cookies Objeto com os cookies da requisição
 */

/**
 * @typedef {Object} FastifyReply
 * @property {Function} code Função para definir o código HTTP da resposta
 * @property {Function} type Função para definir o tipo de conteúdo da resposta
 * @property {Function} send Função para enviar a resposta
 * @property {Function} setCookie Função para definir cookies na resposta
 */

const path = require("path");
const fastify = require("fastify")({ logger: false });
const fs = require("fs");

const { Usuario } = require("./src/models/usuario");
const { Cardapio } = require("./src/models/cardapio");
const { Pedido } = require("./src/models/pedido");

// Static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

// Middlewares
fastify.register(require("@fastify/formbody"));
fastify.register(require("@fastify/view"), {
  engine: { handlebars: require("handlebars") },
  root: path.join(__dirname, "src", "pages"),  // importante: root dos templates
  viewExt: "hbs",
});
fastify.register(require("@fastify/cookie"));

// Helmet (segurança) - Comentado temporariamente para testes
fastify.register(require("@fastify/helmet"), {
  global: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Reveal.js usa scripts inline
        "https://unpkg.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Reveal.js usa estilos inline
        "https://unpkg.com",
      ],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"], // para frameguard
    },
  },
  xssFilter: true,
  frameguard: { action: 'sameorigin' },
  referrerPolicy: { policy: "no-referrer" },
});

// Helpers Handlebars
const handlebars = require("handlebars");

handlebars.registerHelper("range", function (start, end) {
  let array = [];
  for (let i = start; i <= end; i++) {
    array.push(i);
  }
  return array;
});

handlebars.registerHelper("formatCurrency", function (total, itens) {
  let sum = 0;
  if (itens && itens.length > 0) {
    sum = itens.reduce((acc, item) => acc + parseFloat(item.valorTotal), 0);
  }
  return sum.toFixed(2);
});

handlebars.registerHelper("arrayFromTo", function (from, to, options) {
  let result = [];
  for (let i = from; i <= to; i++) {
    result.push(i);
  }
  return result;
});

/**
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
function respostaNaoAutorizado(request, reply) {
  const aceitaHtml = request.headers.accept?.includes("text/html");
  if (aceitaHtml) {
    return reply.code(401).type("text/html").send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Não autorizado</title>
          <script>
            setTimeout(() => { window.location.href = '/'; }, 5000);
          </script>
        </head>
        <body>
          <h1>Não autorizado</h1>
          <p>Você será redirecionado para a página inicial.</p>
        </body>
      </html>
    `);
  } else {
    return reply.code(401).send({ success: false, message: "Não autorizado. Redirecionando..." });
  }
}

/**
 * @param {FastifyRequest} request
 */
function obterAutenticacao(request) {
  const email = request.cookies.email || null;
  const isLogado = !!email;
  const isAdmin = email === "admin@admin.com";
  return { isLogado, isAdmin, email };
}

// Rotas principais
fastify.get("/", async (_req, reply) => reply.view("index", { title: "Página Inicial" }));
fastify.get("/apresentacao", async (_req, reply) => reply.view("apresentacao", { title: "Apresentação" }));
fastify.get("/cadastro", async (_req, reply) => reply.view("cadastro", { title: "Cadastro" }));
fastify.get("/login", async (_req, reply) => reply.view("login", { title: "Login" }));
fastify.get("/login-admin", async (_req, reply) => reply.view("login-admin", { title: "Login Admin" }));
fastify.get("/slides", async (_req, reply) => reply.view("slides", { title: "Slides" }));

fastify.get("/perfil", async (request, reply) => {
  const { isLogado, email } = obterAutenticacao(request);
  if (!isLogado) return respostaNaoAutorizado(request, reply);
  try {
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) return reply.code(404).send("Usuário não encontrado.");
    return reply.view("perfil", { ...usuario, title: "Perfil" });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error.message);
    return reply.code(500).send("Erro ao carregar informações do perfil.");
  }
});

fastify.get("/pedidos", async (request, reply) => {
  const { isLogado, email } = obterAutenticacao(request);
  if (!isLogado) return respostaNaoAutorizado(request, reply);
  try {
    const cardapioObj = await Cardapio.carregarDoBanco();
    const pedidos = await Pedido.buscarPedidos(email);
    return reply.view("pedidos", { cardapio: cardapioObj.listarTodos(), pedidos });
  } catch (error) {
    console.error("Erro ao carregar cardápio ou pedidos:", error.message);
    return reply.code(500).send("Erro ao carregar cardápio ou pedidos.");
  }
});

fastify.get("/pedidos/carregar", async (request, reply) => {
  const { isLogado, email } = obterAutenticacao(request);
  if (!isLogado) return respostaNaoAutorizado(request, reply);
  try {
    const pedidos = await Pedido.buscarPedidos(email);
    return reply.send({ success: true, pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error.message);
    return reply.code(500).send({ success: false, message: "Erro ao buscar pedidos do usuário." });
  }
});

fastify.post("/perfil/atualizar", async (request, reply) => {
  const { isLogado, email } = obterAutenticacao(request);
  if (!isLogado) return respostaNaoAutorizado(request, reply);
  try {
    const { nome, sobrenome, cpf, senha } = request.body;
    await Usuario.atualizarPorEmail(email, { nome, sobrenome, cpf, senha });
    return reply.send({ success: true, message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    return reply.status(400).send({ success: false, message: "Erro ao atualizar dados do perfil." });
  }
});

fastify.post("/pedidos", async (request, reply) => {
  const { isLogado, email } = obterAutenticacao(request);
  if (!isLogado) return respostaNaoAutorizado(request, reply);
  try {
    const { itens, observacao } = request.body;
    if (!Array.isArray(itens) || itens.length === 0)
      return reply.code(400).send({ success: false, message: "Nenhum item selecionado." });
    for (const item of itens) {
      if (!item.idCardapio || !item.quantidade || item.quantidade <= 0)
        return reply.code(400).send({ success: false, message: "Itens inválidos no pedido." });
    }
    await Pedido.cadastrarPedido(email, itens, observacao);
    return reply.send({ success: true });
  } catch (error) {
    console.error("Erro ao cadastrar pedido:", error.message);
    return reply.code(500).send({ success: false, message: "Erro ao cadastrar pedido no sistema." });
  }
});

// Rotas admin
fastify.get("/perfil-admin", async (request, reply) => {
  const { isAdmin } = obterAutenticacao(request);
  if (!isAdmin) return respostaNaoAutorizado(request, reply);
  try {
    const usuario = await Usuario.buscarPorEmail("admin@admin.com");
    if (!usuario) return reply.code(404).send("Administrador não encontrado.");
    return reply.view("perfil-admin", { ...usuario, title: "Perfil do Administrador" });
  } catch (error) {
    console.error("Erro ao carregar perfil admin:", error.message);
    return reply.code(500).send("Erro ao carregar perfil do administrador.");
  }
});

fastify.get("/perfil-admin/usuarios", async (request, reply) => {
  const { isAdmin } = obterAutenticacao(request);
  if (!isAdmin) return respostaNaoAutorizado(request, reply);
  try {
    return reply.send(await Usuario.listarTodos());
  } catch (error) {
    console.error("Erro ao buscar usuários:", error.message);
    return reply.code(500).send({ erro: "Erro ao carregar lista de usuários." });
  }
});

fastify.get("/perfil-admin/pedidos", async (request, reply) => {
  const { isAdmin } = obterAutenticacao(request);
  if (!isAdmin) return respostaNaoAutorizado(request, reply);
  const usuarioEmail = request.query.usuarioEmail;
  if (!usuarioEmail)
    return reply.code(400).send({ success: false, message: "Parâmetro usuarioEmail obrigatório." });
  try {
    return reply.send(await Pedido.buscarPedidos(usuarioEmail));
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error.message);
    return reply.code(500).send({ success: false, message: "Erro ao buscar pedidos do usuário." });
  }
});

fastify.post("/perfil-admin/atualizar-usuario", async (request, reply) => {
  const { isAdmin } = obterAutenticacao(request);
  if (!isAdmin) return respostaNaoAutorizado(request, reply);
  try {
    const { email, nome, sobrenome, cpf, senha } = request.body;
    await Usuario.atualizarPorEmail(email, { nome, sobrenome, cpf, senha });
    return reply.send({ success: true, message: "Usuário atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar usuário pelo admin:", error.message);
    return reply.status(400).send({ success: false, message: "Erro ao atualizar dados do usuário." });
  }
});

fastify.post("/perfil-admin/atualizar-pedido", async (request, reply) => {
  const { isAdmin } = obterAutenticacao(request);
  if (!isAdmin) return respostaNaoAutorizado(request, reply);
  const { updates } = request.body;
  if (!Array.isArray(updates) || updates.length === 0)
    return reply.code(400).send({ success: false, message: "Lista de updates vazia." });
  const resultados = [];
  for (const { pedidoId, status } of updates) {
    try {
      const atualizado = await Pedido.atualizarStatus(pedidoId, status);
      resultados.push({ pedidoId, status, success: atualizado });
    } catch (e) {
      resultados.push({ pedidoId, status, success: false, message: e.message });
    }
  }
  return reply.send({ success: true, atualizados: resultados });
});

// Rotas de autenticação
fastify.post("/cadastro", async (request, reply) => {
  try {
    const { nome, sobrenome, email, cpf, senha, confirmarSenha } = request.body;
    await Usuario.cadastrarUsuario({ nome, sobrenome, email, cpf, senha }, confirmarSenha);
    return reply.send({ status: "ok", message: "Cadastro realizado com sucesso!" });
  } catch (error) {
    if (error.errors) return reply.status(400).send({ status: "erro", errors: error.errors });
    if (error.message === "Email já cadastrado.") return reply.status(400).send({ status: "erro", errors: { email: error.message } });
    if (error.message === "CPF já cadastrado.") return reply.status(400).send({ status: "erro", errors: { cpf: error.message } });
    console.error("Erro ao cadastrar usuário:", error.message);
    return reply.status(500).send({ status: "erro", message: "Erro ao processar cadastro." });
  }
});

fastify.post("/login", async (request, reply) => {
  const { email, senha } = request.body;
  try {
    const usuario = await Usuario.autenticar(email, senha);
    reply.setCookie("email", email, { path: "/", httpOnly: true, sameSite: "strict", maxAge: 60 * 60 * 24 });
    return reply.send({ status: "ok", message: "Login bem-sucedido!", usuario });
  } catch (error) {
    return reply.status(401).send({ status: "erro", message: "Email ou senha inválidos." });
  }
});

fastify.post("/login-admin", async (request, reply) => {
  const { email, senha } = request.body;
  if (email !== "admin@admin.com") return reply.status(403).send({ status: "erro", message: "Acesso negado." });
  try {
    const usuario = await Usuario.autenticar(email, senha);
    reply.setCookie("email", email, { path: "/", httpOnly: true, sameSite: "strict", maxAge: 60 * 60 * 24 });
    return reply.send({ status: "ok", message: "Login de administrador bem-sucedido!", usuario });
  } catch (error) {
    return reply.status(401).send({ status: "erro", message: "Credenciais inválidas para administrador." });
  }
});

// Start server
fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em: ${address}`);
});
