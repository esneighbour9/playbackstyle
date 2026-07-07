# Build Resources

此目录包含 electron-builder 打包所需的资源文件。

## 必需文件

### icon.ico
- **用途**: 应用程序图标、安装程序图标、卸载程序图标
- **格式**: ICO (Windows 图标格式)
- **尺寸**: 建议包含 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- **来源**: 可将 `icon.svg` 转换为 ICO 格式

## 生成 icon.ico

### 方法一：使用在线工具
1. 访问 https://convertio.co/svg-ico/ 或类似在线转换工具
2. 上传 `icon.svg`
3. 选择 ICO 格式，下载后保存为 `icon.ico`

### 方法二：使用 ImageMagick
```bash
# 安装 ImageMagick 后执行
magick -background none icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### 方法三：使用 npm 包
```bash
npm install -g sharp-cli
sharp -i icon.svg -o icon.ico --resize 256,128,64,48,32,16
```

## 参考配置

在 [package.json](../package.json) 中配置了以下引用：

```json
"build": {
  "buildResources": "build",
  "win": {
    "icon": "build/icon.ico"
  },
  "nsis": {
    "installerIcon": "build/icon.ico",
    "uninstallerIcon": "build/icon.ico"
  }
}
```
