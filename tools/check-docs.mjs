// Validate manual coverage, image references, and built internal links/anchors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const docs = path.join(root,'src/content/docs');
const errors = [];
let images = 0;
const coverage = JSON.parse(fs.readFileSync(path.join(root,'tools/manual-coverage.json'),'utf8'));
for (const [route, entries] of Object.entries(coverage)) {
  const text = fs.readFileSync(path.join(docs,route+'.md'),'utf8');
  const reference = text.split('<!-- BEGIN VERIFIED SITE REFERENCE -->')[1];
  if (!reference) errors.push(route+': missing verified reference');
  for (const [dt] of entries) if (!reference?.includes('\n### '+dt+'\n')) errors.push(route+': missing '+dt);
}
for (const file of walk(docs).filter(f=>/\.mdx?$/.test(f))) {
  const text = fs.readFileSync(file,'utf8');
  for (const match of text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    images++;
    if (!match[1].trim()) errors.push(file+': missing image alt text');
    if (!fs.existsSync(path.resolve(path.dirname(file),match[2]))) errors.push(file+': missing '+match[2]);
    if (match[2].includes('/screens/') && !match[2].includes('/current-')) errors.push(file+': legacy screenshot still referenced');
  }
}
const dist = path.join(root,'dist');
const htmlFiles = walk(dist).filter(f=>f.endsWith('.html'));
const html = new Map(htmlFiles.map(f=>[f,fs.readFileSync(f,'utf8')]));
const entities = s => s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');
let links = 0;
for (const [file, text] of html) {
  const route = path.relative(dist,file).replace(/index\.html$/, '');
  for (const match of text.matchAll(/href="([^"]+)"/g)) {
    const href = entities(match[1]);
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(href)) continue;
    const url = new URL(href,'http://manual.local/'+route);
    let target = path.join(dist,decodeURIComponent(url.pathname));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target,'index.html');
    links++;
    if (!fs.existsSync(target)) errors.push(path.relative(dist,file)+': broken link '+href);
    else if (url.hash && html.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      if (!html.get(target).includes('id="'+id+'"') && !html.get(target).includes('id="'+id.replaceAll('&','&amp;')+'"')) errors.push(path.relative(dist,file)+': missing anchor '+href);
    }
  }
}
if (!htmlFiles.length) errors.push('Build the manual before checking links.');
if (errors.length) { console.error([...new Set(errors)].join('\n')); process.exitCode=1; }
else console.log(`${Object.keys(coverage).length} operational pages; ${Object.values(coverage).flat().length} DocTypes; ${images} image references; ${htmlFiles.length} built pages; ${links} internal links checked.`);
