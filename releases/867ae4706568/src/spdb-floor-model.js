import * as THREE from 'three';
export const FLOOR_COLORS={office:'#b9d6c5',meeting:'#d9c49c',public:'#bad2df',core:'#9faaa9',service:'#c7c4b3',parking:'#c3cdd2',atrium:'#aac8a0'};
export function createFloorModel(def){
 const group=new THREE.Group();group.name='spdb-floor-'+def.wing+'-'+def.floor;group.userData.labels=[];
 const materials=new Map(),batches=new Map();
 const mat=(color)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.04}));return materials.get(color);};
 function box(color,x,y,z,w,h,d){if(!batches.has(color))batches.set(color,[]);batches.get(color).push([x,y,z,w,h,d]);}
 function slab(p,color){
  const shape=new THREE.Shape();shape.moveTo(p.x-p.w/2,-(p.z-p.d/2));shape.lineTo(p.x+p.w/2,-(p.z-p.d/2));shape.lineTo(p.x+p.w/2,-(p.z+p.d/2));shape.lineTo(p.x-p.w/2,-(p.z+p.d/2));shape.closePath();
  for(const hole of p.holes){const h=new THREE.Path();h.moveTo(hole.x-hole.w/2,-(hole.z-hole.d/2));h.lineTo(hole.x-hole.w/2,-(hole.z+hole.d/2));h.lineTo(hole.x+hole.w/2,-(hole.z+hole.d/2));h.lineTo(hole.x+hole.w/2,-(hole.z-hole.d/2));h.closePath();shape.holes.push(h);}
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.35,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,mat(color));mesh.position.y=-.35;mesh.receiveShadow=true;group.add(mesh);
 }
 function perimeter(p,height,color){
  for(const side of [-1,1]){box(color,p.x,.02+height/2,p.z+side*p.d/2,p.w,height,.12);box(color,p.x+side*p.w/2,.02+height/2,p.z,.12,height,p.d);}
 }
 for(const p of def.plates){slab(p,p.part===def.wing||p.part==='basement'?'#e4e9df':'#d4ddd6');perimeter(p,.9,'#bfd0cb');for(const hole of p.holes)perimeter(hole,.85,'#8dada7');}
 for(const z of def.zones){
  box(FLOOR_COLORS[z.type],z.x,.025,z.z,z.w,.05,z.d);
  const height=z.type==='core'?2.7:z.type==='atrium'?.1:1.15;
  if(z.type!=='atrium'&&z.type!=='parking')perimeter(z,height,z.type==='core'?'#7f9290':'#e9ece4');
  group.userData.labels.push({text:z.label,x:z.x,y:height+.3,z:z.z});
  if(z.furniture==='desks'){
   for(let x=z.x-z.w/2+1.25;x<z.x+z.w/2-1;x+=2.8)for(let zz=z.z-z.d/2+1.5;zz<z.z+z.d/2-1;zz+=3.6){
    box('#edf0e8',x,.8,zz,1.8,.12,1.05);box('#7f9690',x,.4,zz+.9,.65,.8,.65);box('#617c78',x,1.05,zz-.1,.65,.4,.1);
   }
  }else if(z.furniture==='meeting'){
   for(let zz=z.z-z.d/2+Math.min(3,z.d/2);zz<=z.z+z.d/2-2;zz+=10){
    const len=Math.min(4,z.d-1);box('#c4a97f',z.x,.8,zz,Math.min(z.w-1.2,2.2),.18,len);
    for(const side of [-1,1])for(let j=-1;j<=1;j++)box('#718d88',z.x+side*1.7,.4,zz+j,.55,.8,.55);
   }
  }else if(z.furniture==='core'){
   for(const x of [-1,1])for(const zz of [-1,1])box('#c4d6d2',z.x+x*1.35,.7,z.z+zz*1.5,2.2,1.4,2.4);
   for(const side of [-1,1])for(let i=0;i<8;i++)box('#dce1d7',z.x+side*2.7,.08+i*.12,z.z+z.d/2-1-i*.3,1.25,.16,.3);
  }else if(z.furniture==='lounge'){
   for(let zz=z.z-z.d/2+2;zz<z.z+z.d/2-1;zz+=7){box('#759786',z.x,.4,zz,Math.min(3,z.w-1),.8,1.1);box('#cbb48e',z.x,.4,zz+1.8,1.5,.2,.9);}
  }else if(z.furniture==='garden'){
   const mesh=new THREE.Mesh(new THREE.CylinderGeometry(Math.min(z.w,z.d)*.28,Math.min(z.w,z.d)*.28,.4,32),mat('#83aa81'));mesh.position.set(z.x,.2,z.z);group.add(mesh);
  }else if(z.furniture==='reception'){box('#bda57e',z.x,.6,z.z,Math.min(6,z.w-2),1.2,1.3);}
  else if(z.furniture==='parking'){
   for(let x=z.x-z.w/2+2;x<z.x+z.w/2-1;x+=3.1)for(const side of [-1,1]){const zz=z.z+side*(z.d/2-3);box('#f3f3e6',x,.1,zz,2.6,.1,4.9);box('#88a4b1',x,.65,zz,1.8,1,3.6);}
  }else if(z.furniture==='equipment')for(let x=z.x-z.w/2+2;x<z.x+z.w/2-1;x+=4)box('#8f9b9c',x,.8,z.z,2,1.6,3);
 }
 for(const v of def.voids){group.userData.labels.push({text:v.part==='hall'?'六层通高 · 中庭挑空':'双层挑空 · 中庭',x:v.x,y:.5,z:v.z});}
 const geometry=new THREE.BoxGeometry(1,1,1),transform=new THREE.Object3D();
 for(const [color,items] of batches){const mesh=new THREE.InstancedMesh(geometry,mat(color),items.length);items.forEach(([x,y,z,w,h,d],i)=>{transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 return group;
}
