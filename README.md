<div align="center">

# QM icon Replica

**纯前端跨平台应用图标设计工作站**

无需设计软件与后端服务，在浏览器端完成 20,000+ 矢量图标检索、实时 SVG 渲染与 14+ 平台资源包打包导出。

[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](./LICENSE)

</div>

---

## 这是什么

**QM icon Replica** 是基于 React 19、TypeScript 和 Vite 7 构建的现代化纯前端应用图标设计与多平台打包工作站。

它将原本繁琐的图标绘制、配色调整、平台尺寸适配、多分辨率打包与工程配置文件生成流程全部整合至浏览器端运行。无论是移动端开发者、独立创作者还是前端工程师，都能在数秒内设计出符合各操作系统规范的高质量 App 图标。

---

## 为什么需要它

在跨平台应用开发中，为不同操作系统准备图标是一项高重复度且容易出错的工作：

- **平台规范各异**：iOS 需要 `AppIcon.appiconset` 与 `Contents.json`；Android 需要 `adaptive-icon` XML 与多密度 mipmap；macOS 要求 `.iconset`；Windows 需要多分辨率复合 `.ico`；Web 平台需要 `favicon.ico` 与 `manifest.json`。
- **预览与导出割裂**：传统工具往往导出尺寸比例与设计预览不一致，导致边缘裁切失真。
- **依赖重型工具**：仅为调整一个图标往往需要打开 Figma 或 Photoshop 并手动导出十几个尺寸。

QM icon Replica 采用 **单一状态源（Single Source of Truth）** 架构：中央画布、侧端实时预览、单文件直出和多平台 ZIP 打包严格消费同一份 `ExportDesignState`，实现真正的所见即所得。

---

## 核心特性

### 1. 20,000+ 矢量素材与智能检索

- **离线内置精选库**：内置 64+ 常用高精矢量图形，支持中文拼音/语义别名秒级检索。
- **Iconify 在线全库接入**：无缝检索 20,000+ 开源矢量图标与品牌 Logo，支持自定义 SVG 路径与文字排版模式。

### 2. 细腻的矢量渲染与图层特效

- **色彩与渐变**：支持单色、自定义角度线性渐变、径向渐变、锥形渐变与反光质感。
- **智能蒙版与外形**：内置 22% 平滑连续圆角（Squircle）、经典圆、六边形及自定义 SVG 剪裁路径。
- **立体质感与特效**：实时渲染真实投影（Drop Shadow）、发光光晕（Glow）、描边增强（Stroke）与状态角标（Badge）。

### 3. 全平台标准化工程资源包导出

- **单文件快速直出**：底栏直接下载指定尺寸的 `PNG`、`WebP`、`SVG` 或 `ICO` 文件，配有 `[−] / [+]` 双向步进微调。
- **全平台多规格 ZIP 一键打包**：
  - **iOS**：包含从 20pt 到 1024pt App Store 全尺寸 PNG 及标准 `Contents.json`。
  - **Android**：包含 `mipmap-mdpi` 至 `xxxhdpi` 位图资源与自适应图标 XML（`ic_launcher.xml`、`ic_launcher_round.xml`、`colors.xml`）。
  - **macOS**：标准 `macOS.iconset` 目录与各倍率资源。
  - **Windows**：各变体单尺寸与 16~256px 多分辨率合一 `Windows/icon.ico`、`Windows/app.ico`。
  - **Web/PWA**：`favicon.ico`、PWA 192/512 图标与配置完备的 `manifest.json`。
- **交互式 ZIP 预览**：支持打包前展开目录树、文件类型筛选（PNG/WebP/SVG/ICO/配置）与文件数量统计。

### 4. 本地自动保存与体验保障

- **Auto-Save & Restore**：防抖自动将设计草稿同步至本地 `localStorage`，刷新或关闭浏览器后无缝恢复工作进度。
- **历史快照与撤销重做**：支持历史记录管理与出厂预设一键重置。
- **双语与主题**：完整支持中英双语切换，完美适配浅色与深色（Dark Mode）工作台。

---

## 快速开始

### 运行环境

- Node.js 18+
- pnpm 9+

### 安装与启动

```bash
# 1. 克隆代码仓库
git clone <repository-url>
cd qm-icon-replica

# 2. 安装依赖
pnpm install

# 3. 启动本地开发服务
pnpm dev
```

启动后在浏览器打开 `http://localhost:5173` 即可开始设计。

---

## 开发与构建命令

```bash
pnpm dev       # 启动 Vite 开发服务器
pnpm check     # 运行 TypeScript 严格类型检查 (tsc --noEmit)
pnpm test      # 运行 Vitest 单元测试套件
pnpm build     # 构建前端静态产物与服务端包
pnpm format    # 执行 Prettier 全局代码格式化
```

---

## 架构与源码结构

```text
client/
├── src/
│   ├── features/
│   │   ├── editor/           # 编辑器领域模型、默认预设、模板与 AppMark 画布组件
│   │   ├── export/           # SVG 生成、ICO 二进制编码器、平台尺寸预设与 ZIP 打包引擎
│   │   ├── icons/            # 内置图标库、Iconify 异步检索与 SVG 解析工具
│   │   └── i18n/             # 中英双语国际化文案
│   ├── contexts/             # 主题（深色/浅色）等全局上下文
│   ├── pages/                # Home 主工作台编排
│   └── index.css             # 全局视觉 Token 与高密度工具箱样式
server/                       # 轻量静态服务（用于生产部署）
```

---

## 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
