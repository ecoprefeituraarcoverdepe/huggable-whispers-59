const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist', 'client');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read styles and scripts from dist/client/assets to include them
const assetsDir = path.join(distDir, 'assets');
let scripts = '';
let styles = '';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
  const mainCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

  if (mainJs) {
    scripts = `<script type="module" src="/assets/${mainJs}"></script>`;
  }
  if (mainCss) {
    styles = `<link rel="stylesheet" href="/assets/${mainCss}">`;
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>São João - Espaço da Acessibilidade</title>
  <meta name="description" content="Portal de gerenciamento de vagas de acessibilidade para o São João." />
  ${styles}
</head>
<body>
  <div id="root"></div>
  ${scripts}
</body>
</html>`;

fs.writeFileSync(indexPath, html);
console.log('Generated index.html at', indexPath);
