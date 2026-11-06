import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../data/scene.json',import.meta.url)));
test('all requested buildings have unique identity and traceable location',()=>{
 assert.equal(data.buildings.length,23);
 assert.equal(new Set(data.buildings.map(b=>b.name)).size,23);
 for(const b of data.buildings){assert.ok(b.source);assert.ok(b.footprint.length>=4);assert.ok(b.height>0&&b.height<=160);assert.ok(b.center.every(Number.isFinite));}
});
test('seven SPDB blocks form the real southwest-northeast valley',()=>{
 const a=data.buildings.find(b=>b.name==='浦银中心A座');const d=data.buildings.find(b=>b.name==='浦银中心D座');
 assert.ok(a.center[0]>d.center[0]);assert.ok(a.center[1]<d.center[1]);
 assert.equal(data.buildings.filter(b=>/^浦银中心/.test(b.name)).length,7);
});
test('roads include real district boundary and cross streets',()=>{
 for(const n of ['世博大道','博成路','国展路','白莲泾路','高科西路'])assert.ok(data.roads.some(r=>r.name===n));
 assert.ok(data.buildings.filter(b=>b.osmId).length>=17);
});
