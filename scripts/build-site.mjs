import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=path.join(root,'dist');
await mkdir(path.join(out,'data'),{recursive:true});
await mkdir(path.join(out,'docs'),{recursive:true});
await mkdir(path.join(out,'vendor/three/controls'),{recursive:true});
await cp(path.join(root,'src'),path.join(out,'src'),{recursive:true});
await cp(path.join(root,'data/scene.json'),path.join(out,'data/scene.json'));
await cp(path.join(root,'docs/SOURCES.md'),path.join(out,'docs/SOURCES.md'));
await cp(path.join(root,'node_modules/three/build/three.module.js'),path.join(out,'vendor/three/three.module.js'));
await cp(path.join(root,'node_modules/three/examples/jsm/controls/OrbitControls.js'),path.join(out,'vendor/three/controls/OrbitControls.js'));
await cp(path.join(root,'node_modules/three/LICENSE'),path.join(out,'vendor/three/LICENSE'));
const html=(await readFile(path.join(root,'index.html'),'utf8'))
 .replace('./node_modules/three/build/three.module.js','./vendor/three/three.module.js')
 .replace('./node_modules/three/examples/jsm/','./vendor/three/');
await writeFile(path.join(out,'index.html'),html);
await writeFile(path.join(out,'.nojekyll'),'');
console.log('Static site ready: dist/ (works at root or under a repository subpath)');
