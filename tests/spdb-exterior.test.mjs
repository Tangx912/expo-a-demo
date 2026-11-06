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
test('side fascia hangs below the roof and entrance canopy projects from visible hall front',()=>{
 const m=createSpdbExterior();m.updateMatrixWorld(true);
 const fascia=m.getObjectByName('side-hanging-fascia');assert.ok(fascia,'side fascia exists');
 const band=new THREE.Box3().setFromObject(fascia);assert.ok(band.max.y-band.min.y>=3);
 const canopy=new THREE.Box3().setFromObject(m.getObjectByName('entrance-canopy'));
 const hall=new THREE.Box3().setFromObject(m.getObjectByName('hall-glazing'));
 assert.ok(canopy.max.z>=hall.max.z+5,'canopy projects at least 5m from front');
 assert.ok(canopy.min.y>=4&&canopy.max.y<=6,'canopy is above entrance height');
});
test('central glass hall roof aligns with the low annex roof',()=>{
 const m=createSpdbExterior();m.updateMatrixWorld(true);
 const hall=new THREE.Box3().setFromObject(m.getObjectByName('entrance-hall'));
 const annex=new THREE.Box3().setFromObject(m.getObjectByName('annex'));
 assert.ok(Math.abs(hall.max.y-annex.max.y)<.001);
});
