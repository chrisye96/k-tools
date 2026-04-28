# K-Zone UI/UX 设计规范与开发指南 (v2.0)

## 1. 核心设计理念 (Core Philosophy)

K-Zone 确立了 K-Tools 系列的视觉与交互基调：**“原生质感、效率优先、准确互信”**。

- **原生表单质感**：采用 iOS 经典的 **内嵌分组卡片 (Inset Grouped)** 和“标签居左-数值居右”的两端对齐表单设计，提供极低学习成本的交互体验。
- **克制的视觉层级**：完全抛弃边框，依靠背景色差（Background/Card）区分层级；仅用品牌色 **Teal (水鸭蓝)** 引导唯一的交互焦点。
- **动态信任感 (Trust by Design)**：在涉及复杂时区与夏令时变更时，提供轻量且场景化的数据准确性背书。

## 2. 设计变量与主题 (Design Tokens & Theming)

系统原生支持浅色 (Light) 和深色 (Dark) 模式，采用 CSS Variables (`:root` 与 `[data-theme="dark"]`) 进行无缝切换。

### 2.1 配色面板 (Color Palette)

- **背景色 (Backgrounds)**
  - **Light**: 页面底色 `#F2F2F7` / 卡片底色 `#FFFFFF`
  - **Dark**: 页面底色 `#000000` / 卡片底色 `#1C1C1E`
- **品牌主色 (Primary Accent)**
  - **Light**: `#30B0C7` (Teal)
  - **Dark**: `#4DD0E1` (Brighter Teal，保证深色模式下的对比度)
- **文本颜色 (Typography Colors)**
  - **Light**: 主文本 `#1C1C1E` / 次要文本 `#8E8E93`
  - **Dark**: 主文本 `#FFFFFF` / 次要文本 `#98989D`
- **交互与反馈色 (Interaction Colors)**
  - **输入框高亮底色**: `rgba(48, 176, 199, 0.1)` (Light) / `rgba(77, 208, 225, 0.15)` (Dark)
  - **警告/取消色**: `#FF3B30` (Light) / `#FF453A` (Dark)
  - **Time Travel 警示底色**: `var(--teal-light)` 搭配粗体文字。

### 2.2 字体排版 (Typography)

采用系统默认无衬线字体族，保证极限加载速度和原生观感。 `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`

- **超大数字 (Large Time)**：`28px`, `Semi-Bold` (600)，**关键配置：** 使用 `font-variant-numeric: tabular-nums;` 防止数字实时变化时发生宽度跳动。
- **统一输入框文本 (Inputs)**: `18px`, `Medium` (500)，颜色使用 `var(--primary-teal)` 强调可交互性。
- **分组小标题 (Section Title)**：`13px`, 颜色 `Secondary`，采用 Title Case（首字母大写，如 *Search by Time*）。

## 3. 页面布局架构 (Layout Architecture)

单页双卡片 (Single Page, Stacked) 结构，包含明确的页眉与页脚。

### 3.1 顶部导航区 (Top Navigation)

- **分栏布局**：左右分离设计（Flex Space-between），释放垂直空间。
- **左侧**：基准定位胶囊（含自动定位图标和城市名），及动态显示的政策提示图标 `ℹ️`。
- **右侧**：正圆形的全局操作按钮（Icon Buttons），用于 Theme 和 Language 的切换。

### 3.2 核心内容区 (Content Area)

- 移动端（最大宽度限制在 `600px` 内）：卡片左右保留 `16px` (Inset 风格) 边距。
- 包含横向滚动的“快捷收藏夹横幅 (Favorites Strip)”和主体表单卡片。

### 3.3 全局信任页脚 (Global Trust Footer)

- **位置与样式**：位于页面最底部居中，`12px` 的 Secondary 灰色文本。
- **用途**：展示当前底层依赖的时区数据库版本（例如：*Timezone Data: IANA 2026a (Up to date)*），建立专业用户的信任感。

## 4. 核心 UI 组件与交互 (Core Components & UX)

### 4.1 统一原生输入框 (Unified Inputs)

为保证极简的原生体验，所有输入（原生 `type="time"` 和 `type="text"`）统一采用如下标准：

- **无边框右对齐**：Label 居左，Input 完全撑满剩余空间并右对齐 (`text-align: right`)。

- **颜色暗示**：输入文字颜色统一采用 `Teal`，占位符 (`placeholder`) 采用灰色。

- **针对 Time Picker 的特殊 Hack**： 为修复 Webkit 浏览器原生 Time Picker 内部结构靠左的问题，需强制应用以下 CSS：

  ```
  .unified-input[type="time"]::-webkit-datetime-edit { justify-content: flex-end; display: flex; }
  .unified-input[type="time"]::-webkit-calendar-picker-indicator { margin-left: 8px; /* 深色模式下需使用 filter: invert(1) 翻转图标颜色 */ }
  ```

### 4.2 城市搜索下拉面板 (Search Dropdown)

- **触发机制**：激活城市输入框并输入字符时，弹出悬浮面板（脱离文档流，`position: absolute`，置于卡片之上，带强烈阴影）。
- **UI 表现**：全宽度匹配输入框，展示 `City Name` (左) 和 `Timezone • Day Offset` (右)。

### 4.3 向左滑动收藏手势 (Swipe-to-Action)

- **视觉表现**：在列表项 (List Item) 上向左滑动，右侧露出带有底色的操作块（未收藏为 Teal色，已收藏为 Danger红色）。
- **触发模式**：**吸附式 (Snap)**，滑动后停靠，必须发生 `onClick` 点击事件才执行逻辑并回弹复位，防止误操作。
- **技术实现建议**：可使用原生 CSS 的 `scroll-snap-type: x mandatory` 搭配平滑滚动实现基础原型；正式开发推荐使用 `@use-gesture/react` 精确控制物理阻尼感。

### 4.4 时空穿梭控件 (Time Travel Override)

- **默认状态**：输入框下方的一行安静的 `Teal` 文字 (`+ Set Date/Time`)。
- **警示状态 (Crucial UX)**：一旦开启，整行背景变为高亮的浅水鸭蓝，并呈现强提示警告（*⚠️ Showing results for: Dec 25*），右侧伴有醒目的 `↻ Reset to Live` 按钮。

### 4.5 Section 标题 (Section Title)

K-Tools 主页采用单页多 section 布局（K-Zone 是 Reverse / Forward 两个 section）。Section 标题作为内容区分的核心视觉锚点，必须**显眼但不喧宾夺主**。

**规范：**

- **字号**：`1.25rem` (20px)，`font-weight: 700`
- **颜色**：`var(--color-text-primary)` 主文本色，**不**使用 secondary 灰色（避免与小标签混淆）
- **左侧装饰条**：`::before` 伪元素，宽 `4px`，高 `1.1em`，背景 `var(--color-accent)` (Teal)，圆角 `2px`
- **结构**：`<h2>` 元素与装饰条用 `display: flex` + `gap: var(--space-3)` 排列
- **下边距**：`var(--space-4)` (16px)，给后续内容透气

**为什么不用全分割线 / 全 underline：** Inset Grouped 风格刻意去边框，多一条横线会压抑层级；左侧 Teal 竖条同时承担"分组开始"与"品牌引导"两件事，比下划线更克制。

**示例 CSS（已落地在 `global.css`）：**

```css
.section__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section__title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.1em;
  background: var(--color-accent);
  border-radius: 2px;
}
```

未来 K-Tools 其他工具（K-Conv, K-Map 等）继承同一 token 时直接复用这个 class，不需要重写。

## 5. 状态管理与数据流转 (State & Data Flow)

### 5.1 全局状态 (Global Context)

- **`Theme`**: 驱动 HTML 的 `data-theme` 属性，与用户的系统偏好 (OS prefers-color-scheme) 联动。
- **`Language`**: 驱动界面 i18n 字典映射 (支持 EN/ZH)。
- **`My Location`**: 全局基准时区，同步影响 Section 1 和 Section 2 的时间计算。

### 5.2 数据存储 (Local Storage)

- **`favorites`**: 数组结构，仅存储 IANA 时区 ID（例：`['Asia/Tokyo', 'Europe/London']`）。加载时由前端映射为具体城市数据并渲染在顶部的 Favorites Strip 中。

### 5.3 政策动态提示 (Contextual Policy UI)

- 当检测到所选城市（如 Calgary）在底层数据源中近期发生了 DST（夏令时）规则变更时，其标签旁自动出现 `ℹ️` 图标，点击后进行 Toast/Alert 轻量解释。