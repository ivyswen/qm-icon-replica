# 项目说明

QM icon Replica 是基于 React 19、TypeScript 和 Vite 7 构建的纯前端跨平台应用图标设计工作站，支持 20,000+ 图标检索、实时 SVG/蒙版渲染与 14+ 平台资源包打包导出。

## 开发与验证命令

- 包管理器：`pnpm`
- 启动开发服务：`pnpm dev`
- 类型检查：`pnpm check`（`tsc --noEmit`）
- 生产构建：`pnpm build`
- 代码格式化：`pnpm format`

## 通用规则

- **单一状态源**：所有编辑能力以 `ExportDesignState` 为唯一事实来源，保证中央画布、各端预览和下载文件完全一致。
- **无障碍与容灾**：所有网络接口调用必须提供加载态与本地降级方案；浏览器持久化必须包含错误处理。
- **编码与语言**：所有文件使用 UTF-8 编码；对外沟通和代码注释保持中文。

## 按需指引

- [编辑器与状态架构](docs/agent-instructions/editor-architecture.md) — 修改画布渲染、状态流、图层特效或编辑器交互时阅读。
- [导出与多平台规范](docs/agent-instructions/export-presets.md) — 新增导出平台、调整尺寸变体、修改 ZIP 打包或生成配置文件时阅读。
- [图标素材与检索体系](docs/agent-instructions/icons-system.md) — 新增离线内置矢量图形、扩充中文语义别名或调整 Iconify 在线检索时阅读。
