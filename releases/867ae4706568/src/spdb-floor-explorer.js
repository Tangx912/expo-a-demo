import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createSpdbExterior,createSpdbSignTexture} from './spdb-exterior.js';
import {FLOOR_COUNTS,WING_NAMES,listFloors,parseFloorInput,getFloorDefinition,floorFromHeight} from './spdb-floor-data.js';
import {createFloorModel,FLOOR_COLORS} from './spdb-floor-model.js';

export function createSpdbFloorExplorer(){
 if(!document.querySelector('link[data-spdb-floors]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./spdb-floors.css',import.meta.url);css.dataset.spdbFloors='true';document.head.append(css);}
 const root=document.createElement('section');root.className='spdb-floor-explorer';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','浦发银行楼层浏览');
 root.innerHTML=`<header class="sf-head"><div><h2>浦发银行大厦 · 楼层浏览</h2><small>SPDB · SCHEMATIC FLOOR EXPLORER</small></div><button data-close>← 返回街区</button></header><aside class="sf-side"><p class="sf-counts">主楼 <b>17</b> 层 · 附楼 <b>6</b> 层 · 地下 <b>3</b> 层<br>点击立面或选层，放大查看单层模型</p><div class="sf-tabs"><button data-wing="main">主楼</button><button data-wing="annex">附楼</button><button data-wing="basement">地下层</button></div><label class="sf-input-label" for="sf-floor-input">跳转楼层</label><form class="sf-form"><input id="sf-floor-input" aria-label="输入楼层" autocomplete="off" placeholder="例如 8 或 B2"><button type="submit">查看</button></form><div class="sf-error" role="alert"></div><div class="sf-floor-grid" aria-label="楼层列表"></div><div class="sf-current"><h3></h3><p class="sf-reference"></p><p>平面、房间划分、核心筒及家具均为示意，不代表真实部门分布或竣工尺寸。</p><div class="sf-legend"></div></div><div class="sf-sources">层数与空间特征：<br><a href="https://www.archdaily.com/zh/1004643/pu-fa-yin-xing-xin-da-lou-shi-nei-she-ji-shang-hai-tong-ji-shi-nei-she-ji-si-suo" target="_blank" rel="noopener">设计团队发布资料 ↗</a> · <a href="https://www.biwuke.com/113/guanyu.html" target="_blank" rel="noopener">项目介绍 ↗</a><br>附楼与地下层数据项目网站；内部布局为概括。</div></aside><div class="sf-stage"><div class="sf-canvas"></div><div class="sf-labels"></div><nav class="sf-toolbar"><button data-mode="building">建筑选层</button><button data-mode="floor">单层放大</button><button data-top>二维俯瞰</button><button data-fit>复位</button></nav><div class="sf-hover" hidden></div><div class="sf-building-hint">点击建筑立面上的任意楼层，进入单层模型</div><div class="sf-caption"><div><strong></strong><small>示意模型 · 非竣工平面</small></div><div class="sf-step"><button data-prev>↓ 下一低层</button><button data-next>↑ 下一高层</button></div></div></div>`;
 document.body.append(root);const $=s=>root.querySelector(s),stage=$('.sf-stage');
 let renderer,scene,camera,perspective,ortho,controls,exterior,model,ring,basementStack,ground,animation,observer,previousFocus,open=false,wing='main',floor=1,mode='building',top=false,labels=[],down;
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
 function dispose(object){if(!object)return;const geometries=new Set(),materials=new Set();object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[]))materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose();});}
 function resize(){if(!open)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();const span=mode==='building'?65:wing==='main'&&floor>6?28:34;ortho.left=-span*w/h;ortho.right=span*w/h;ortho.top=span;ortho.bottom=-span;ortho.updateProjectionMatrix();}
 function useCamera(isTop){top=isTop;camera=top?ortho:perspective;controls.object=camera;controls.enableRotate=!top;$('[data-top]').classList.toggle('active',top);fit();}
 function fit(){
  const isBuilding=mode==='building',isHigh=mode==='floor'&&wing==='main'&&floor>6;const target=new THREE.Vector3(isHigh?-18:-2,isBuilding?(wing==='basement'?2:32):0,0);
  controls.target.copy(target);camera.position.copy(target).add(top?new THREE.Vector3(0,130,.01):isBuilding?new THREE.Vector3(-108,60,162):(isHigh||wing==='main'&&floor>6)?new THREE.Vector3(32,45,44):new THREE.Vector3(50,62,65));
  controls.minDistance=isBuilding?95:25;controls.maxDistance=400;controls.update();
 }
 function clearModel(){if(model){scene.remove(model);dispose(model);model=null;}labels=[];$('.sf-labels').replaceChildren();}
 function select(w,n,newMode='floor'){
  getFloorDefinition(w,n);wing=w;floor=n;mode=newMode;$('.sf-error').textContent='';$('#sf-floor-input').removeAttribute('aria-invalid');renderState();
 }
 function renderState(){
  const def=getFloorDefinition(wing,floor);root.dataset.wing=wing;root.dataset.floor=String(floor);root.dataset.mode=mode;
  root.querySelectorAll('[data-wing]').forEach(b=>{b.classList.toggle('active',b.dataset.wing===wing);b.setAttribute('aria-pressed',String(b.dataset.wing===wing));});
  root.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  $('#sf-floor-input').value=wing==='basement'?`B${floor}`:String(floor);
  $('.sf-floor-grid').replaceChildren();for(const n of listFloors(wing).reverse()){const b=document.createElement('button');b.textContent=wing==='basement'?`B${n}`:`${n}F`;b.setAttribute('aria-label',`${WING_NAMES[wing]} ${b.textContent}`);b.setAttribute('aria-pressed',String(n===floor));b.classList.toggle('active',n===floor);b.onclick=()=>select(wing,n);$('.sf-floor-grid').append(b);}
  $('.sf-current h3').textContent=def.title;$('.sf-reference').textContent=def.reference;$('.sf-caption strong').textContent=`${WING_NAMES[wing]} · ${def.label}`;
  $('[data-prev]').disabled=floor===1;$('[data-next]').disabled=floor===FLOOR_COUNTS[wing];$('.sf-building-hint').hidden=mode!=='building';
  $('.sf-legend').replaceChildren();for(const [type,text]of [['office','办公'],['meeting','会议'],['public','公共'],['core','交通核'],['parking','地下配套']]){const span=document.createElement('span');const i=document.createElement('i');i.style.background=FLOOR_COLORS[type];span.append(i,document.createTextNode(text+'示意'));$('.sf-legend').append(span);}
  clearModel();exterior.visible=mode==='building'&&wing!=='basement';basementStack.visible=mode==='building'&&wing==='basement';ground.visible=wing!=='basement';ring.visible=mode==='building'&&wing!=='basement';
  if(mode==='floor'){
   model=createFloorModel(def);scene.add(model);
   for(const l of model.userData.labels){const el=document.createElement('span');el.className='sf-room-label';el.textContent=l.text;$('.sf-labels').append(el);labels.push({el,point:new THREE.Vector3(l.x,l.y,l.z)});}
  }else updateRing();
  $('.sf-hover').hidden=true;resize();fit();
 }
 function updateRing(info={wing,floor}){
  const annex=info.wing==='annex',h=annex?76*.385:76,count=annex?6:17;
  ring.position.set(annex?20:-18,(info.floor-.5)*h/count,annex?5:-1);ring.scale.set(annex?22.4:30.4,.15,annex?39.4:46.4);
 }
 function pick(event){
  const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObject(wing==='basement'?basementStack:exterior,true)[0];if(!hit)return null;
  if(wing==='basement')return {wing:'basement',floor:hit.object.userData.floor};
  const w=hit.point.x>9?'annex':'main';return {wing:w,floor:floorFromHeight(w,hit.point.y)};
 }
 function init(){
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;$('.sf-canvas').append(renderer.domElement);renderer.domElement.setAttribute('aria-label','楼层三维模型');
  scene=new THREE.Scene();scene.background=new THREE.Color('#e7ede6');scene.add(new THREE.HemisphereLight('#f5fbff','#aab99c',2.3));const sun=new THREE.DirectionalLight('#fff4dc',2.7);sun.position.set(-80,140,80);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-85,right:85,top:100,bottom:-85,far:350});sun.shadow.normalBias=.15;scene.add(sun);
  perspective=new THREE.PerspectiveCamera(39,1,.1,1200);ortho=new THREE.OrthographicCamera(-45,45,45,-45,.1,1200);camera=perspective;controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2-.03;
  exterior=createSpdbExterior({signTexture:createSpdbSignTexture()});scene.add(exterior);
  ground=new THREE.Mesh(new THREE.PlaneGeometry(450,450),new THREE.MeshStandardMaterial({color:'#dfe6d9',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.6;ground.receiveShadow=true;scene.add(ground);
  ring=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'#4bce98',transparent:true,opacity:.5,depthTest:false,depthWrite:false}));ring.renderOrder=10;scene.add(ring);
  basementStack=new THREE.Group();for(let n=1;n<=3;n++){const slab=new THREE.Mesh(new THREE.BoxGeometry(66,.45,52),new THREE.MeshStandardMaterial({color:n===1?'#b4c9b3':n===2?'#a4bcb8':'#91abb0',roughness:.8}));slab.position.set(-1,22-n*10,0);slab.userData.floor=n;basementStack.add(slab);}scene.add(basementStack);
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointermove',e=>{if(mode!=='building')return;const info=pick(e);$('.sf-hover').hidden=!info;renderer.domElement.style.cursor=info?'pointer':'grab';if(info){$('.sf-hover').textContent=`${WING_NAMES[info.wing]} ${info.wing==='basement'?'B'+info.floor:info.floor+'F'} · 点击放大`;if(info.wing!=='basement')updateRing(info);}});
  renderer.domElement.addEventListener('pointerup',e=>{if(mode!=='building'||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const info=pick(e);if(info)select(info.wing,info.floor);});
  observer=new ResizeObserver(resize);observer.observe(stage);resize();
  function animate(){if(!open)return;animation=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);const rects=[];for(const l of labels){const p=l.point.clone().project(camera),x=(p.x+1)*stage.clientWidth/2,y=(1-p.y)*stage.clientHeight/2,w=l.el.offsetWidth||80;const overlap=rects.some(r=>Math.abs(r.x-x)<(r.w+w)/2&&Math.abs(r.y-y)<25);l.el.hidden=p.z>1||x<20||x>stage.clientWidth-20||y<65||y>stage.clientHeight-80||overlap;if(!l.el.hidden){l.el.style.left=x+'px';l.el.style.top=y+'px';rects.push({x,y,w});}}}animate();
 }
 function close(){if(!open)return;open=false;root.hidden=true;cancelAnimationFrame(animation);observer?.disconnect();controls?.dispose();dispose(scene);renderer?.dispose();$('.sf-canvas').replaceChildren();$('.sf-labels').replaceChildren();labels=[];model=null;document.body.classList.remove('sf-floor-explorer-open');previousFocus?.focus?.();}
 $('[data-close]').onclick=close;root.querySelectorAll('[data-wing]').forEach(b=>b.onclick=()=>select(b.dataset.wing,Math.min(floor,FLOOR_COUNTS[b.dataset.wing]),mode));
 root.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;if(mode==='building'&&top)useCamera(false);renderState();});$('[data-top]').onclick=()=>useCamera(!top);$('[data-fit]').onclick=fit;
 $('[data-prev]').onclick=()=>select(wing,floor-1);$('[data-next]').onclick=()=>select(wing,floor+1);
 $('.sf-form').onsubmit=e=>{e.preventDefault();try{const result=parseFloorInput($('#sf-floor-input').value,wing);select(result.wing,result.floor);}catch(error){$('.sf-error').textContent=error.message;$('#sf-floor-input').setAttribute('aria-invalid','true');}};
 $('#sf-floor-input').oninput=()=>{$('.sf-error').textContent='';$('#sf-floor-input').removeAttribute('aria-invalid');};
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();}if(e.key==='Tab'){const nodes=[...root.querySelectorAll('button,input,a')].filter(n=>!n.disabled&&n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 return {isOpen:()=>open,close,open(options={}){if(open){select(options.wing||wing,options.floor||floor,options.mode||'building');return;}previousFocus=document.activeElement;wing=options.wing||'main';floor=options.floor||1;getFloorDefinition(wing,floor);mode=options.mode||'building';top=false;open=true;root.hidden=false;document.body.classList.add('sf-floor-explorer-open');try{init();renderState();$('[data-close]').focus();}catch(error){close();throw error;}}};
}
