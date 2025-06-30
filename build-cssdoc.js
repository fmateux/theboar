/**
 * @file build-cssdoc.js
 * @description Gera documentação HTML a partir de comentários customizados em arquivos CSS.
 * Os blocos de documentação devem estar entre /*--- e ---*\/, contendo title, section e resume.
 * Lê arquivos CSS em 'public/style' e gera HTML em 'docs/css'.
 * @module cssdoc
 */

const fs = require('fs');
const path = require('path');

/**
 * Extrai blocos de documentação CSS formatados no padrão customizado do CSS.
 * Cada bloco deve estar entre /*--- e ---*\/ com chaves title, section e resume.
 *
 * @function
 * @param {string} cssContent Conteúdo do arquivo CSS
 * @returns {Array<Object>} Array de objetos com as chaves title, section e resume
 * @memberof module:cssdoc
 */
function cssdoc(cssContent) {
	const blocks = [];
	const regex = /\/\*---([\s\S]*?)---\*\//g;
	let match;
	while ((match = regex.exec(cssContent)) !== null) {
		const rawContent = match[1].trim();
		const block = {};
		rawContent.split('\n').forEach(line => {
			const [key, ...rest] = line.trim().split(':');
			if (key && rest.length > 0) {
				block[key.trim()] = rest.join(':').trim();
			}
		});
		blocks.push(block);
	}
	return blocks;
}

/**
 * Gera o HTML da documentação para um arquivo CSS a partir dos blocos extraídos.
 *
 * @function
 * @param {string} title Nome do arquivo CSS (ex: cadastro.css)
 * @param {Array<Object>} docs Blocos de documentação extraídos via cssdoc()
 * @returns {string} Código HTML formatado da documentação
 * @memberof module:cssdoc
 */
function generateHTML(title, docs) {
	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<title>Documentação CSS - ${title}</title>
	<style>
		body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; background: #fff; }
		h1 { color: #333; }
		section { margin-bottom: 20px; }
		.block { border: 1px solid #ccc; border-radius: 8px; padding: 10px; background: #f9f9f9; }
		.title { font-weight: bold; font-size: 1.2em; margin-bottom: 5px; }
		.resume { color: #555; font-style: italic; }
		a { color: #007acc; text-decoration: none; }
		a:hover { text-decoration: underline; }
	</style>
</head>
<body>
	<h1>Documentação CSS: ${title}</h1>
	<p><a href="index.html">Voltar ao índice</a></p>
	${docs.map(doc => `
		<section class="block">
			<div class="title">${doc.title || 'Sem título'}</div>
			<div><strong>Seção:</strong> ${doc.section || 'Desconhecida'}</div>
			<div class="resume">${doc.resume || 'Sem resumo'}</div>
		</section>
	`).join('\n')}
	<p><a href="index.html">Voltar ao índice</a></p>
</body>
</html>`;
}

/**
 * Gera a página HTML do índice com links para todos os arquivos de documentação CSS gerados.
 * 
 * @function
 * @param {string[]} files Lista de nomes dos arquivos HTML gerados (ex: ['cadastro.html'])
 * @returns {string} Código HTML da página índice
 * @memberof module:cssdoc
 */
function generateIndexHTML(files) {
	return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<title>Documentação CSS – Índice</title>
	<style>
		body {
			font-family: "Segoe UI", Tahoma, sans-serif;
			background-color: #fff;
			color: #333;
			margin: 0;
			padding: 0 20px;
		}
		.container {
			max-width: 900px;
			margin: 40px auto;
			padding: 20px;
		}
		h1 {
			font-size: 28px;
			border-bottom: 1px solid #ccc;
			padding-bottom: 10px;
			margin-bottom: 30px;
		}
		ul {
			list-style: none;
			padding-left: 0;
		}
		li {
			margin: 10px 0;
		}
		a {
			text-decoration: none;
			color: #2a6db0;
			font-weight: bold;
		}
		a:hover {
			text-decoration: underline;
			color: #1a4c85;
		}
		.footer {
			margin-top: 60px;
			font-size: 0.85em;
			color: #777;
			border-top: 1px solid #eee;
			padding-top: 15px;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>Índice da Documentação CSS de Cada Página</h1>
		<ul>
			${files.map(f => `
			<li><a href="${f}">${f.replace(/^css_/, '')}</a></li>
			`).join('\n')}
		</ul>
		<div class="footer">
			Documentação gerada usando CSS Doc.
		</div>
	</div>
</body>
</html>`;
}

/**
 * Caminho para o diretório de entrada dos arquivos CSS.
 * @constant {string}
 * @memberof module:cssdoc
 */
const dir = path.join(__dirname, 'public', 'style');

/**
 * Caminho para o diretório de saída da documentação gerada.
 * @constant {string}
 * @memberof module:cssdoc
 */
const outDir = path.join(__dirname, 'docs', 'css');

/**
 * Cria diretório de saída se não existir.
 * @function
 * @memberof module:cssdoc
 */
if (!fs.existsSync(outDir)) {
	fs.mkdirSync(outDir, { recursive: true });
}

/**
 * Processa todos os arquivos CSS no diretório especificado,
 * gera os arquivos HTML de documentação e um índice.
 *
 * @function
 * @memberof module:cssdoc
 */
fs.readdir(dir, (err, files) => {
	if (err) {
		console.error('Erro ao ler diretório:', err.message);
		return;
	}

	const generatedFiles = [];

	files.forEach(file => {
		if (file.endsWith('.css')) {
			const filePath = path.join(dir, file);
			console.log(`Processando ${filePath}`);

			const cssContent = fs.readFileSync(filePath, 'utf8');
			const docs = cssdoc(cssContent);

			if (docs.length === 0) {
				console.warn(`Nenhum bloco de documentação encontrado em ${file}`);
				return;
			}

			const html = generateHTML(file, docs);
			const outputFileName = 'css_' + file.replace('.css', '.html');
			const outputFile = path.join(outDir, outputFileName);
			fs.writeFileSync(outputFile, html, 'utf8');
			console.log(`Documentação gerada: ${outputFile}`);

			generatedFiles.push(outputFileName);
		}
	});

	if (generatedFiles.length > 0) {
		const indexHTML = generateIndexHTML(generatedFiles);
		fs.writeFileSync(path.join(outDir, 'index.html'), indexHTML, 'utf8');
		console.log(`Índice gerado: ${path.join(outDir, 'index.html')}`);
	} else {
		console.warn('Nenhuma documentação CSS gerada. Índice não criado.');
	}
});
