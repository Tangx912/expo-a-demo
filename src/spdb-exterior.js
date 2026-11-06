import * as THREE from 'three';

// Photo-based exterior study: proportions are illustrative, not surveyed dimensions.
export function createSpdbExterior({height=76,signTexture=null}={}){
 const model=new THREE.Group();model.name='spdb-exterior';
 const white=new THREE.MeshStandardMaterial({color:'#e7e7df',roughness:.58,metalness:.15});
 const aluminum=new THREE.MeshStandardMaterial({color:'#abb9bc',roughness:.48,metalness:.55});
 const glass=new THREE.MeshStandardMaterial({color:'#4c6876',roughness:.29,metalness:.42,emissive:'#a4bbc4',emissiveIntensity:0});
 const topGlass=new THREE.MeshStandardMaterial({color:'#3d5665',roughness:.24,metalness:.48,emissive:'#bccdc4',emissiveIntensity:0});
 const seam=new THREE.MeshStandardMaterial({color:'#71848a',roughness:.55,metalness:.3});
 const base=new THREE.MeshStandardMaterial({color:'#d1d2c9',roughness:.95});
 model.userData.glassMaterials=[glass,topGlass];
 const unitBox=new THREE.BoxGeometry(1,1,1);
 function box(parent,name,size,position,material){
  const mesh=new THREE.Mesh(unitBox,material);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...position);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function repeats(parent,name,size,positions,material){
  const mesh=new THREE.InstancedMesh(unitBox,material,positions.length);mesh.name=name;
  const transform=new THREE.Object3D();transform.scale.set(...size);
  positions.forEach((p,i)=>{transform.position.set(...p);transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);});
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function wing(name,x,z,w,d,h,floors){
  const g=new THREE.Group();g.name=name;g.position.set(x,0,z);model.add(g);
  box(g,'curtain-wall',[w,h-1.3,d],[0,(h-1.3)/2,0],glass);
  const upper= name==='main-tower'?12:4;
  box(g,'upper-glazing',[w+.02,upper,d+.02],[0,h-upper/2-1.3,0],topGlass);
  // The deep white picture frame is the strongest feature of the river-facing elevation.
  for(const side of [-1,1]){
   const zFace=side*(d/2+.45);
   for(const xEdge of [-1,1])box(g,'white-frame-jamb',[1.5,h,1.15],[xEdge*(w/2-.2),h/2,zFace],white);
   box(g,'white-frame-head',[w+1.1,1.6,1.15],[0,h-.8,zFace],white);
   box(g,'white-frame-sill',[w+1.1,.8,1.15],[0,.4,zFace],white);
   const vertical=[];
   for(let xx=-w/2+1.3;xx<w/2-1;xx+=1.32)vertical.push([xx,(h-2.4)/2+.5,zFace]);
   repeats(g,'slender-front-mullions',[.13,h-2.4,.3],vertical,aluminum);
   const horizontal=[];
   for(let f=1;f<floors;f++)horizontal.push([0,4.8+(f-1)*(h-6)/(floors-1),side*(d/2+.1)]);
   repeats(g,'fine-floor-joints',[w-1.5,.13,.16],horizontal,seam);
  }
  // Dense side fins stop below the transparent crown instead of wrapping as balcony slabs.
  const finHeight=h-upper-1.3,sideFins=[];
  for(const side of [-1,1])for(let zz=-d/2+.5;zz<d/2;zz+=1.48)sideFins.push([side*(w/2+.2),finHeight/2,zz]);
  repeats(g,'vertical-side-fins',[.65,finHeight,.39],sideFins,white);
  const crownMullions=[];
  for(const side of [-1,1])for(let zz=-d/2+.5;zz<d/2;zz+=1.48)crownMullions.push([side*(w/2+.13),h-upper/2-1.3,zz]);
  repeats(g,'crown-mullions',[.2,upper,.13],crownMullions,aluminum);
  if(name==='main-tower')for(const side of [-1,1]){
   box(g,'side-hanging-fascia',[.85,3.3,d+.9],[side*(w/2+.1),h-1.65,0],white);
  }
  box(g,'roof-cap',[w+.6,.65,d+.65],[0,h-.325,0],white);
  box(g,'recessed-roof',[w-4,.3,d-4],[0,h-1.1,0],seam);
  if(name==='main-tower'){
   box(g,'roof-screen',[w*.45,1.5,d*.24],[0,h-1.6,5],aluminum);
   if(signTexture){
    const signMaterial=new THREE.MeshBasicMaterial({map:signTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    for(const side of [-1,1]){
     const sign=new THREE.Mesh(new THREE.PlaneGeometry(17,2.4),signMaterial);sign.name='bank-roof-sign';sign.position.set(side*(w/2+.57),h-1.65,7);sign.rotation.y=side*Math.PI/2;g.add(sign);
    }
   }
  }
  return g;
 }
 wing('main-tower',-18,-1,30,46,height,17);
 wing('annex',20,5,22,39,height*.385,6);
 const hall=new THREE.Group();hall.name='entrance-hall';model.add(hall);
 const hallHeight=height*.325;
 box(hall,'hall-glazing',[12,hallHeight,34],[3,hallHeight/2,3],glass);
 box(hall,'hall-roof-edge',[12.4,.55,35],[3,hallHeight-.275,3],white);
 const hallMullions=[];
 for(let x=-2;x<=8;x+=1.25)hallMullions.push([x,hallHeight/2,20.2]);
 repeats(hall,'hall-front-mullions',[.13,hallHeight,.2],hallMullions,aluminum);
 box(hall,'entrance-doors',[7,4.8,.2],[3,2.4,20.3],topGlass);
 const canopy=new THREE.Group();canopy.name='entrance-canopy';hall.add(canopy);
 box(canopy,'canopy-glazing',[12.5,.18,6.5],[3,4.9,23],topGlass);
 box(canopy,'canopy-front-fascia',[13,.5,.25],[3,4.88,26.15],white);
 for(const x of [-3.4,3,9.4])box(canopy,'canopy-beam',[.2,.35,6.5],[x,4.8,23],aluminum);
 for(const x of [-2,8])box(hall,'canopy-post',[.18,4.6,.18],[x,2.3,25.8],aluminum);
 box(model,'entrance-steps',[13,.3,4],[3,.15,24],base);
 return model;
}

export function createSpdbSignTexture(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=144;
 const context=canvas.getContext('2d');context.fillStyle='#12468a';context.textAlign='center';context.textBaseline='middle';
 context.font='600 78px "PingFang SC", "Microsoft YaHei", sans-serif';context.fillText('浦发银行  SPD BANK',512,77);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
