import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createSpdbExterior,createSpdbSignTexture} from './spdb-exterior.js';
const $=s=>document.querySelector(s);
const landmarks=new Set(['ndb','union','huatai','spdb','cetc','yihai','far','spic']);
let data,renderer,scene,camera,controls,trees,sun,ambient,selected,flight,night=false,auto=false,top=false,filter='all',lastFrame=0,frames=0,lastFps=0;
const groups=new Map(),pickables=[],labelItems=[],glassMaterials=[];
const clock=new THREE.Clock();
function mat(color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.08,...extra});}
const stone=mat('#dce3d8'),white=mat('#edf0e6'),dark=mat('#415e60'),roof=mat('#63876e'),paving=mat('#cfd7c8'),green=mat('#a5b995');
function windowMaterial(color){
 const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d');
 x.fillStyle=color;x.fillRect(0,0,128,256);
 for(let y=0;y<256;y+=16){x.fillStyle='rgba(235,244,237,.62)';x.fillRect(0,y,128,2);for(let a=0;a<128;a+=16){x.fillStyle='rgba(232,243,237,.28)';x.fillRect(a,y,1,16);if(((a/16)*7+(y/16)*3)%11<2){x.fillStyle='rgba(220,234,219,.27)';x.fillRect(a+2,y+3,12,11);}}}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,1);
 const m=mat('#ffffff',{map:tex,metalness:.25,roughness:.42,emissive:'#c0d5a4',emissiveIntensity:0});glassMaterials.push(m);return m;
}
const glass=windowMaterial('#7f9da3'),blueglass=windowMaterial('#668e9a'),warmglass=windowMaterial('#9aa89f');
function box(parent,w,h,d,x=0,y=0,z=0,m=stone){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function polygon(points,height,material,y=0){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(g,material);mesh.position.y=y;mesh.receiveShadow=true;mesh.castShadow=height>3;return mesh;}
function line(points,color,width=1,y=1,dashed=false){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],y,p[1])));const m=dashed?new THREE.LineDashedMaterial({color,dashSize:8,gapSize:6}):new THREE.LineBasicMaterial({color,transparent:true,opacity:.6});const l=new THREE.Line(g,m);if(dashed)l.computeLineDistances();return l;}
function ribbon(points,width,color,y=.3){
 const positions=[],indices=[];
 points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1,nx=-dz/len*width/2,nz=dx/len*width/2;positions.push(p[0]+nx,y,p[1]+nz,p[0]-nx,y,p[1]-nz);if(i<points.length-1){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,mat(color,{side:THREE.DoubleSide}));m.receiveShadow=true;scene.add(m);return m;
}
function obb(b){
 const p=b.footprint;let angle=0,longest=0;
 for(let i=0;i<p.length-1;i++){let dx=p[i+1][0]-p[i][0],dz=p[i+1][1]-p[i][1],l=Math.hypot(dx,dz);if(l>longest){longest=l;angle=Math.atan2(dz,dx);}}
 const ca=Math.cos(angle),sa=Math.sin(angle);let xs=[],zs=[];for(const q of p){const x=q[0]-b.center[0],z=q[1]-b.center[1];xs.push(x*ca+z*sa);zs.push(-x*sa+z*ca);}
 return {angle,w:Math.max(...xs)-Math.min(...xs),d:Math.max(...zs)-Math.min(...zs)};
}
function fins(group,w,h,d,spacing=7,start=8,m=white){
 for(let x=-w/2;x<=w/2+.1;x+=spacing){box(group,.65,h-start,.8,x,start,-d/2,m);box(group,.65,h-start,.8,x,start,d/2,m);}
 for(let z=-d/2;z<=d/2+.1;z+=spacing){box(group,.8,h-start,.65,-w/2,start,z,m);box(group,.8,h-start,.65,w/2,start,z,m);}
}
function terrace(g,w,d,h,dir=1){
 const base=10;box(g,w,base,d,0,0,0,stone);
 // Four offset plates, gradually stepping away from the central green corridor.
 for(let i=0;i<4;i++){const z=dir*(i*2.7-3),ww=w*.88-i*3,dd=d*.82-i*5,y=base+i*(h-base)/4,hh=(h-base)/4;
 box(g,ww,hh,dd,0,y,z,glass);box(g,ww+1,1,dd+1,0,y+hh,z,white);box(g,ww-4,.7,dd-4,0,y+hh+1,z,roof);}
}
function makeBuilding(b){
 const group=new THREE.Group();scene.add(group);groups.set(b.id,group);group.userData.building=b;
 const podium=polygon(b.footprint,4,paving);group.add(podium);
 const f=obb(b),g=new THREE.Group();g.position.set(...[b.center[0],4,b.center[1]]);g.rotation.y=b.orientationDegrees===undefined?-f.angle:-b.orientationDegrees*Math.PI/180;group.add(g);
 const w=Math.max(24,f.w*.91),d=Math.max(22,f.d*.88),h=b.height-4;
 if(b.kind==='valley'){terrace(g,w,d,h,b.center[0]<80?-1:1);}
 else if(b.kind==='ndb'){
  box(g,w*.94,25,d*.85,0,0,0,stone);
  const tw=Math.min(w*.68,58),td=Math.min(d*.75,52);
  for(let i=0;i<6;i++){const hh=(h-24)/6,x=(i%3-1)*6,z=((i+1)%3-1)*4;box(g,tw,hh,td,x,24+i*hh,z,i%2?glass:warmglass);box(g,tw+1.5,2.5,td+1.5,x,24+(i+1)*hh,z,white);}
  for(let i=0;i<6;i++)box(g,2,h-25,2,-25+i*10,25,-27,white);
 }
 else if(b.kind==='union'){
  const tw=w*.65,td=d*.65;box(g,tw,h,td,0,0,0,blueglass);fins(g,tw,h,td,4,0);
  box(g,w*.44,24,d*.82,-w*.7,0,-8,glass);box(g,w*.44,24,d*.82,w*.7,0,8,glass);
  box(g,w*1.45,10,d*.25,0,11,0,glass);box(g,tw+1,2,td+1,0,h-2,0,white);
 }
 else if(b.kind==='nuclear'){
  box(g,w,16,d,0,0,0,stone);const tw=w*.35;box(g,tw,h-16,d*.78,-w*.29,16,0,glass);box(g,tw,h-16,d*.78,w*.29,16,0,glass);box(g,w*.3,8,d*.4,0,25,0,glass);fins(g,w,h,d*.8,9,16);
 }
 else if(b.kind==='huatai'){
  box(g,w*.8,h,d*.48,-w*.05,0,-d*.18,warmglass);box(g,w*.34,h*.48,d*.45,-w*.32,0,d*.25,stone);box(g,w*.34,h*.55,d*.45,w*.32,0,d*.25,glass);
  for(let i=0;i<7;i++)box(g,4,h+2,d*.53,-w*.4+i*w*.115,0,-d*.18,white);
 }
 else if(b.kind==='spdb'){
  const exterior=createSpdbExterior({height:h,signTexture:createSpdbSignTexture()});g.add(exterior);glassMaterials.push(...exterior.userData.glassMaterials);
 }
 else if(b.kind==='far'||b.kind==='aviation'){
  const ww=w*.9,dd=d*.75;
  const shape=new THREE.Shape(),r=Math.min(9,dd/5),x=-ww/2,z=-dd/2;shape.moveTo(x+r,z);shape.lineTo(x+ww-r,z);shape.quadraticCurveTo(x+ww,z,x+ww,z+r);shape.lineTo(x+ww,z+dd-r);shape.quadraticCurveTo(x+ww,z+dd,x+ww-r,z+dd);shape.lineTo(x+r,z+dd);shape.quadraticCurveTo(x,z+dd,x,z+dd-r);shape.lineTo(x,z+r);shape.quadraticCurveTo(x,z,x+r,z);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);g.add(new THREE.Mesh(geo,blueglass));
  for(let y=5;y<h;y+=5)box(g,ww+.5,.7,dd+.5,0,y,0,white);
 }
 else if(b.kind==='cetc'){
  box(g,w,15,d,0,0,0,stone);box(g,w*.43,h-15,d*.8,-w*.26,15,0,blueglass);box(g,w*.4,h*.7,d*.8,w*.27,15,0,glass);box(g,w*.7,9,d*.48,0,h*.58,0,glass);box(g,w*.35,1,d*.75,w*.27,15+h*.7,0,roof);fins(g,w,h,d*.8,8,15);
 }
 else if(b.kind==='spic'){
  box(g,w,22,d,0,0,0,stone);box(g,w*.72,h-22,d*.72,-w*.1,22,-d*.05,blueglass);fins(g,w*.72,h,d*.72,4,22);box(g,w*.7,1,d*.7,w*.1,22,0,roof);
 }
 else if(b.kind==='jifu'){
  box(g,w*.87,18,d*.85,0,0,0,stone);box(g,w*.75,h-18,d*.7,0,18,0,glass);
  for(const x of [-w*.38,w*.38]){const fin=box(g,3,h,d*.78,x,0,0,white);fin.rotation.z=x>0?-.09:.09;}
  box(g,w*.82,3,d*.78,0,h-3,0,white);
 }
 else if(b.kind==='hotel'){
  box(g,w*.92,12,d*.9,0,0,0,stone);box(g,w*.82,h-12,d*.68,0,12,0,warmglass);fins(g,w*.82,h,d*.68,8,12,stone);box(g,w*.85,1,d*.7,0,h,0,roof);
 }
 else{
  box(g,w,14,d,0,0,0,stone);box(g,w*.76,h-14,d*.68,0,14,0,b.kind==='hualin'?warmglass:glass);fins(g,w*.76,h,d*.68,7,14,b.kind==='hualin'?stone:white);box(g,w*.78,1,d*.7,0,h,0,white);
 }
 group.traverse(o=>{if(o.isMesh){o.userData.buildingId=b.id;pickables.push(o);}});
 const label=document.createElement('button');label.className='building-label'+(landmarks.has(b.kind)?' key':'');label.textContent=b.name;label.setAttribute('aria-label','查看'+b.name);label.onclick=()=>selectBuilding(b.id);$('#labels').append(label);labelItems.push({el:label,b,point:new THREE.Vector3(b.center[0],b.height+12,b.center[1])});
}
function projectGeo(lon,lat){return [(lon-data.origin[0])*111320*Math.cos(data.origin[1]*Math.PI/180),-(lat-data.origin[1])*111320];}
function addContext(){
 // Only two muted orientation anchors just outside the core. No surrounding district is modelled.
 const art=projectGeo(121.48987,31.18638),a=new THREE.Group();a.position.set(art[0],0,art[1]);a.rotation.y=-.18;scene.add(a);const red=mat('#ab5d4c');
 box(a,70,17,65,0,0,0,red);for(let i=0;i<5;i++)box(a,78+i*12,4,73+i*11,0,17+i*5,0,red);
 const arena=projectGeo(121.48868,31.19095),g=new THREE.SphereGeometry(1,48,16),m=new THREE.Mesh(g,mat('#bac4b9'));m.scale.set(108,23,85);m.position.set(arena[0],20,arena[1]);scene.add(m);
 const shore=[projectGeo(121.4865,31.1916),projectGeo(121.4903,31.1925),projectGeo(121.493,31.1949),projectGeo(121.496,31.198)];
 const waterPoly=[[-1000,-1000],[700,-1000],...shore.slice().reverse(),[-1000,shore[0][1]]];scene.add(polygon(waterPoly,.1,mat('#a3c3c5',{roughness:.3,metalness:.15}),-.5));ribbon(shore,18,'#dce4d4',.1);ribbon(shore.map(([x,z])=>[x+11,z+12]),25,'#a8bf97',.15);
 // Bailianjing waterway, east of the district.
 ribbon([[420,-720],[465,-520],[470,-300],[455,-110],[515,40],[620,160]],30,'#a3c3c5',.05);
 addGroundText('黄 浦 江',-360,-510,68,12,'#638e91',-.7);addGroundText('中华艺术宫',art[0],art[1]+88,100,14,'#9c6955',-.18);addGroundText('梅赛德斯-奔驰文化中心',arena[0],arena[1]+110,140,12,'#7d9480',-.6);
}
function addGroundText(text,x,z,w,h,color='#6b8573',angle=0){
 const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.font='500 54px sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.rotation.z=-angle;mesh.position.set(x,1.2,z);scene.add(mesh);
}
function addTrees(){
 const positions=[];
 data.roads.filter(r=>r.type!=='footway'&&r.type!=='cycleway').forEach(r=>{
  for(let k=0;k<r.points.length-1;k++){const a=r.points[k],b=r.points[k+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l>500)continue;for(let t=20;t<l-12;t+=22){for(const side of [-1,1]){const off=(r.width/2+6)*side,x=a[0]+dx*t/l-dz/l*off,z=a[1]+dz*t/l+dx/l*off;if(x>-470&&x<470&&z>-610&&z<470)positions.push([x,z]);}}}
 });
 const stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.65,.85,5,5),mat('#7d8a6a'),positions.length),crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(4.1,1),mat('#76986c',{roughness:1}),positions.length);const dummy=new THREE.Object3D();positions.forEach(([x,z],i)=>{dummy.position.set(x,2.5,z);dummy.scale.set(1,1,1);dummy.updateMatrix();stem.setMatrixAt(i,dummy.matrix);dummy.position.y=7;const s=.8+(i%5)*.09;dummy.scale.set(s,1.25*s,s);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);});crown.castShadow=true;trees=new THREE.Group();trees.add(stem,crown);scene.add(trees);
}
function terrain(){
 scene.add(polygon([[-900,-1000],[900,-1000],[900,850],[-900,850]],2,mat('#e0e7d8'),-2.5));
 const board=polygon(data.boundary,1.2,mat('#d3deca'),-1);scene.add(board);
 const bound=line([...data.boundary,data.boundary[0]],'#65967a',1,.6,true);scene.add(bound);
 // Green valley is open public realm between opposing real OSM blocks.
 ribbon(data.valley,30,'#92b67e',.42);ribbon(data.valley,8,'#dfdfcb',.44);
 for(const r of data.roads){ribbon(r.points,r.width+5,'#e9ecdf',.32);ribbon(r.points,r.width,r.type==='cycleway'||r.type==='footway'?'#c6d4bb':'#a9b4ae',.36);if(r.width>10)scene.add(line(r.points,'#edf0df',1,.4,true));}
 addGroundText('世 博 大 道',-80,-240,145,14,'#5e7e6b',-.88);addGroundText('博 成 路',20,20,95,12,'#6b8074',-.87);addGroundText('国 展 路',180,190,100,12,'#6b8074',-.87);addGroundText('高 科 西 路',80,-35,120,13,'#6b8074',.57);addGroundText('白 莲 泾 路',260,-320,110,12,'#6b8074',.5);
}
function drawList(){
 const query=$('#search').value.trim().toLowerCase();const list=data.buildings.filter(b=>(filter==='all'||(filter==='landmark'?landmarks.has(b.kind):b.kind==='valley'||b.kind==='hotel'))&&(b.name.toLowerCase().includes(query)||b.address.includes(query)));
 $('#building-list').replaceChildren();if(!list.length){const p=document.createElement('p');p.textContent='没有找到相关楼宇';p.style='font-size:11px;color:#81967f';$('#building-list').append(p);}
 list.forEach(b=>{const button=document.createElement('button');button.className='building-item'+(b.id===selected?' active':'');button.dataset.id=b.id;const i=data.buildings.indexOf(b)+1;button.innerHTML=`<span class="number">${String(i).padStart(2,'0')}</span><span><strong>${b.name}</strong><small>${b.kind==='valley'?'GREEN VALLEY':b.kind==='hotel'?'HOSPITALITY':landmarks.has(b.kind)?'DISTRICT LANDMARK':'HEADQUARTERS'}</small></span><span class="arrow">↗</span>`;button.onclick=()=>selectBuilding(b.id);$('#building-list').append(button);});
}
let selectionOutline;
function selectBuilding(id,focus=true){
 selected=id;const b=data.buildings.find(b=>b.id===id);if(!b)return;
 if(selectionOutline){scene.remove(selectionOutline);selectionOutline.geometry.dispose();selectionOutline.material.dispose();}
 selectionOutline=line([...b.footprint,b.footprint[0]],'#008568',1,5);scene.add(selectionOutline);
 $('#detail').hidden=false;$('#detail-title').textContent=b.name;$('#detail-desc').textContent=b.description;$('#detail-type').textContent=b.kind==='valley'?'GREEN VALLEY / 浦银绿谷':'HEADQUARTERS / 世博总部';
 $('#detail-meta').innerHTML=`<div>位置 <strong>${b.address}</strong></div><div>模型高度 <strong>${b.height} m · ${b.heightConfidence}</strong></div><div>定位依据 <strong>${b.locationConfidence}</strong></div><div>${b.geometryConfidence}</div>`;
 $('#detail-source').href=b.source;$('#detail-focus').onclick=()=>focusOn(b,370);labelItems.forEach(l=>l.el.classList.toggle('selected',l.b.id===id));drawList();if(focus)focusOn(b,560);
}
function focusOn(b,distance){auto=false;$('#rotate').classList.remove('active');top=false;updateViewButtons();const target=new THREE.Vector3(b.center[0],b.height*(b.kind==='spdb'?.45:.3),b.center[1]);const direction=camera.position.clone().sub(controls.target).normalize();if(b.kind==='spdb')direction.set(-.85,.45,-.95).normalize();else if(direction.y>.9)direction.set(.7,.7,1).normalize();fly(target.clone().add(direction.multiplyScalar(distance)),target);}
function fly(pos,target){flight={start:performance.now(),from:camera.position.clone(),to:pos,tf:controls.target.clone(),tt:target};}
function view(name){auto=false;top=false;$('#rotate').classList.remove('active');if(name==='valley')fly(new THREE.Vector3(-290,230,570),new THREE.Vector3(50,10,-90));else if(name==='river')fly(new THREE.Vector3(-730,460,-590),new THREE.Vector3(20,25,-70));else fly(new THREE.Vector3(820,720,900),new THREE.Vector3(0,10,-70));updateViewButtons();$('.view-buttons .active')?.classList.remove('active');$('#'+({overview:'overview',valley:'valley-view',river:'river-view'}[name])).classList.add('active');}
function updateViewButtons(){$('#view-3d').classList.toggle('active',!top);$('#view-top').classList.toggle('active',top);controls.maxPolarAngle=top?.01:Math.PI/2-.07;}
function bindUI(){
 $('#search').oninput=drawList;document.querySelectorAll('[data-filter]').forEach(el=>el.onclick=()=>{filter=el.dataset.filter;document.querySelectorAll('[data-filter]').forEach(e=>e.classList.toggle('active',e===el));drawList();});
 $('#view-3d').onclick=()=>view('overview');$('#view-top').onclick=()=>{top=true;auto=false;$('#rotate').classList.remove('active');updateViewButtons();fly(new THREE.Vector3(0,1950,-69),new THREE.Vector3(0,0,-70));};
 $('#reset').onclick=()=>view('overview');$('#overview').onclick=()=>view('overview');$('#valley-view').onclick=()=>view('valley');$('#river-view').onclick=()=>view('river');
 $('#zoom-in').onclick=()=>{const d=camera.position.clone().sub(controls.target);d.multiplyScalar(.8);fly(controls.target.clone().add(d),controls.target.clone());};$('#zoom-out').onclick=()=>{const d=camera.position.clone().sub(controls.target);d.multiplyScalar(1.25);fly(controls.target.clone().add(d),controls.target.clone());};
 $('#night').onclick=()=>{night=!night;scene.background.set(night?'#172d32':'#e8efea');scene.fog.color.copy(scene.background);ambient.intensity=night?1.1:2.5;sun.intensity=night?.4:3.2;glassMaterials.forEach(m=>m.emissiveIntensity=night?.7:0);$('#night').innerHTML=night?'☾ <span>夜景</span>':'☼ <span>日景</span>';document.body.classList.toggle('night',night);};
 $('#tree-toggle').onchange=e=>trees.visible=e.target.checked;
 $('#rotate').onclick=()=>{auto=!auto;top=false;updateViewButtons();$('#rotate').classList.toggle('active',auto);};
 $('#close-detail').onclick=()=>{$('#detail').hidden=true;selected=null;labelItems.forEach(l=>l.el.classList.remove('selected'));if(selectionOutline){scene.remove(selectionOutline);selectionOutline=null;}drawList();};
 $('#help-button').onclick=$('#sources-button').onclick=()=>$('#info-dialog').showModal();$('#close-dialog').onclick=()=>$('#info-dialog').close();$('#info-dialog').onclick=e=>{if(e.target===$('#info-dialog'))$('#info-dialog').close();};
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#close-detail').click();}if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('#search').focus();}});
 let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];flight=null;});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const mouse=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit)selectBuilding(hit.object.userData.buildingId);});
 controls.addEventListener('start',()=>{flight=null;auto=false;$('#rotate').classList.remove('active');$('#hint').style.opacity=0;});
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.setViewOffset(innerWidth,innerHeight,innerWidth>760?-155:0,0,innerWidth,innerHeight);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}
function animate(now){requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.05);
 if(flight){const t=Math.min(1,(now-flight.start)/1100),s=t*t*(3-2*t);camera.position.lerpVectors(flight.from,flight.to,s);controls.target.lerpVectors(flight.tf,flight.tt,s);if(t===1)flight=null;}
 if(auto){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new THREE.Vector3(0,1,0),delta*.1);camera.position.copy(controls.target).add(v);}
 controls.update();renderer.render(scene,camera);
 const placed=[];const width=innerWidth,height=innerHeight;
 const sorted=labelItems.slice().sort((a,b)=>(b.b.id===selected?100:landmarks.has(b.b.kind)?10:0)-(a.b.id===selected?100:landmarks.has(a.b.kind)?10:0));
 for(const l of sorted){const v=l.point.clone().project(camera),x=(v.x*.5+.5)*width,y=(-v.y*.5+.5)*height;const w=l.el.offsetWidth||100,h=27,rect={x:x-w/2,y:y-h,w,h};const covered=placed.some(p=>rect.x<p.x+p.w+6&&rect.x+rect.w+6>p.x&&rect.y<p.y+p.h+10&&rect.y+rect.h+10>p.y);const mobile=width<760;const visible=$('#label-toggle').checked&&v.z<1&&v.z>-1&&x>(mobile?15:325)&&x<width-25&&y>145&&y<height-(mobile?200:90)&&(!covered||l.b.id===selected);l.el.style.display=visible?'block':'none';if(visible){l.el.style.left=x+'px';l.el.style.top=y+'px';placed.push(rect);}}
 const az=controls.getAzimuthalAngle();$('#north').style.transform=`rotate(${-az*180/Math.PI}deg)`;
 frames++;if(now-lastFps>1000){$('#fps').textContent=Math.round(frames*1000/(now-lastFps))+' FPS';frames=0;lastFps=now;}lastFrame=now;
}
async function init(){
 const response=await fetch(new URL('../data/scene.json',import.meta.url));if(!response.ok)throw new Error('街区数据加载失败');data=await response.json();
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;$('#scene').append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#e8efea');scene.fog=new THREE.Fog('#e8efea',1800,3600);
 camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,1,6000);camera.setViewOffset(innerWidth,innerHeight,innerWidth>760?-155:0,0,innerWidth,innerHeight);camera.position.set(820,720,900);controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,10,-70);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=90;controls.maxDistance=2450;controls.maxPolarAngle=Math.PI/2-.07;controls.screenSpacePanning=false;
 ambient=new THREE.HemisphereLight('#f4fcff','#bdc6a8',2.5);scene.add(ambient);sun=new THREE.DirectionalLight('#fff2d4',3.2);sun.position.set(-450,950,-260);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-800;sun.shadow.camera.right=800;sun.shadow.camera.top=850;sun.shadow.camera.bottom=-700;sun.shadow.camera.far=2200;sun.shadow.normalBias=1;sun.shadow.bias=-.0002;scene.add(sun);
 terrain();addContext();data.buildings.forEach(makeBuilding);addTrees();drawList();bindUI();controls.update();$('#status').textContent='本地场景已就绪';document.body.dataset.ready='true';requestAnimationFrame(animate);
}
init().catch(e=>{console.error(e);$('#error').hidden=false;$('#error').textContent='场景加载失败：'+e.message+'。请使用 npm start 启动，并在支持 WebGL 的浏览器访问本地地址。';$('#status').textContent='加载失败';});
