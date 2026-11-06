# 数据来源与精度记录
采集/核对日期：2026-11-06。
## 二维基础地图
- [OpenStreetMap 地图](https://www.openstreetmap.org/#map=17/31.1904/121.4926)
- [官方二维数据下载接口](https://www.openstreetmap.org/api/0.6/map?bbox=121.485,31.183,121.500,31.198)
- 原始文件：`data/osm-map.xml`。建筑和道路保留 OSM ID，非随机生成。
- [百度二维地图：中国银联中心](https://map.baidu.com/search/中国银联中心)：核对国展路1899号，未复制瓦片。
- 高德查询曾返回无结果与登录界面，没有登录或获取付费数据，不将其当作成功核对的来源。
## 建筑与街区特征
- [HPP 世博绿谷](https://www.hpp.com/en/projects/expo-green-valley-shanghai/)：绿谷公共轴线、退台及靠近中国馆高度降低的规划概念。
- [浦发银行公开认证附件](https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf)：B/C/D/F 办公地址。
- [新开发银行官方迁址公告](https://www.ndb.int/wp-content/uploads/2021/11/Notification-of-Office-Address-Change-v2.pdf)：国展路1600号。
- [上海建工新开发银行项目](https://siec.scg.com.cn/scg_az_mygc/2023-11-04/Detail_233951.htm)：150m、30层塔楼及33m、6层裙房。
- [华林证券项目介绍](https://www.chinalions.cn/main/a/20200421/2893459.shtml)：主楼＋景亭副楼、石材和玻璃立面。
- [HPP 上电大厦](https://dev.hpp.com/cn/news/国家电投上电大厦已竣工/)：13层塔楼、5层裙楼与庭院。
- [Aedas 浦发新办公楼](https://www.aedas.com/en/project/shanghai-pudong-development-bank-new-office/)：总部造型与概念。
- [gmp 发布的银联业务运营中心资料](https://www.jzda001.com/index/index/details?id=14078&type=1)：150m中央主塔、两侧24m裙房与空中连廊。
## 逐栋记录
注意：来源链接可能分别支持地址、定位或造型，不意味着该链接支持模型的全部尺寸。OSM 轮廓也可能是概括轮廓。未命名轮廓的归属仍属推定。
|楼宇|定位|模型高度|高度依据|来源|
|---|---|---:|---|---|
|华泰金融大厦|OSM命名轮廓|48m|示意估算|[资料](https://www.shbtpm.com/info/detail/59483) · [OSM](https://www.openstreetmap.org/way/899640616)|
|华林国际金融大厦|OSM轮廓＋地址推定|55m|示意估算|[资料](https://www.chinalions.cn/main/a/20200421/2893459.shtml) · [OSM](https://www.openstreetmap.org/way/1269024681)|
|浦银中心A座|OSM命名轮廓|68m|示意估算|[资料](https://news.spdb.com.cn/investor_relation/xxpl/202503/P020230706334364052937.pdf) · [OSM](https://www.openstreetmap.org/way/1269024676)|
|上海世博逸衡酒店|OSM轮廓＋地址推定|60m|示意估算|[资料](https://www.ihg.com/evenhotels/hotels/cn/zh/shanghai/shase/hoteldetail/local-area-guide) · [OSM](https://www.openstreetmap.org/way/1269024677)|
|浦银中心B座|OSM命名轮廓|58m|示意估算|[资料](https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf) · [OSM](https://www.openstreetmap.org/way/1269024673)|
|浦银中心C座|OSM命名轮廓|52m|示意估算|[资料](https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf) · [OSM](https://www.openstreetmap.org/way/1269024686)|
|浦银中心D座|OSM命名轮廓|44m|示意估算|[资料](https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf) · [OSM](https://www.openstreetmap.org/way/1269024683)|
|浦银中心E座|OSM命名轮廓|44m|示意估算|[资料](https://www.hpp.com/en/projects/expo-green-valley-shanghai/) · [OSM](https://www.openstreetmap.org/way/1269024684)|
|浦银中心F座|OSM命名轮廓|52m|示意估算|[资料](https://www.spdb.com.cn/spdb_esg/esg_reports/esg_external_certification_report/202507/P020250724755220607298.pdf) · [OSM](https://www.openstreetmap.org/way/1269024685)|
|浦银中心G座|OSM命名轮廓|58m|示意估算|[资料](https://www.hpp.com/en/projects/expo-green-valley-shanghai/) · [OSM](https://www.openstreetmap.org/way/1269024672)|
|永诚大厦|OSM命名轮廓|60m|示意估算|[资料](https://www.openstreetmap.org/way/1502437954) · [OSM](https://www.openstreetmap.org/way/1502437954)|
|航融盛通大厦|OSM命名轮廓|79.95m|公开项目资料|[资料](https://www.sheitc.sh.gov.cn/djxtdw/) · [OSM](https://www.openstreetmap.org/way/1502437955)|
|中核集团上海总部大楼|OSM命名轮廓|52m|示意估算|[资料](https://www.expoculturepark.cn/media-288) · [OSM](https://www.openstreetmap.org/way/1269024680)|
|上电大厦|OSM命名轮廓|60m|示意估算|[资料](https://dev.hpp.com/cn/news/国家电投上电大厦已竣工/) · [OSM](https://www.openstreetmap.org/way/1269024678)|
|吉富大厦|OSM命名轮廓|64m|示意估算|[资料](https://www.openstreetmap.org/way/1269024679) · [OSM](https://www.openstreetmap.org/way/1269024679)|
|金龙鱼大厦|OSM命名轮廓|76m|示意估算|[资料](https://www.openstreetmap.org/way/1269024674) · [OSM](https://www.openstreetmap.org/way/1269024674)|
|远企大楼|OSM命名轮廓|76m|示意估算|[资料](https://www.openstreetmap.org/way/1269024675) · [OSM](https://www.openstreetmap.org/way/1269024675)|
|新开发银行总部大楼|OSM命名轮廓|150m|公开项目资料|[资料](https://siec.scg.com.cn/scg_az_mygc/2023-11-04/Detail_233951.htm) · [OSM](https://www.openstreetmap.org/way/1461436630)|
|申能金融大厦|OSM命名轮廓|80m|示意估算|[资料](https://www.openstreetmap.org/way/1502437956) · [OSM](https://www.openstreetmap.org/way/1502437956)|
|中电科信息科技大厦|公开二维地图街坊＋地址近似定位|120m|示意估算|[资料](https://www.shecc.com/Report.html?index=1)|
|浦发银行大厦|公开二维地图街坊＋地址近似定位|80m|公开项目资料|[资料](https://www.aedas.com/en/project/shanghai-pudong-development-bank-new-office/)|
|中国银联中心|公开二维地图街坊＋地址近似定位|150m|公开项目资料|[资料](https://www.jzda001.com/index/index/details?id=14078&type=1)|
|环博大厦|公开二维地图街坊＋地址近似定位|52m|示意估算|[资料](https://yfbzb.com/inviteBid/detail/20260512_596455211.html)|

## 附件 CAD 检查
文件大小 2,234,566 字节，SHA256 `f47d0304beedfd7e3753bc8d3d0c7f716e853a14175ac58a9b85f0af205f17ba`。包含 5527 个轻量多段线实体；没有提取到中文地名文字实体。这类地图导出图包含大量描边，不能据此把建筑块视为准确竣工足迹。此 Demo 不直接导入 CAD 的乱线，仅以用户图片核对范围和路网。

## 已知局限

4个人工补充点位与2个未命名轮廓归属需进一步核实；未将商业地图坐标直接当作WGS84。建筑立面、附楼、退台方向、景观和除有明确资料外的高度均是近似表达。东北端少量裙房可能超出原始OSM缺失街坊的真实足迹，不能用于精确叠图。

## 浦发银行大厦外观精修（2026-11-06）

依据[Aedas官网实景](https://www.aedas.com/sc/project/shanghai-pudong-development-bank-new-office/)核对主附楼高低关系、白色外框、竖向幕墙、顶部玻璃段及连接门厅。照片仅用于观察；模型由原创程序几何生成，未使用照片纹理。参见[精修记录](refinements/SPDB-EXTERIOR.md)。外观比例为照片推定，点位与总平面尚未通过测绘或竣工图校准。

浦发银行第二轮修订：按用户实景红线增加侧面下挂檐带和入口雨蓬。总图方向参照远企大楼OSM主轴约40度，并向范围内侧退让；仅改善示意总图关系，不代表真实地籍核验。
