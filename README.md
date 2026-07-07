# 农行贵宾厅查询

一个基于 TypeScript 和 React 的静态查询网站，用于快速检索农业银行境外机场贵宾厅列表。

线上地址：

- https://abc-lounge.anserlabs.com
- https://abc-lounge-finder.pages.dev

## 功能

- 支持按城市、机场、机场三字码、贵宾厅名称和位置指引关键词搜索
- 支持按区域、国家/地区、城市、机场代码、出发类型、安检类型筛选
- 结果列表和详情面板联动，适合手机和桌面端快速查找
- 数据以静态 JSON 加载，适合 Cloudflare Pages 托管

## 数据

当前数据来自 `农业银行贵宾厅列表.xlsx` 中的 `贵宾厅境外机场清单` 工作表，共 1024 条记录。

生成后的数据文件位于：

```text
public/lounges.json
```

## 开发

安装依赖：

```bash
npm install
```

启动本地开发服务：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

部署到 Cloudflare Pages：

```bash
npm run deploy
```

默认 Pages 项目名为 `abc-lounge-finder`，配置见 `wrangler.jsonc`。

## 技术栈

- TypeScript
- React
- Vite
- Cloudflare Pages

## License

MIT
