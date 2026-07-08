# Playbacker

一款轻量级的 Apple Music 桌面控制器，基于 Electron + React + TypeScript 构建。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)

## 功能特性

- 🎵 Apple Music 播放控制
- 🎨 精美的用户界面
- 📝 实时歌词显示
- 🖼️ 专辑封面展示
- ⌨️ 媒体键支持
- 🪟 无边框窗口设计

## 技术栈

- **Electron** - 桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **electron-builder** - 打包工具

## 项目结构

```
.
├── build/                  # 构建资源目录
│   ├── icon.svg            # 应用图标源文件
│   ├── icon.ico            # 应用图标（需生成）
│   └── README.md           # 构建资源说明
├── src/
│   ├── main/               # Electron 主进程
│   │   ├── main.ts         # 主进程入口
│   │   └── preload.ts      # 预加载脚本
│   └── renderer/           # 渲染进程（React）
│       ├── components/     # React 组件
│       ├── hooks/          # 自定义 Hooks
│       ├── App.tsx         # 应用根组件
│       └── main.tsx        # 渲染进程入口
├── dist/                   # 构建输出目录
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
- 推送标签 `v*`（例如 `v1.0.0`）

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
   git tag v1.0.0
   git push origin v1.0.0
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
| `npm run build:win` | 构建 Windows 安装程序 |

## 组件说明

### 主要组件

- **AlbumArt** - 专辑封面显示
- **IdleState** - 空闲状态界面
- **LyricsDisplay** - 歌词展示
- **PlaybackControls** - 播放控制按钮
- **TitleBar** - 自定义标题栏
- **TrackInfo** - 曲目信息显示

### 自定义 Hooks

- **useLyrics** - 歌词获取与管理
- **useMediaSession** - 媒体会话集成

## 配置说明

### package.json

关键配置项：

- **main**: `dist/main.js` - Electron 主进程入口
- **build.appId**: `com.playbacker.desktop` - 应用唯一标识
- **build.directories.output**: `release/` - 打包输出目录
- **build.directories.buildResources**: `build/` - 构建资源目录

### Vite 配置

配置文件：`vite.config.ts`

- 输出目录：`dist/renderer`
- 路径别名：`@` → `/src`

## License

MIT
