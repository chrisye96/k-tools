# K-Zone

[English](README.md) | **简体中文** | [繁體中文](README.zh-TW.md)

跨时区排期，一屏搞定。在线地址：**[kzone.chrisye.dev](https://kzone.chrisye.dev)**。

每个分布式团队都会反复问两个问题，K-Zone 都能回答：

- **反向查询**：“会议定在卡尔加里上午 9 点，其他人那边是几点？”
- **正向查询**：“我希望大家都醒着，哪些时间段对我们所有城市都合适？”

## 功能

- **锚点模式**：把一个城市固定为参照点，其他时区都对照它来看
- **实时世界时钟**：你关心的城市一眼看清，实时更新
- **模糊城市搜索**，基于 [@vvo/tzdb](https://github.com/vvo/tzdb) 和 [fuse.js](https://fusejs.io/)，即使拼成 “calgry” 也能找到 Calgary
- **按日期换算**，使用 react-day-picker，正确处理夏令时切换
- **双语界面**：英文和中文

## 技术栈

React 19 + Vite、Radix UI 基础组件，测试用 Vitest，通过 Wrangler 部署到 Cloudflare Pages。

## 开发

```bash
npm install
npm run dev        # 本地开发服务器
npm run test       # vitest 监视模式
npm run test:run   # 单次运行全部测试
npm run build      # 生产构建
```

## 部署

推送后会自动部署到 Cloudflare Pages（见 `wrangler.jsonc`）。

> 本文由英文版机器翻译而来，尚未经过母语者逐行审校。如有出入，以 [English](README.md) 版本为准。
