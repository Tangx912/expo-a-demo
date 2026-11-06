export const FLOOR_COUNTS={main:17,annex:6,basement:3};
export const WING_NAMES={main:'主楼',annex:'附楼',basement:'地下层'};
export const FLOOR_DISCLAIMER='空间分区、核心筒、家具和尺寸为示意，非逐层竣工图；不代表真实部门分布。';
export function listFloors(wing){if(!FLOOR_COUNTS[wing])throw new RangeError('请选择主楼、附楼或地下层');return Array.from({length:FLOOR_COUNTS[wing]},(_,i)=>i+1);}
export function parseFloorInput(value,wing='main'){
 const text=String(value).trim().toUpperCase();let floor;
 if(/^B[1-3]$/.test(text)){wing='basement';floor=Number(text.slice(1));}
 else{if(!/^\d+$/.test(text))throw new RangeError('请输入整数层号，地下层可输入 B1、B2、B3');floor=Number(text);}
 if(!FLOOR_COUNTS[wing]||floor<1||floor>FLOOR_COUNTS[wing])throw new RangeError(`${WING_NAMES[wing]||'该楼'}可选 ${wing==='basement'?'B1—B3':`1—${FLOOR_COUNTS[wing]} 层`}`);
 return {wing,floor};
}
export function floorFromHeight(wing,height){const count=FLOOR_COUNTS[wing],h=wing==='annex'?76*.385:76;return Math.max(1,Math.min(count,Math.floor(Math.max(0,height)/h*count)+1));}
const rect=(x,z,w,d,part,holes=[])=>({x,z,w,d,part,holes});
const zone=(x,z,w,d,label,type,furniture='')=>({x,z,w,d,label,type,furniture});
export function getFloorDefinition(wing,floor){
 if(!Number.isInteger(floor)||!listFloors(wing).includes(floor))throw new RangeError('无效楼层');
 const label=wing==='basement'?`B${floor}`:`${floor}F`,low=floor<=6&&wing!=='basement',high=wing==='main'&&floor>=16;
 const main=rect(-18,-1,30,46,'main',wing==='main'&&floor===17?[rect(-18,10,12,12,'atrium')]:[]),annex=rect(20,5,22,39,'annex');
 const d={wing,floor,label,title:`${WING_NAMES[wing]} ${label}`,disclaimer:FLOOR_DISCLAIMER,hallVoid:low&&floor>1,plates:[],zones:[],voids:[],reference:'主楼17层、六层通高大堂及16—17层挑空来自设计团队发布资料；具体平面为概括。'};
 if(wing==='basement'){
  d.reference='地下3层据项目网站资料；停车和设备布置为示意，未取得地下竣工平面。';d.title=`地下 ${label} · 配套空间示意`;d.plates=[rect(-1,0,66,52,'basement')];
  d.zones=[zone(-20,-16,19,13,'设备 / 后勤示意','service','equipment'),zone(1,-15,12,15,'交通核','core','core'),zone(22,-15,17,15,'设备示意','service','equipment'),zone(-18,10,23,26,'停车 / 配套示意','parking','parking'),zone(16,10,27,26,'停车 / 配套示意','parking','parking')];return d;
 }
 d.plates=low?[main,annex]:[main];
 if(low&&floor===1)d.plates.push(rect(3,3,12,34,'hall'));
 if(d.hallVoid)d.voids.push(rect(3,3,12,34,'hall'));
 if(wing==='main'&&floor===17)d.voids.push(rect(-18,10,12,12,'atrium'));
 if(low){
  d.title+=floor===1?' · 门厅与公共空间示意':' · 低区办公 / 配套示意';
  d.zones.push(zone(20,-7,9,10,'附楼交通核','core','core'),zone(13,10,6,20,'会议示意','meeting','meeting'),zone(25,10,9,24,'附楼办公示意','office','desks'));
  if(floor===1)d.zones.push(zone(3,3,10,26,'六层通高中庭','atrium','garden'));
 }
 if(wing==='annex'){d.title=`附楼 ${label} · 办公 / 会议示意`;d.reference='附楼6层据项目网站资料；中间大堂六层通高据设计团队发布资料，具体平面为概括。';}
 if(wing==='main'&&floor>=7&&floor<=15)d.title+=' · 标准办公层示意';
 d.zones.push(zone(-18,-11,9,15,'主楼交通核','core','core'));
 if(floor===1){
  d.zones.push(zone(-27,-4,8,31,'展示 / 接待示意','public','lounge'),zone(-9,-4,8,31,'公共服务示意','public','meeting'),zone(-18,15,10,11,'入口接待示意','public','reception'));
 }else{
  d.zones.push(zone(-28,-2,6,36,high?'会议示意':'开放办公示意',high?'meeting':'office',high?'meeting':'desks'),zone(-8,-2,6,36,high?'会客示意':'开放办公示意',high?'public':'office',high?'lounge':'desks'),zone(-18,-21,9,4,'会议示意','meeting','meeting'));
  if(floor!==17)d.zones.push(zone(-18,16,10,9,high?'挑空中庭下层示意':'共享休闲示意','public',high?'garden':'lounge'));
  else d.zones.push(zone(-18,19,10,4,'中庭环廊示意','public','lounge'));
 }
 if(high){d.title=`主楼 ${label} · 高区会客 / 挑空示意`;d.reference='设计团队确认16、17层设置高管层挑空中庭；本模型仅表达双层关系，具体隔间和孔洞形状为示意。';}
 return d;
}
