import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSpdbExterior} from '../src/spdb-exterior.js';
test('SPDB exterior has independent high/low wings and glazed connecting hall',()=>{
 const model=createSpdbExterior({height:76});
 for(const name of ['main-tower','annex','entrance-hall'])assert.ok(model.getObjectByName(name),name);
 model.updateMatrixWorld(true);
 const main=new THREE.Box3().setFromObject(model.getObjectByName('main-tower'));
 const annex=new THREE.Box3().setFromObject(model.getObjectByName('annex'));
 const all=new THREE.Box3().setFromObject(model);
 assert.ok(main.max.y>annex.max.y*2);
 assert.ok(all.max.y<=76.1&&all.min.y>=-.1);
 assert.ok(main.max.x<annex.min.x,'wings remain separated by the entrance hall');
});
test('SPDB exterior stays finite and light enough for the district view',()=>{
 const model=createSpdbExterior({height:76});let objects=0,triangles=0;
 model.traverse(o=>{if(!o.isMesh)return;objects++;const p=o.geometry.attributes.position;
 for(const n of p.array)assert.ok(Number.isFinite(n));
 triangles+=(o.geometry.index?o.geometry.index.count:p.count)/3*(o.isInstancedMesh?o.count:1);});
 assert.ok(objects<80,`${objects} meshes`);assert.ok(triangles<35000,`${triangles} triangles`);
});
