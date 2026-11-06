import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
test('published bundle resolves every entry asset under a repository subpath',()=>{
 execFileSync(process.execPath,['scripts/build-site.mjs'],{cwd:root});
 const html=readFileSync(path.join(root,'dist/index.html'),'utf8');
 const base=new URL('https://example.github.io/expo-a-demo/');
 const urls=[...html.matchAll(/(?:href|src)="(\.\/[^\"]+)"/g)].map(m=>m[1]);
 const imports=JSON.parse(html.match(/<script type="importmap">(.*?)<\/script>/s)[1]).imports;
 urls.push(imports.three,imports['three/addons/']+'controls/OrbitControls.js');
 for(const relative of urls){
  const url=new URL(relative,base);assert.ok(url.pathname.startsWith('/expo-a-demo/'));
  if(relative!=='./')assert.ok(existsSync(path.join(root,'dist',relative)),relative);
 }
 const main=readFileSync(path.join(root,'dist/src/main.js'),'utf8');
 assert.ok(main.includes("new URL('../data/scene.json',import.meta.url)"));
 assert.ok(existsSync(path.join(root,'dist/data/scene.json')));
 assert.ok(!html.includes('/node_modules/'));
});
