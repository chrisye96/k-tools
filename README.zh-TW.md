# K-Zone

[English](README.md) | [简体中文](README.zh-CN.md) | **繁體中文**

跨時區排程，一個畫面搞定。線上版：**[kzone.chrisye.dev](https://kzone.chrisye.dev)**。

每個分散式團隊都會一再問兩個問題，K-Zone 都能回答：

- **反向查詢**：「會議訂在卡加利上午 9 點，其他人那邊是幾點？」
- **正向查詢**：「我希望大家都醒著，哪些時段適合我們所有的城市？」

## 功能

- **錨點模式**：把一個城市固定為參考點，其他時區都對照它來看
- **即時世界時鐘**：你關心的城市一眼看清，即時更新
- **模糊城市搜尋**，以 [@vvo/tzdb](https://github.com/vvo/tzdb) 和 [fuse.js](https://fusejs.io/) 為基礎，即使拼成「calgry」也找得到 Calgary
- **依日期換算**，使用 react-day-picker，正確處理日光節約時間的切換
- **雙語介面**：英文和中文

## 技術堆疊

React 19 + Vite、Radix UI 基礎元件，以 Vitest 測試，透過 Wrangler 部署到 Cloudflare Pages。

## 開發

```bash
npm install
npm run dev        # 本機開發伺服器
npm run test       # vitest 監看模式
npm run test:run   # 單次執行全部測試
npm run build      # 正式環境建置
```

## 部署

推送後會自動部署到 Cloudflare Pages（見 `wrangler.jsonc`）。

> 本文由英文版機器翻譯而來，尚未經過母語人士逐行審閱。如有出入，以 [English](README.md) 版本為準。
