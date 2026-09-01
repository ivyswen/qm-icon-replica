# 图标数据源研究记录

## 结论

本轮采用 Iconify 公共 API 作为图标数据源。官方文档说明，公共 API 位于 `https://api.iconify.design`，提供图标数据、SVG 生成、浏览和搜索能力，并托管超过 300,000 个来自开源图标集的图标。[1]

搜索接口使用 `GET /search?query={keyword}&limit={limit}`，返回 `icons` 数组以及 `total`、`collections` 等信息；图标名称带有图标集前缀，例如 `mdi:home` 或 `material-symbols:add-home`。[2]

单个图标的 SVG 可以通过 `/{prefix}/{name}.svg` 获取，支持 `color`、`width`、`height`、`rotate`、`flip` 和 `box` 参数。对于编辑器，本项目会获取 SVG 文本并嵌入中央画布，避免只把远程 URL 当作装饰图片，从而让颜色、蒙版和导出状态保持可控。[3]

公共 API 不需要用户提供密钥，因此不新增连接器；实现会提供加载态、失败态和 API 无法访问时的本地基础形状回退。图标集名称和许可信息会在搜索结果中显示，帮助用户识别来源。

## 参考

[1]: https://iconify.design/docs/api/ "Iconify API"
[2]: https://iconify.design/docs/api/search.html "Searching icons"
[3]: https://iconify.design/docs/api/svg.html "Rendering SVG"
