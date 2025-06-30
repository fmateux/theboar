# The Boar

**The Boar** é uma simples aplicação web para gerenciamento de pedidos em estabelecimentos de pequeno porte. Usuários/Garçons se cadastram, fazem login, criam pedidos e acompanham seus status. O administrador pode consultar todos os pedidos e atualizar seus status.

---

## 📌 Funcionalidades

- Cadastro, login e logout de usuários  
- Perfil de usuário com listagem de pedidos  
- Criação de novos pedidos com itens e observações  
- Painel de administrador:
  - Listar todos os usuários  
  - Listar e filtrar pedidos por usuário  
  - Atualizar status de pedidos  

---

## 🧰 Tecnologias

- Node.js  
- Fastify  
- Handlebars  
- MongoDB  
- dotenv  
- @fastify/static, @fastify-view, @fastify/helmet, @fastify-cookie, @fastify-formbody  
- JSDoc & CSSdoc  

---

## 💡 Ideias de melhorias

- **Recuperação de senha por e-mail**  
  Implementar fluxo “Esqueci minha senha” com envio de token temporário.

- **Atualizações em tempo real**  
  Usar WebSockets para notificar novos pedidos ou mudanças de status sem reload.

- **Paginação e filtros avançados**  
  Na listagem de usuários/pedidos, adicionar paginação, busca por nome/email e filtros por status ou data.

- **Lógica para estabelecimentos maiores**  
  Melhorar as funcionalidades visando uma alta demanda de pedidos e modificações de status.

- **Tela para modificar o cardápio**  
  Permitir CRUD das opções do cardápio diretamente na interface, não diretamente no BD.

- **PWA (Progressive Web App)**  
  Adicionar manifest.json, service worker e caching para funcionamento offline e instalação.

---

## 🛠️ Como contribuir

1. **Fork** deste repositório  
2. **Crie uma branch** para sua feature ou correção  
   ```bash
   git checkout -b feature/minha-feature
