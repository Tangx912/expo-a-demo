import {test} from 'node:test';import assert from 'node:assert/strict';
import {getFloorDefinition,listFloors,parseFloorInput,floorFromHeight} from '../src/spdb-floor-data.js';
test('all 17 main, 6 annex and 3 basement levels have individual schematic definitions',()=>{
 assert.equal(listFloors('main').length,17);assert.equal(listFloors('annex').length,6);assert.equal(listFloors('basement').length,3);
 for(const wing of ['main','annex','basement'])for(const n of listFloors(wing)){const d=getFloorDefinition(wing,n);assert.ok(d.label&&d.disclaimer);assert.ok(d.plates.length>0);assert.ok(d.zones.length>0);}
 assert.throws(()=>getFloorDefinition('annex',7));assert.throws(()=>getFloorDefinition('main',18));
});
test('floor entry strictly validates range and understands basement notation',()=>{
 assert.deepEqual(parseFloorInput('8','main'),{wing:'main',floor:8});assert.deepEqual(parseFloorInput('B2','main'),{wing:'basement',floor:2});
 for(const value of ['0','18','1.5','8abc','-1',''])assert.throws(()=>parseFloorInput(value,'main'));
 assert.throws(()=>parseFloorInput('7','annex'));
});
test('atrium and high floors are represented without invented continuous low-rise slabs',()=>{
 assert.equal(getFloorDefinition('main',2).hallVoid,true);assert.equal(getFloorDefinition('main',6).hallVoid,true);
 assert.equal(getFloorDefinition('main',8).plates.length,1);assert.ok(getFloorDefinition('main',17).plates[0].holes.length>0);
 assert.equal(floorFromHeight('main',75.9),17);assert.equal(floorFromHeight('annex',29),6);assert.equal(floorFromHeight('main',0),1);
});
