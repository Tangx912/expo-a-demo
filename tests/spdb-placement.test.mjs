import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {createSpdbExterior} from '../src/spdb-exterior.js';
const data=JSON.parse(readFileSync(new URL('../data/scene.json',import.meta.url)));
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
 const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
}return yes;}
function axis(b){let longest=0,angle=0;for(let i=0;i<b.footprint.length-1;i++){const a=b.footprint[i],c=b.footprint[i+1],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz);if(length>longest){longest=length;angle=Math.atan2(dz,dx);}}return angle;}
test('SPDB aligns with neighboring Far Eastern block and stays inside the core boundary',()=>{
 const bank=data.buildings.find(b=>b.kind==='spdb'),neighbor=data.buildings.find(b=>b.kind==='far');
 const diff=Math.abs(Math.sin(axis(bank)-axis(neighbor)));
 assert.ok(diff<Math.sin(3*Math.PI/180),'building axes differ by less than 3 degrees');
 for(const p of bank.footprint)assert.ok(inside(p,data.boundary),'plot remains within district boundary');
 assert.equal(bank.orientationDegrees,40);
});
test('entire placed SPDB exterior, including canopy, remains inside its own footprint',()=>{
 const b=data.buildings.find(b=>b.kind==='spdb');const model=createSpdbExterior();
 model.rotation.y=-b.orientationDegrees*Math.PI/180;model.position.set(b.center[0],4,b.center[1]);model.updateMatrixWorld(true);
 const matrix=new THREE.Matrix4(),combined=new THREE.Matrix4(),v=new THREE.Vector3();
 model.traverse(o=>{if(!o.isMesh)return;
  for(let n=0;n<(o.isInstancedMesh?o.count:1);n++){
   if(o.isInstancedMesh){o.getMatrixAt(n,matrix);combined.multiplyMatrices(o.matrixWorld,matrix);}else combined.copy(o.matrixWorld);
   const p=o.geometry.attributes.position;
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(combined);assert.ok(inside([v.x,v.z],b.footprint),'rendered vertex inside footprint');}
  }
 });
});
