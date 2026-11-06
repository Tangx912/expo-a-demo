import {test} from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {getFloorDefinition,listFloors} from '../src/spdb-floor-data.js';import {createFloorModel} from '../src/spdb-floor-model.js';
test('every schematic level creates finite bounded geometry',()=>{
 for(const wing of ['main','annex','basement'])for(const f of listFloors(wing)){
  const m=createFloorModel(getFloorDefinition(wing,f));m.updateMatrixWorld(true);let triangles=0;
  m.traverse(o=>{if(o.isMesh){for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.count||1);}});
  const b=new THREE.Box3().setFromObject(m);assert.ok(b.max.y<5&&b.min.y>=-.6);assert.ok(b.min.x>=-36&&b.max.x<=34&&b.min.z>=-28&&b.max.z<=28);assert.ok(triangles<50000);
 }
});
test('17F atrium opening is an actual hole in the slab',()=>{
 const m=createFloorModel(getFloorDefinition('main',17));m.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(-18,10,10),new THREE.Vector3(0,-1,0));
 assert.equal(ray.intersectObjects(m.children,true).length,0);
});
