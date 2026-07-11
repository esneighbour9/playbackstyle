# Playbacker

一款轻量级的 Apple Music 桌面控制器，基于 Electron + React + TypeScript 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Version](https://img.shields.io/badge/version-2.0.0-green)

## 功能特性

- 🎵 Apple Music 播放控制（Windows 系统级媒体会话）
- 🎨 动态主题色彩 — 每首歌曲独立色相，切换平滑过渡
- ✨ Canvas 2D 粒子背景 — 180 个发光粒子 + 星座连线，播放时流动加速
- 🎬 专辑封面电影镜头感 — 鼠标跟随伪 3D 倾斜、光影扫过、呼吸缩放
- 📝 歌词舞台 — 当前行居中放大发光，前后行渐隐缩小，空间纵深感
- 🪟 无边框透明窗口 + 玻璃拟态设计
- ⌨️ 全局媒体键支持（MediaPlayPause / MediaNextTrack / MediaPreviousTrack）
- 📋 系统托盘 + 关闭隐藏到托盘

## 技术栈

- **Electron** — 桌面应用框架
- **React 18** — UI 框架
- **TypeScript** — 类型安全
- **Vite** — 构建工具
- **Canvas 2D** — 粒子背景渲染
- **CSS @property** — 色相渐变动画
- **electron-builder** — 打包工具

## 项目结构

```
.
├── build/                  # 构建资源目录
│   ├── icon.svg            # 应用图标源文件
│   ├── icon.ico            # 应用图标
│   └── README.md           # 构建资源说明
├── src/
│   ├── main/               # Electron 主进程
│   │   ├── main.ts         # 主进程入口
│   │   └── preload.ts      # 预加载脚本
│   ├── renderer/           # 渲染进程（React）
│   │   ├── components/     # React 组件
│   │   │   ├── AlbumArt.tsx          # 专辑封面（5 层光效 + 3D 倾斜 + 光影扫过）
│   │   │   ├── IdleState.tsx         # 空闲状态（环形光晕 + 轨道粒子）
│   │   │   ├── LyricsDisplay.tsx     # 歌词舞台（当前行 ±2 窗口 + 深度层次）
│   │   │   ├── ParticleBackground.tsx # Canvas 2D 粒子背景（空间哈希连线）
│   │   │   ├── PlaybackControls.tsx  # 播放控制按钮
│   │   │   ├── TitleBar.tsx          # 自定义标题栏
│   │   │   └── TrackInfo.tsx         # 曲目信息显示
│   │   ├── hooks/          # 自定义 Hooks
│   │   │   ├── useLyrics.ts         # 歌词获取（重试 + 超时 + 故障保留）
│   │   │   └── useMediaSession.ts   # 媒体会话集成
│   │   ├── utils/
│   │   │   └── hashColor.ts         # 曲目色相算法
│   │   ├── App.tsx         # 应用根组件
│   │   └── main.tsx        # 渲染进程入口
│   └── shared/             # 共享类型定义
│       └── types.ts        # MediaSession 规范类型
├── .github/workflows/      # GitHub Actions 工作流
│   ├── build.yml           # 构建验证工作流
│   └── release.yml         # 发布工作流
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # 渲染进程 TypeScript 配置
└── tsconfig.main.json      # 主进程 TypeScript 配置
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Windows 操作系统（用于完整功能测试）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动主进程监听和 Vite 开发服务器。

### 构建

```bash
npm run build
```

这将编译主进程和渲染进程代码到 `dist/` 目录。

### 运行应用

```bash
npm start
```

### 运行测试

```bash
npm test
```

### 打包 Windows 安装程序

```bash
npm run build:win
```

安装程序将输出到 `release/` 目录。

### 安装版排障（读取不到正在播放歌曲）

1. 完全退出托盘中的 Playbacker（右键托盘图标 -> 退出）
2. 在任务管理器中确认不存在 `Playbacker.exe` 进程
3. 重新启动安装版应用后再测试歌曲读取
4. 如果仍失败，请检查主进程日志中是否出现 `win-media-control load failed`
5. 确认依赖已安装并重新打包：
   ```bash
   npm install
   npm run build:win
   ```

## 构建资源

`build/` 目录包含 electron-builder 打包所需的资源文件。

### 生成应用图标

将 `build/icon.svg` 转换为 Windows ICO 格式：

**方法一：ImageMagick**
```bash
magick -background none build/icon.svg -define icon:auto-resize=256,128,64,48,32,16 build/icon.ico
```

**方法二：sharp-cli**
```bash
npm install -g sharp-cli
sharp -i build/icon.svg -o build/icon.ico --resize 256,128,64,48,32,16
```

**方法三：在线工具**
访问 [convertio.co/svg-ico/](https://convertio.co/svg-ico/) 上传 SVG 文件进行转换。

## CI/CD 工作流

### 构建验证工作流

工作流文件：[`.github/workflows/build.yml`](.github/workflows/build.yml)

**触发条件：**
- 推送到 `main` 或 `master` 分支
- 提交到 `main` 或 `master` 分支的 Pull Request

**执行步骤：**
1. 检出代码
2. 安装 Node.js 20.x
3. 安装依赖
4. 自动生成 icon.ico（如果缺失）
5. 编译主进程和渲染进程
6. 验证构建产物
7. 上传构建产物（保留 7 天）

### 发布工作流

工作流文件：[`.github/workflows/release.yml`](.github/workflows/release.yml)

**触发条件：**
- 推送标签 `v*`（例如 `v2.0.0`）

**执行步骤：**
1. 检出代码
2. 安装 Node.js 20.x
3. 安装依赖
4. 生成 icon.ico
5. 构建 Windows 安装程序
6. 创建 GitHub Release
7. 上传安装包到 Release

### 版本发布流程

1. 更新 `package.json` 中的版本号
2. 提交并推送更改
3. 创建并推送标签：
   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```
4. GitHub Actions 将自动构建并发布

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动开发模式（主进程 + 渲染进程热重载） |
| `npm run dev:main` | 仅启动主进程监听 |
| `npm run dev:renderer` | 仅启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run build:main` | 仅构建主进程 |
| `npm run build:renderer` | 仅构建渲染进程 |
| `npm start` | 启动 Electron 应用 |
| `npm test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run build:win` | 构建 Windows 安装程序 |

## v2.0 更新内容

### 视觉沉浸感升级

- **歌词舞台升级** — 当前行 ±2 行渲染窗口，按距离计算 opacity/scale 衰减，双层 text-shadow 发光跟随歌曲主色调
- **Canvas 2D 粒子背景** — 180/250 个发光粒子 + 空间哈希网格连线，播放时流动加速，空闲时密集漂浮
- **专辑封面电影镜头感** — 鼠标跟随伪 3D 倾斜、8s 周期光影扫过、3s 周期呼吸缩放
- **空闲状态优雅化** — 环形旋转光晕 + 轨道粒子 + 浮动标识，Canvas 粒子同时接管背景

### 稳定性改进

- 歌词 API 超时控制 + 指数退避重试 + 故障时保留旧歌词
- TitleBar 错误状态提示（5s 自动消失）
- IdleState 粒子位置稳定化（useMemo 一次性生成）
- MediaSession 类型抽取到共享文件
- 新增 vitest 测试套件（computeHue + parseLRC）

### 技术边界

| 硬限制 | 说明 | 替代方案 |
|--------|------|---------|
| 无音频频谱数据 | win-media-control 只提供元数据 | 基于播放状态 + 伪律动条 + 时间流逝做视觉律动 |
| 无 Apple Music 原生 API | 只能通过 SystemMediaTransportControls | 优先匹配 Apple Music 会话 |
| 无专辑封面图片 | SMTC 不提供缩略图 | hash hue 光效替代 |
| 无法获取歌单/推荐 | Apple Music Windows 无公开 API | 不做，不在此定位内 |

## License

MIT
