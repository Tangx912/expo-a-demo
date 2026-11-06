# 浦发银行楼层浏览实施计划

外观基准：v1.1-spdb-exterior / db61903；外观和总图位置不调整。按用户要求，本轮不自动提交、推送或发布。

## 资料与范围

- 设计团队 TJIDC 发布项目介绍：https://www.archdaily.com/zh/1004643/pu-fa-yin-xing-xin-da-lou-shi-nei-she-ji-shang-hai-tong-ji-shi-nei-she-ji-si-suo ：主楼17层、六层通高大堂、16/17层高管层挑空中庭。
- 项目介绍 https://www.biwuke.com/113/guanyu.html ：17层主楼、6层附楼、地下3层。附楼和地下层数为项目网站资料，未独立取得完整竣工图验证。
- 26个可选单层视图（主楼17、附楼6、地下3）。楼层数与设计团队描述分开标注；室内细部、核心筒位置、房间分隔、楼层用途分配、层高均为原创示意。

## 交互与文件

1. src/spdb-floor-data.js：楼层编号校验、26层定义、体块和空间分区；测试范围、挑空、无效输入、低楼不存在7F。
2. src/spdb-floor-model.js：独立剖切楼板、低墙、核心筒、工位、会议家具；几何检查无NaN、面数受控，17F挑空不得被楼板填实。
3. src/spdb-floor-explorer.js + src/spdb-floors.css：独立覆盖式浏览器、主楼/附楼/地下切换、楼层输入、列表、建筑立面点击、单层放大、二维俯瞰、上/下层、返回；关闭时释放WebGL与几何资源。
4. index.html、src/main.js：仅为浦发银行详情增加楼层入口；总图中再次点击该楼立面可按高度进入对应层。放大单层独立渲染，不改变总图相机与已确认外观。
5. docs/refinements/spdb-floors.html：本地直接楼层预览入口，与主场景共用同一楼层浏览器。

## 验收

npm test + npm run build；浏览器测试主楼1/8/17、附楼6、B3；输入18或小数提示错误；直接点击立面进入单层；切换俯瞰与返回；截图；不自动备份。
