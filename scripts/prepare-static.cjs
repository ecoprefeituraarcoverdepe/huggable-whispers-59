const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const clientDir = path.join(rootDir, 'dist');
const htaccessPath = path.join(clientDir, '.htaccess');
const indexPath = path.join(clientDir, 'index.html');
const dotHtmlPath = path.join(clientDir, '.html');
const shellPath = path.join(clientDir, '_shell.html');

if (!fs.existsSync(clientDir)) {
  console.error('Build failed: dist/client was not created.');
  process.exit(1);
}

// Ensure index.html exists
if (!fs.existsSync(indexPath)) {
  if (fs.existsSync(dotHtmlPath)) {
    fs.renameSync(dotHtmlPath, indexPath);
    console.log('Renamed .html to index.html');
  } else if (fs.existsSync(shellPath)) {
    fs.copyFileSync(shellPath, indexPath);
    console.log('Copied _shell.html to index.html');
  }
}

if (!fs.existsSync(indexPath)) {
  console.error('Build failed: index.html could not be found or generated.');
  process.exit(1);
}

// .htaccess configuration for Hostinger, HostGator, and other Apache/LiteSpeed hosts
const htaccess = `Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Redirect to HTTPS if not already
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Serve existing files/directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Route everything else to index.html for React Router
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_headers.c>
  # Cache static assets
  <FilesMatch "\\.(js|mjs|css|png|jpg|jpeg|gif|svg|webp|ico|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Don't cache index.html
  <FilesMatch "index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
</IfModule>
`;

fs.writeFileSync(htaccessPath, htaccess);

// _redirects configuration for Cloudflare Pages
const redirectsPath = path.join(clientDir, '_redirects');
const redirects = `/* /index.html 200`;
fs.writeFileSync(redirectsPath, redirects);

console.log('\n--- BUILD SUCCESSFUL ---');

console.log('Instructions for Hostinger:');
console.log('1. Open your Hostinger hPanel and go to "File Manager".');
console.log('2. Open the "public_html" folder.');
console.log('3. Upload everything INSIDE "dist/client" (files and folders) to "public_html".');
console.log('4. IMPORTANT: Make sure the ".htaccess" file is included.');
console.log('-------------------------');
