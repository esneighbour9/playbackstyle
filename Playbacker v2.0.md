# Playbacker v2.0 — 视觉沉浸感升级路线图

> 对标 [Mineradio](https://github.com/XxHuberrr/Mineradio) 的视觉氛围，保持 Playbacker 作为 Apple Music 轻量控制器的定位不变。零新依赖，纯 Canvas 2D + CSS。

---

## 设计原则

- **不引入 Three.js / GSAP / WebGL** — 保持 JS bundle < 200KB（gzip < 60KB）
- **不获取音频频谱** — win-media-control 不提供音频流，所有律动为"伪律动"
- **不登录、不播放、不分析** — 控制器定位，只做覆层控制 + 视觉氛围
- **Apple Music 专属** — 只读 Windows 媒体会话，优先匹配 Apple Music

---

## 阶段 A：歌词舞台升级 🎤

### 目标

歌词不再是简单的纵向滚动列表，而是一个有层次感的"舞台"——当前行放大居中发光，前后行渐隐缩小，形成空间纵深感。

### 视觉效果

```
       上一行 (opacity 0.25, scale 0.80, 向上淡出)
       前一行 (opacity 0.50, scale 0.90)
    →  当前行 (opacity 1.0, scale 1.06, 居中发光, text-shadow 跟随 accentHue)  ←
       后一行 (opacity 0.50, scale 0.90)
       下一行 (opacity 0.25, scale 0.80, 向下淡出)
```

### 技术方案

- 渲染当前行 ±2 行共 5 行（可见范围内其余行隐藏，减少 DOM 节点）
- 每行根据与当前行的距离计算 `opacity`、`scale`、`translateY`
- 当前行 `text-shadow: 0 0 20px hsla(var(--accent-hue), 70%, 50%, 0.5)` 跟随歌曲主色调
- 过渡动画 `transition: all 0.3s ease`
- 自动滚动保持当前行在容器中央

### 文件改动

| 文件 | 改动量 | 说明 |
|------|--------|------|
| `src/renderer/components/LyricsDisplay.tsx` | ~30 行 | 渲染逻辑改为当前行 ±2 行窗口；每行内联 style 计算 opacity/scale |
| `src/renderer/App.css` | ~20 行 | 歌词行 transition 优化；当前行发光加强 |

### 验证

- 播放歌曲 → 当前行居中、放大、发光
- 歌词推进 → 前行缩小淡出，新行放大淡入，过渡平滑
- 切歌 → 新歌词的 accentHue 发光色切换

---

## 阶段 B：Canvas 2D 粒子背景 ✨

### 目标

对标 Mineradio 的星空/银河粒子壁纸。未播放时粒子缓慢漂浮，播放时粒子流动加速，粒子颜色跟随歌曲主色调。

### 视觉效果

- 150-200 个发光粒子在窗口中缓慢漂浮
- 粒子颜色从 `accentHue` 派生（±30° 范围内随机，同色系微差）
- 距离较近的粒子间画半透明细线（形成"星座"/"星网"效果）
- 播放时粒子速度 ×1.5，暂停/空闲时缓慢漂移
- 粒子半径 1-3px 随机，带 `shadowBlur` 柔光

### 技术方案

- 新建 `ParticleBackground.tsx` 组件，使用 Canvas 2D + `requestAnimationFrame`
- 每个粒子数据结构：
  ```ts
  interface Particle {
    x: number;      // 当前位置
    y: number;
    vx: number;     // 速度
    vy: number;
    radius: number; // 1-3px
    hue: number;    // accentHue ± 30
    opacity: number;
  }
  ```
- 粒子碰到边界时反弹（或 wrap 环绕）
- 粒子间距离 < 120px 时画连线，透明度 = `1 - distance / 120`
- 播放状态通过 prop 传入，控制速度倍率
- 挂载在 `.app-background` 层之后、`.app-glass` 层之前

### 性能

- 200 粒子 × 199/2 = ~20K 次距离计算/帧 → 优化：空间哈希网格分桶（10×10 格），仅在相邻格内计算距离
- Canvas 2D 在 60fps 下 CPU 开销 < 2%
- 空闲时降低帧率到 30fps（`setTimeout` 替代 `rAF` 或跳帧）

### 文件改动

| 文件 | 改动量 | 说明 |
|------|--------|------|
| `src/renderer/components/ParticleBackground.tsx` | ~100 行 | **新建** — Canvas 粒子组件 |
| `src/renderer/App.tsx` | ~5 行 | 引入 ParticleBackground，传入 isPlaying + accentHue |
| `src/renderer/App.css` | ~5 行 | 粒子 Canvas 定位样式 |

### 验证

- 空闲态 → 粒子缓慢漂浮，颜色柔和
- 播放态 → 粒子加速流动，连线更明显
- 切歌 → 粒子颜色随 accentHue 切换（0.8s 过渡）
- DevTools Performance → 粒子渲染帧 < 2ms

---

## 阶段 C：专辑封面"电影镜头"感 🎬

### 目标

对标 Mineradio 的电影镜头视觉——封面有景深感、光影扫过、摄像机运动。

### 视觉效果

1. **伪 3D 倾斜**：封面随鼠标位置微调 `rotateX`/`rotateY`（±5° 范围），鼠标移开后回正
2. **光影扫过**：一道白色半透明光条从左到右周期性扫过封面（8s 一个周期）
3. **播放呼吸**：`scale(0.97)` ↔ `scale(1.03)`，周期 3s，替代当前 box-shadow 呼吸
4. **暂停静止**：封面回到正位，缩放停止，光扫停止，保留静态柔光

### 技术方案

- **鼠标跟随倾斜**：`onMouseMove` 事件在 `.album-art` 容器上，计算鼠标相对中心偏移量 → `rotateX(${dy * 0.05}deg) rotateY(${dx * -0.05}deg)`，`transition: transform 0.3s ease-out`
- **光影扫过**：CSS `@keyframes light-sweep`，`linear-gradient` 中透明光条 `translateX(-100%)` → `translateX(200%)`，8s linear infinite
- **播放呼吸**：CSS `@keyframes breathe-scale`，`scale(0.97, 0.97)` ↔ `scale(1.03, 1.03)`
- 所有动画在暂停时 `animation-play-state: paused`

### 文件改动

| 文件 | 改动量 | 说明 |
|------|--------|------|
| `src/renderer/components/AlbumArt.tsx` | ~30 行 | 添加 onMouseMove 倾斜逻辑；渲染光影扫过层 |
| `src/renderer/App.css` | ~35 行 | 光影扫过 keyframes；呼吸缩放 keyframes；倾斜 transition |

### 验证

- 鼠标从封面左侧移到右侧 → 封面 Y 轴旋转跟随
- 播放中 → 光影周期性扫过 + 轻微缩放呼吸
- 暂停 → 所有动画停止，封面回正
- 窗口最小化/失焦恢复后动画继续

---

## 阶段 D：空闲状态优雅化 🌌

### 目标

对标 Mineradio 的银河首页——未播放时也不空洞，保持氛围感。

### 视觉效果

- 继承阶段 B 的粒子背景（空闲时粒子更密集、更亮、颜色随机漫步）
- 中央显示大号 Playbacker 标识 + 动态环形光晕
- 标识周围有缓慢旋转的环形光晕（CSS `@keyframes rotate` + `conic-gradient` 或 `border` 呼吸）
- 提示文字淡入："启动 Apple Music 以开始"

### 技术方案

- IdleState 组件重构：移除旧的浮动音符 + 随机定位粒子点
- 环形光晕：60px 空心圆环，`border: 2px solid hsla(var(--accent-hue-default), 60%, 50%, 0.3)`，`animation: rotate 10s linear infinite` + `box-shadow` 呼吸
- 标识使用 SVG 音乐符号，`opacity: 0.6`，`animation: float 4s ease-in-out infinite`
- 粒子背景组件在空闲态接收 `dense={true}` prop，增加粒子数量到 250

### 文件改动

| 文件 | 改动量 | 说明 |
|------|--------|------|
| `src/renderer/components/IdleState.tsx` | ~30 行 | 重构：环形光晕 + 居中标识 + 提示文字 |
| `src/renderer/App.css` | ~20 行 | 环形光晕 keyframes；标识浮动动画 |
| `src/renderer/App.tsx` | ~3 行 | ParticleBackground dense 模式传参 |

### 验证

- 无播放 → 密集粒子 + 中央光环 + 标识浮动
- 开始播放 → 平滑过渡到播放态粒子
- 停止播放 → 平滑回到空闲态

---

## 执行计划

```
阶段 A（歌词舞台）
  ↓
阶段 B（粒子背景）── 可与 A 并行，独立组件
  ↓
阶段 C（电影镜头）── 依赖已有的 AlbumArt 四层结构
  ↓
阶段 D（空闲优雅化）── 依赖阶段 B 粒子组件
```

### 优先级矩阵

| 阶段 | 视觉收益 | 工作量 | 风险 | 优先级 |
|------|---------|--------|------|--------|
| A — 歌词舞台 | ⭐⭐⭐⭐ | 小（~50 行） | 低 | **P0** |
| B — 粒子背景 | ⭐⭐⭐⭐⭐ | 中（~110 行） | 低 | **P0** |
| C — 电影镜头 | ⭐⭐⭐ | 中（~65 行） | 低 | **P1** |
| D — 空闲优雅化 | ⭐⭐ | 小（~53 行） | 低 | **P2** |

---

## 不做清单

| 功能 | 理由 |
|------|------|
| Three.js / WebGL 3D 粒子 | +600KB bundle，违背轻量化 |
| 音频频谱节拍检测 | win-media-control 无音频流 |
| GSAP 动画库 | CSS @keyframes + Canvas 2D 已足够 |
| 网易云/QQ 音乐登录 | Apple Music 专属定位 |
| 天气电台 | 超出控制器范畴 |
| 3D 歌单架 | 需 Three.js + Apple Music 无公开歌单 API |
| 自定义专辑封面上传 | 控制器不应管理用户媒体文件 |

---

## 技术边界

| 硬限制 | 说明 | 替代方案 |
|--------|------|---------|
| 无音频频谱数据 | win-media-control 只提供元数据 | 基于播放状态 + 时间流逝做伪律动 |
| 无 Apple Music 原生 API | 只能通过 SystemMediaTransportControls | 优先匹配 Apple Music 会话 |
| 无专辑封面图片 | SMTC 不提供缩略图 | hash hue 光效替代 |
| 无法获取歌单/推荐 | Apple Music Windows 无公开 API | 不做，不在此定位内 |

---

## 版本目标

| 指标 | v1.x（当前） | v2.0（目标） |
|------|-------------|-------------|
| JS Bundle (gzip) | 49 KB | < 60 KB |
| CSS Bundle (gzip) | 2.4 KB | < 4 KB |
| 新依赖 | 0 | 0 |
| 视觉层次 | 4 层光效 | 4 层光效 + 粒子背景 + 歌词舞台 + 电影镜头 |
| 空闲态 | 静态粒子点 | 动态星座粒子 + 环形光晕 |
| FPS（播放中） | 60 | 60（Canvas 2D 粒子 < 2ms/帧） |
