# 导出与多平台规范

适用范围：新增导出平台、调整尺寸变体、修改 ZIP 打包或生成配置文件时。

## 核心规则

1. **尺寸预设同步**：所有平台的导出尺寸与变体定义在 `features/export/export.ts` 的 `PLATFORM_PRESETS` 中统一维护，下载前 ZIP 预览面板的目录树与统计计数必须基于同一份计划。
2. **配置文件生成**：
   - Android 平台必须按规范生成 `mipmap-anydpi-v26/ic_launcher.xml`、`ic_launcher_round.xml`、`colors.xml` 及前景矢量资源；
   - iOS / macOS 平台必须生成对应的 `Contents.json`；
   - Web 平台必须生成 `manifest.json`。
3. **格式保真**：SVG/PNG/WebP 导出必须保留所有生效的蒙版剪裁（clipPath）、发光（filter）、描边（stroke）与角标（badge），确保下载文件与画布实时渲染 100% 一致。
