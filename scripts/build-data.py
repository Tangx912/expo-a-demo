import json,math,collections
ways=json.load(open('data/osm-ways.json')); byid={w['id']:w for w in ways}
origin=[121.4926,31.1904]
def project(p): return [round((p[0]-origin[0])*111320*math.cos(math.radians(origin[1])),2),round(-(p[1]-origin[1])*111320,2)]
def center(p):
 q=p[:-1] if p[0]==p[-1] else p
 return [sum(x[i] for x in q)/len(q)for i in(0,1)]
# Heights without an explicit primary-source value are illustrative estimates, never surveyed measurements.
meta=[
('899640616','华泰金融大厦',48,'huatai','博成路1101号','11层主楼与低层裙房，简化石材与玻璃组合。','https://www.shbtpm.com/info/detail/59483'),
('1269024681','华林国际金融大厦',55,'hualin','世博大道沿线','主楼与景亭组合，保留金融总部的石材框架意向。','https://www.chinalions.cn/main/a/20200421/2893459.shtml'),
('1269024676','浦银中心A座',68,'valley','博成路1388号','绿谷北端；退台体块面向中央公共绿轴。','https://news.spdb.com.cn/investor_relation/xxpl/202503/P020230706334364052937.pdf'),
('1269024677','上海世博逸衡酒店',60,'hotel','博青路269号','绿谷北端酒店，与浦银中心A座共同围合绿谷。','https://www.ihg.com/evenhotels/hotels/cn/zh/shanghai/shase/hoteldetail/local-area-guide'),
('1269024673','浦银中心B座',58,'valley','博成路1306号','连续绿谷中的退台办公组团。','https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf'),
('1269024686','浦银中心C座',52,'valley','博成路1208号','绿谷中段，低层裙房与退台办公体块。','https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf'),
('1269024683','浦银中心D座',44,'valley','博成路1138号','靠近中国馆的绿谷南端，体量较低。','https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf'),
('1269024684','浦银中心E座',44,'valley','绿谷南端','与D座形成面向中国馆的绿谷入口。','https://www.hpp.com/en/projects/expo-green-valley-shanghai/'),
('1269024685','浦银中心F座',52,'valley','博青路139号','绿谷东侧中段办公楼。','https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf'),
('1269024672','浦银中心G座',58,'valley','绿谷东侧北段','与B座共同定义绿谷中北段。','https://www.hpp.com/en/projects/expo-green-valley-shanghai/'),
('1502437954','永诚大厦',60,'office','国展路沿线','绿谷东南侧企业总部，简化塔楼与裙房。',None),
('1502437955','航融盛通大厦',79.95,'aviation','国展路1481号','17层塔楼，以水平线条概括航空流线意向。','https://www.sheitc.sh.gov.cn/djxtdw/'),
('1269024682','环博大厦',52,'office','国展路1555号','地址与该OSM轮廓不匹配，实际位置另按国展路街坊近似放置。',None),
('1269024680','中核集团上海总部大楼',52,'nuclear','世博大道沿线','双塔与连体裙房，保留中央庭院。','https://www.expoculturepark.cn/media-288'),
('1269024678','上电大厦',60,'spic','世博大道沿线','13层塔楼、5层裙楼与绿色庭院；竖向立面。','https://dev.hpp.com/cn/news/国家电投上电大厦已竣工/'),
('1269024679','吉富大厦',64,'jifu','博成路1331号','OSM标为吉富大楼；倾斜框架以简化方式表达。',None),
('1269024674','金龙鱼大厦',76,'yihai','博成路沿线','面向滨江的水平总部体量。',None),
('1269024675','远企大楼',76,'far','博成路沿线','圆角水平线条，表达远东总部的流动轮廓。',None),
('1461436630','新开发银行总部大楼',150,'ndb','国展路1600号','150米；错动叠层体块与白色立面，塑造区域制高点。','https://siec.scg.com.cn/scg_az_mygc/2023-11-04/Detail_233951.htm'),
('1502437956','申能金融大厦',80,'office','国展路1529号','用户称申能财金融大厦；采用地图标准名称。',None)]
bs=[]
for id,n,h,kind,addr,desc,src in meta:
 w=byid[id]; p=[project(p)for p in w['points']]; c=center(p)
 if n=='环博大厦':
  # Existing unnamed OSM polygon is west of the valley: do NOT mislabel it as Huanbo.
  continue
 bs.append(dict(id=id,osmId=id,name=n,footprint=p,center=c,height=h,kind=kind,address=addr,description=desc,source=src or 'https://www.openstreetmap.org/way/'+id,locationConfidence='OSM命名轮廓' if w['tags'].get('name') else 'OSM轮廓＋地址推定',heightConfidence='公开项目资料' if kind in ('ndb','aviation') else '示意估算',geometryConfidence='简化体量，非测绘模型'))
def rect(lon,lat,w,d,angle=-39):
 c=project([lon,lat]);a=math.radians(angle);p=[]
 for x,z in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]:p.append([round(c[0]+x*math.cos(a)-z*math.sin(a),2),round(c[1]+x*math.sin(a)+z*math.cos(a),2)])
 return p+[p[0]]
for id,n,lon,lat,w,d,h,kind,addr,desc,src in [
 ('manual-cetc','中电科信息科技大厦',121.49540,31.19262,100,66,120,'cetc','白莲泾路127号','东北总部街坊；两段高层与空中花园的简化意向。','https://www.shecc.com/Report.html?index=1'),
 ('manual-spdb','浦发银行大厦',121.49440,31.19336,72,54,80,'spdb','世博大道909号','依据Aedas实景精修：17层主楼、6层附楼与玻璃连接门厅；白色外框、密集竖向肋片与通透顶部。尺寸比例仍为示意。','https://www.aedas.com/en/project/shanghai-pudong-development-bank-new-office/'),
 ('manual-union','中国银联中心',121.49512,31.19385,65,62,150,'union','国展路1899号','150米主塔、两侧24米裙楼和空中连廊，绿谷轴线北端。','https://www.jzda001.com/index/index/details?id=14078&type=1'),
 ('manual-huanbo','环博大厦',121.49417,31.18885,55,50,52,'office','国展路1555号','位于国展路总部街坊；公开地址核对，轮廓为示意。','https://yfbzb.com/inviteBid/detail/20260512_596455211.html')]:
 p=rect(lon,lat,w,d,angle=40 if kind=='spdb' else -39);bs.append(dict(id=id,name=n,footprint=p,center=center(p),height=h,kind=kind,address=addr,description=desc,source=src,locationConfidence='公开二维地图街坊＋地址近似定位',heightConfidence='公开项目资料' if kind in ('union','spdb')else '示意估算',geometryConfidence='人工概括轮廓，非测绘模型'))
for b in bs:
 if b['kind']=='spdb':
  b['orientationDegrees']=40
  b['locationConfidence']='邻楼轴线对齐＋范围内退让，点位仍为示意'
# Road geometry is directly from OSM; skip underground tunnels and outlying quarters.
roads=[]
for w in ways:
 t=w['tags'];p=[project(p)for p in w['points']];c=center(p)
 if 'highway'not in t or t.get('tunnel')=='yes' or t['highway'] not in ('primary','secondary','tertiary','residential','unclassified','cycleway','footway','pedestrian'):continue
 if not(-520<c[0]<520 and -650<c[1]<490):continue
 if t.get('name')not in ['世博大道','博成路','国展路','白莲泾路','高科西路','上南路','云台路','东岸绿道'] and t['highway']not in ['footway','pedestrian']:continue
 roads.append(dict(id=w['id'],name=t.get('name','步行道'),points=p,type=t['highway'],width={'primary':13,'secondary':12,'tertiary':14,'residential':12,'unclassified':10,'cycleway':4,'footway':3,'pedestrian':5}[t['highway']]))
# Interior side streets absent from OSM are traced schematically between real junctions.
for name,pts in [('博青路',[[121.49210,31.18705],[121.49149,31.18807],[121.49196,31.18872],[121.49310,31.18995],[121.49415,31.19110],[121.49536,31.19240]])]: roads.append(dict(id='trace-boqing',name=name,points=[project(q)for q in pts],type='residential',width=10,approximate=True))
boundary=[[121.48865,31.18882],[121.49498,31.19478],[121.4964,31.1931],[121.49638,31.19149],[121.4959,31.19005],[121.49165,31.18643],[121.49053,31.1871]]
scene=dict(origin=origin,coordinateSystem='WGS84 → local metres (x east, z south)',buildings=bs,roads=roads,boundary=[project(q)for q in boundary],valley=[project(q)for q in [[121.49110,31.18755],[121.49160,31.188125],[121.49267,31.18926],[121.493883,31.190605],[121.49462,31.191496],[121.4953,31.1922],[121.4951,31.1935]]],sourcesDate='2026-11-06')
json.dump(scene,open('data/scene.json','w'),ensure_ascii=False,indent=2)
print('buildings',len(bs),'roads',len(roads))
