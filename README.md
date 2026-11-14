# BENGDA

BENGDA 是一个 3D 校园拆除游戏。玩家选择一所大学，在基于 OpenStreetMap 数据生成的 3D 校园里破坏建筑，伤害会按 **大学** 汇总到在线排行榜。

**在线游玩：** https://markszt.github.io/bengda/v30.html

> 虚构娱乐游戏，非官方项目。

---

## 游戏内容

- 30 所德国公立大学地图
- 1 张 Aachen 校区 + 29 张新建的真实 OSM 校园地图
- 每张地图独立加载
- 第一人称/环绕视角的 3D 城市
- 多种拆除武器与技能
- 建筑逐块破坏
- 德语 / 中文 / 英语界面
- 手机端支持双指缩放
- 游戏内显示当前大学排名、距离下一名和第一名的伤害差

---

## 仓库结构

| 文件 | 作用 |
|---|---|
| `index.html` | 游戏引擎、UI、样式、内嵌音频和校园目录 |
| `maps/` | 30 个独立校园 JSON 数据文件，每张地图单独加载 |
| `online.js` | 开局、每 6 秒自动上传伤害、提交当前大学 ID |
| `online-rank.js` | 游戏内排名 HUD、大学排行榜、排序、三语言文案 |
| `README.md` | 项目说明 |

这是一个**无构建步骤**的项目：`index.html` 就是最终产物。

切换校园时会重新加载页面，只下载当前校园的 `maps/<id>.json`，不会一次加载全部 30 张地图。

---

## 在线排行榜

排行榜后端不在这个仓库里，单独部署在 Cloudflare：

```text
Cloudflare Worker + D1
```

API：

```text
https://fh-aachen-leaderboard.markszt0311-a52.workers.dev
```

### 一次游戏的数据流

```text
打开网站
→ 选择大学
→ 点 SPIELEN
→ online.js 请求 /api/runs/start 获取 nonce
→ 每 6 秒上传一次本段伤害
→ Worker 校验后写入 D1
→ online-rank.js 读取大学排行榜
→ 游戏内 HUD 显示排名差
→ 菜单排行榜每 15 秒同步一次
```

### 排名计算

- 排行榜按 **大学** 聚合，不按玩家
- 没有伤害的大学也会显示 `0 DMG`
- 默认显示前 3
- `ALLE UNIVERSITÄTEN ANZEIGEN` 显示全部 19 所
- 排序按钮切换最高/最低伤害
- 当前大学排名差优先在本地计算，服务器刷新后再同步

---

## 开发与更新

本仓库没有 `package.json`、`src/` 或构建工具。修改后直接推送即可。

### 修改游戏

```bash
cd ~/Desktop/BENGDA-Site
# 修改 index.html / online.js / online-rank.js
git add .
git commit -m "说明这次改了什么"
git push
```

GitHub Pages 会自动重新部署：

```text
https://markszt.github.io/bengda/v30.html
```

### 修改后端

后端源码在本地单独目录，不在这个仓库：

```text
FH-Aachen-Online/
├── worker.js
├── wrangler.toml
└── migrations/
```

改完后需要重新部署 Worker 和/或执行 D1 migration。

---

## API

| 方法 | 路径 | 作用 |
|---|---|---|
| POST | `/api/runs/start` | 开始一局，返回 nonce |
| POST | `/api/runs` | 提交伤害和 campusId |
| GET | `/api/campus-leaderboard` | 大学排行榜 |
| GET | `/api/stats` | 总伤害/局数统计 |
| POST | `/api/players` | 创建/更新玩家 |
| DELETE | `/api/players` | 删除玩家数据 |

---

## 已知限制

- 伤害由客户端上报，技术上可以伪造
- 没有账号系统，玩家 ID 是浏览器随机 UUID
- API 是公开的
- 前端代码只要网站公开，就一定能被浏览器下载和查看
- 排行榜目前是总伤害榜，没有周榜/季度榜

---

## 开发记录与 Token

- 开发方式：DeepSeek + DSH coding agent
- 开发过程：多轮迭代，包含游戏逻辑、音效、HUD、在线排行榜、手机适配和 Cloudflare 后端

以下数字来自本地 DSH 会话日志的 usage 字段（截至 2026-11-13）：

| 项目 | 数量 |
|---|---:|
| 总处理 Token（含缓存读取） | 985,046,848 |
| 输入 Token | 4,692,290 |
| 输出 Token | 2,357,118 |
| 缓存读取 Token | 977,997,440 |
| 不含缓存读取的 Token | 7,049,408 |
| 当前上下文规模 | 约 406,245 |

说明：

- 这是会话统计，不等同于 DeepSeek 账单。
- 缓存读取 Token 的计费单价通常低于普通输入 Token。
- 如需最终费用，请以 DeepSeek API 控制台的 usage / billing 为准。

---

## 数据与版权

- Aachen：原有 OSM 提取数据
- 其他 29 所：OpenStreetMap API 0.6 校园中心周边建筑、道路、绿地和树木
- 校园/地图数据：OpenStreetMap contributors，ODbL
- 地图底图：Esri World Street Map
- 3D 引擎：Three.js，MIT
- 游戏内音频：项目内嵌采样与 Web Audio 合成
- 本项目为非官方虚构作品，与任何大学或机构无关
