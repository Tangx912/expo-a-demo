# 世博 A · 城市观察

上海世博 A 地块核心商务区的本地 Three.js 交互 Demo。23 栋重点楼宇，真实 OSM 道路坐标与可追溯的简化建筑布局。以展示和识别街区空间关系为目标，不用于建筑测量、BIM 或规划审批。

## 在线演示

[直接浏览 3D 场景](https://tangx912.github.io/expo-a-demo/) · [GitHub 源码](https://github.com/Tangx912/expo-a-demo)

## 启动

已在本机安装依赖，直接运行：

```sh
cd expo-a-demo
npm start
```

浏览器访问 http://127.0.0.1:4173/ 。终端按 Ctrl+C 停止。

换电脑或首次安装：先安装 Node.js 20+，在项目文件夹执行 `npm ci`，再执行 `npm start`。默认仅监听本机 127.0.0.1。端口占用时：`PORT=4174 npm start`。

本地开发不需要构建。线上发布执行 `npm run build` 生成 `dist/`，再将构建内容发布到 `gh-pages` 分支。GitHub Pages 以该分支根目录为发布源；源码保存在 `main` 分支。Three.js 与地图数据均在本地，安装完成后打开场景无需互联网、地图 Key 或账号。不可直接双击 index.html（浏览器会限制 ES Modules / fetch）。

## 操作

- 左键拖动旋转，右键拖动平移，滚轮缩放；触屏单指旋转、双指缩放/平移。
- 点击建筑、浮动标签或左侧列表，打开楼宇详情并定位；详情中可进一步靠近。
- `/` 聚焦搜索；`Esc` 关闭楼宇详情。
- 总览、绿谷轴线、滨江视角，支持立体与北向俯瞰。
- 支持昼夜、楼宇标注、绿化与自动环绕开关。

## 数据与精度

2026-11-06 从 OpenStreetMap 官方 API 下载二维地图快照，裁剪至核心商务区。**附件 CAD 仅作为用地范围与路网参考，没有将附件灰色建筑块作为真实建筑模型。**

- 19 处使用 OSM 建筑轮廓，其中 17 处 OSM 已命名；华林与酒店使用未命名轮廓并以公开地址/街坊推定归属，仍需进一步现场核对。
- 中电科、浦发银行、银联、环博这 4 处的轮廓与点位为公开地图街坊和地址辅助的人工近似，不能宣称精确足迹；已在界面详情分别提示。
- OSM 本身并非建筑测绘成果，部分轮廓概括程度较高。本项目以 OSM 轮廓形成基座，再在其内部做简化塔楼、裙房、退台、连桥、立面。
- 新开发银行 150m、银联 150m、航融盛通约79.95m、浦发银行80m来自公开项目资料；其余显示高度为示意估算。楼宇详情逐项标注依据。
- 绿谷路径按两列浦银中心楼宇之间的中轴概括；博青路为示意补线，其他主要道路沿用 OSM 坐标。绿化、树木、立面图案、水岸为概括表现。
- 中华艺术宫与文化中心仅为边界外的两处简化方位参照，没有扩展建设其他世博片区。
- 不混用 GCJ-02 / BD-09 坐标：运行几何全部使用 WGS84 OSM 转换到局部米制坐标；人工补充几何也记录为 WGS84 近似值，不直接套用商业地图坐标。

重点特色：浦银绿谷连续退台、新开发银行错动叠层、银联高塔与双裙房连廊、华泰低层总部组合、中核双塔庭院、上电竖向立面、远企曲线意向、浦发银行高低双体量与白框竖向幕墙。均为设计特征的简化表达，不代表准确竣工模型。

完整来源和逐栋数据表见 [docs/SOURCES.md](docs/SOURCES.md)。场景截图见 [docs/overview.jpg](docs/overview.jpg)，实际交互效果以浏览器为准。

## 文件

- `src/main.js`：场景、建筑生成、灯光与交互；`src/style.css`、`index.html`：界面。
- `data/scene.json`：运行时唯一地图数据；`data/osm-map.xml`：原始 OSM 官方快照；`data/osm-ways.json`：解析后数据。
- `scripts/inspect-map.py`：从 OSM XML 提取坐标；`scripts/build-data.py`：构建局部米制场景数据。
- `server.mjs`：只绑定本机的静态服务器；`tests/data.test.mjs`：23 栋覆盖、绿谷方向、路网与来源检查。

重新生成数据：`python3 scripts/inspect-map.py`，然后 `python3 scripts/build-data.py`。不必重新生成即可运行。

## 检查

```sh
npm test
node --check src/main.js
node --check server.mjs
```

浏览器验收记录见 [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md)。

## 许可

地图原始数据及其派生数据库：© OpenStreetMap contributors，ODbL 1.0（https://www.openstreetmap.org/copyright）。派生地图数据库 `data/scene.json` 中的 OSM 部分依 ODbL 提供，并保留来源标识。Three.js 采用 MIT，完整许可在 `node_modules/three/LICENSE`。本项目使用原创程序化材质，不下载商业地图瓦片，不把建筑师作品照片作为可再分发纹理。来源链接用于核实项目特征，不代表取得照片或建筑图纸转载许可。
