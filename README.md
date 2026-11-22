# 一战上岸师大 · 考研经验贴（2D 秋日版 & 3D 图书馆版）

分享 2026 考研华东师范大学计算机专硕（初试第一，总分 419：政治 67 / 英语二 73 / 数学二 150 / 408 129）的备考经验、复习时间线，以及全部可免费下载的 408 思维导图与高数资料。

- **在线访问**：[https://lujiawei.xyz](https://lujiawei.xyz)
- **双版本切换**：首页右上角点击 **「3D版」** 进入沉浸式 3D 大学图书馆书桌；3D 页面右上角点击 **「2D版」** 随时返回经典秋日落叶图文版。

---

## 📁 项目结构

```text
.
├── index.html          # 2D 秋日毛玻璃经验贴主页（含右上角 3D 版入口）
├── autumn-leaves.js    # 2D 页面秋日落叶粒子特效
├── glass-lens.js       # 2D 页面毛玻璃折射滤镜
├── 3d.html             # 3D 大学图书馆自习室页面
├── desk-3d.js          # 3D 主场景、书本展开/翻页动画、UV 点击下载与交互逻辑
├── desk-data.js        # 7 门科目备考内容与资料清单数据
├── desk-sound.js       # Web Audio API 物理建模拟真交互音效引擎
├── library-env.js      # 宽阔双层大学图书馆大厅、窗外校园、烟花与自习同学
├── assets/
│   └── score-419.jpg   # 419 分初试成绩单图片
└── download/           # 免费备考资料（408 四科 XMind 思维导图、高数 PDF、全文 MD/PDF）
```

---

## 🚀 本地运行

纯静态原生 HTML + ES Modules，无需构建工具，在仓库根目录启动任意静态服务器即可预览：

```bash
python3 -m http.server 8765
```

浏览器访问 `http://localhost:8765/`（2D 版）或 `http://localhost:8765/3d.html`（3D 版）。
