const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const clientDir = path.join(rootDir, 'dist', 'client');
const htaccessPath = path.join(clientDir, '.htaccess');
const indexPath = path.join(clientDir, 'index.html');
const shellPath = path.join(clientDir, '_shell.html');

if (!fs.existsSync(clientDir)) {
  console.error('HostGator build failed: dist/client was not created.');
  process.exit(1);
}

if (!fs.existsSync(indexPath) && fs.existsSync(shellPath)) {
  fs.copyFileSync(shellPath, indexPath);
}

if (!fs.existsSync(indexPath)) {
  console.error('HostGator build failed: dist/client/index.html was not created.');
  process.exit(1);
}

const htaccess = `Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|mjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
`;

fs.writeFileSync(htaccessPath, htaccess);
console.log('HostGator files ready in dist/client. Upload the contents of dist/client to public_html.');
