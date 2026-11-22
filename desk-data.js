export const BOOKS_DATA = [
  {
    id: 'ds',
    shortName: '数据结构',
    title: '408 · 数据结构',
    subtitle: 'DATA STRUCTURES',
    category: '408 专业课',
    scoreBadge: '408 总分 129 分',
    coverTag: '王道一至三刷 · 思维导图',
    coverNote: 'DS · 线性表 / 树 / 图 / 排序查找',
    color: '#254a86',
    accent: '#6fa0f0',
    spineColor: '#1b3766',
    size: [1.02, 0.20, 1.38],
    position: [-2.05, 0, -0.78],
    rotationY: 0.14,
    summary: '408 四门课的第一棒。1月开始跟王道视频，学一章刷一章选择题，三月初与计组同步结束一刷。',
    highlights: [
      '学习顺序：数据结构（DS）→ 计算机组成原理（CO）→ 操作系统（OS）→ 计算机网络（CN）',
      '非科班提醒：408 看上去是 4 门课，实际要加 C 语言一共 5 门课，跨考务必提前打好 C 语言基础',
      '一刷（1月–3月初）：看一章王道视频 + 刷一章课后选择题',
      '二刷（5月–7月初）：二刷王道视频 + 重刷选择题',
      '三刷（7月–9月初）：重刷选择错题 + 写大题（除部分偏难代码题外）+ 每章整理专属 XMind 思维导图',
      '后期（9月–考前）：真题 140+ → 刷天勤/王道/零壹/图灵/竟成/研芝士等模拟题选择 → 每天翻思维导图与错题'
    ],
    quote: '「思维导图真的很重要！把不会的知识点放进去，后期每天翻看就会全记住。」',
    downloads: [
      { name: '数据结构 思维导图 (.xmind)', href: 'download/数据结构.xmind', size: '2.3 MB', icon: '🗂️' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'co',
    shortName: '计组',
    title: '408 · 计算机组成原理',
    subtitle: 'COMPUTER ORGANIZATION',
    category: '408 专业课',
    scoreBadge: '408 总分 129 分',
    coverTag: '硬件核心 · 重难点突破',
    coverNote: 'CO · 存储系统 / 指令 / CPU / 总线',
    color: '#1d646b',
    accent: '#62c4cc',
    spineColor: '#13474d',
    size: [1.04, 0.22, 1.40],
    position: [-0.66, 0, -0.92],
    rotationY: 0.04,
    summary: '408 最硬核、最容易拉分也最容易让人心态波动的一科。务必通过多轮刷课、思维导图和强化课吃透底层逻辑。',
    highlights: [
      '1月–3月初：紧接数据结构完成王道计组一刷（视频 + 课后选择题）',
      '5月–9月初：二刷视频与选择题，三刷时攻克大题并逐章绘制计组思维导图',
      '11月强化补充：二刷真题 + 模拟题选择，同时补看了 beok 的基础课与强化课，以及部分王道强化课',
      '考场真实复盘：选择题 1h 写完，但 CO 第二道大题难度极高直接心态受挫；果断先跳过做后面的 OS 和 CN 大题，保住能拿的分数非常关键！'
    ],
    quote: '「考场遇到 CO 难题千万别死磕！果断跳过先拿后面的稳分，心态稳住就能逆转。」',
    downloads: [
      { name: '计算机组成原理 思维导图 (.xmind)', href: 'download/计算机组成原理.xmind', size: '3.1 MB', icon: '🔧' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'os',
    shortName: '操作系统',
    title: '408 · 操作系统',
    subtitle: 'OPERATING SYSTEMS',
    category: '408 专业课',
    scoreBadge: '408 总分 129 分',
    coverTag: '进程同步 · 内存与文件',
    coverNote: 'OS · PV操作 / 调度 / 虚拟内存',
    color: '#5a397a',
    accent: '#b48ce0',
    spineColor: '#3f2657',
    size: [1.02, 0.21, 1.38],
    position: [-1.82, 0, 0.84],
    rotationY: -0.09,
    summary: '在 DS 和 CO 之后推进，5月初完成一刷。知识点细碎且概念关联强，思维导图整理起来收益极大（7.8 MB 最全导图）。',
    highlights: [
      '3月初–5月初：跟王道完成操作系统与计算机网络一刷（每章视频 + 选择题）',
      '5月–7月初：二刷王道视频 + 二刷选择题，把进程管理、内存管理、文件系统串成体系',
      '7月–9月初：三刷视频 + 错题复盘 + 所有大题演练 + 逐章制作超详细 OS 思维导图（7.8 MB）',
      '考场经验：时间紧张时容易在计算细节上出错（当时 OS 第一题着急算错了 3 遍），平时练习大题要兼顾准确率与节奏'
    ],
    quote: '「408 后期不用再盲目看新课，每天翻一遍思维导图 + 刷错题，就能稳稳锁住高分。」',
    downloads: [
      { name: '操作系统 思维导图 (.xmind)', href: 'download/操作系统.xmind', size: '7.8 MB', icon: '⚙️' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'cn',
    shortName: '计网',
    title: '408 · 计算机网络',
    subtitle: 'COMPUTER NETWORKS',
    category: '408 专业课',
    scoreBadge: '408 总分 129 分',
    coverTag: '协议栈梳理 · 高频考点',
    coverNote: 'CN · 物理层到应用层 / TCP·IP',
    color: '#34507a',
    accent: '#7da8e8',
    spineColor: '#233859',
    size: [1.00, 0.19, 1.36],
    position: [-0.46, 0, 0.78],
    rotationY: 0.08,
    summary: '408 四科中性价比极高的一门，协议字段与流程偏记忆，配合自制思维导图反复翻看非常容易拿高分。',
    highlights: [
      '3月初–5月初：跟王道完成计网一刷，理解各层协议职责与数据封装流程',
      '5月–9月初：二刷、三刷视频并刷完课后题与大题，将易混协议细节全部沉淀进 XMind 思维导图（6.1 MB）',
      '9月–考前：真题 + 各机构模拟卷选择题（天勤、王道、零壹、图灵、竟成、研芝士等）查漏补缺',
      '备考心法：模拟卷重在保持手感与见识新角度，不必强求全刷，核心仍是真题 + 王道书 + 思维导图'
    ],
    quote: '「把零散的协议和易错点放进思维导图里，考前每天翻一遍就能形成肌肉记忆。」',
    downloads: [
      { name: '计算机网络 思维导图 (.xmind)', href: 'download/计算机网络.xmind', size: '6.1 MB', icon: '🌐' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'math',
    shortName: '数学二',
    title: '302 · 考研数学（二）',
    subtitle: 'MATHEMATICS II · 150 FULL',
    category: '王牌满分科目',
    scoreBadge: '💯 150 / 150 满分',
    coverTag: '80+ 套模拟卷火力覆盖',
    coverNote: '武忠祥 · 660 · 880 · 李永乐线代',
    color: '#21593c',
    accent: '#e5b95c',
    spineColor: '#163d28',
    size: [1.14, 0.28, 1.50],
    position: [1.06, 0, 0.66],
    rotationY: -0.06,
    summary: '考场 2 小时写完、1 小时把每个答案代回原式验算，最终拿下 150 分满分！秘诀就是起步早 + 火力够猛，刷了 80+ 套模拟卷。',
    highlights: [
      '1月–寒假：跟武忠祥学高数，每学一章立刻刷 660 对应章节，寒假结束刷完 660',
      '开学–4月底：一周速通武忠祥基础课补漏洞 → 刷完 25 年强化课 → 写严选题（难题可跳）+ 张宇 1000 题基础部分选填',
      '5月–5月底：线代跟姜小千打基础与强化，随后硬啃《李永乐线性代数辅导讲义》，实现彻底质变（强烈推荐！）',
      '6月–7月中旬：花一个多月刷完 880 全题型（选填+大题），同步看「没咋了」线代强化课和选择题技巧',
      '7月中–8月初：从 03 年真题开始每天一套，建立套卷节奏',
      '8月–考前（80+ 套模拟卷）：24/25/26 合工大超越、24/25/26 李林四套/六套、26 李艳芳（写了两套太难）、26 欧几里得三套（模考 132）、25/26 张宇四套、26 张宇八套；辅看武忠祥 17 堂课、epsilon-delta 大雪深埋及 B 站知识点视频'
    ],
    quote: '「这门课我满分，完全就是火力够猛，刷了 80 套模拟卷，所以基本上大部分题型我都见过。」',
    downloads: [
      { name: '高等数学 备考笔记资料 (.pdf)', href: 'download/高等数学.pdf', size: '5.6 MB', icon: '📐' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'english',
    shortName: '英语二',
    title: '204 · 考研英语（二）',
    subtitle: 'ENGLISH II · 73 PTS',
    category: '公共课',
    scoreBadge: '73 分 · 零语法逆袭',
    coverTag: '单词 + 阅读生词本 + 模板',
    coverNote: '不背单词 · 真题阅读 · 石雷鹏作文',
    color: '#295b8c',
    accent: '#8bc3f5',
    spineColor: '#1b3f63',
    size: [1.00, 0.19, 1.38],
    position: [0.96, 0, -0.88],
    rotationY: -0.10,
    summary: '英语基础几乎为 0、完全不懂语法的情况下稳拿 73 分。核心策略极简：死磕单词 + 阅读真题生词本循环 + 作文模板。',
    highlights: [
      '3月–5月：每天坚持背单词（使用「不背单词」App），先把词汇量铺开',
      '5月起–考前：每天刷一篇阅读真题，把遇到的生词全部加入生词本，每隔一段时间集中回顾生词本',
      '作文策略：直接跟石雷鹏，考前熟背并灵活套用自己的作文模板，性价比最高',
      '考场心态：放平心态正常发挥，不被语法短板吓倒，词汇和真题语感足以支撑稳妥拿分'
    ],
    quote: '「我英语不知道任何语法，完全就是 0。靠背单词 + 真题阅读生词本 + 石雷鹏模板稳拿 73 分。」',
    downloads: [
      { name: '完整考研经验贴 (.md)', href: 'download/一战上岸师大经验贴.md', size: '9 KB', icon: '📝' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  },
  {
    id: 'politics',
    shortName: '政治',
    title: '101 · 思想政治理论',
    subtitle: 'POLITICS · 67 PTS',
    category: '公共课',
    scoreBadge: '67 分 · 高效备考',
    coverTag: '9月起步 · 选择拉分 · 背肖四',
    coverNote: '徐涛 · 苏一 · 肖1000 · 澄潇宇一页纸',
    color: '#9c2d2e',
    accent: '#f0b86e',
    spineColor: '#6e1d1e',
    size: [1.00, 0.20, 1.38],
    position: [2.26, 0, -0.14],
    rotationY: 0.15,
    summary: '9月开始完全来得及！政治的核心是把选择题刷透，上海等小旱区主观题拉不开差距，背熟肖四、考场尽量写满即可。',
    highlights: [
      '9月起步：看徐涛强化课（马原、史纲、毛概），搭配苏一思维导图边看边理框架',
      '选择题一阶段：刷肖 1000 题打底',
      '选择题冲刺：购买微信小程序，每天刷多套各机构模拟卷；12月配合「澄潇宇一页纸（plus版）」汇总高频考点，学累了就翻看',
      '考前技巧：看澄潇宇选择题技巧，并刷几套真题找手感（如多选题“选项与题干无关”的常见设错方式）',
      '主观题与考场提醒：背肖四足够（当时背了约 60%），但考试时大题写字耗时很长——选择 40 分钟写完后，大题差点没写完，一定要把控书写速度！'
    ],
    quote: '「上海主观题均分 27 很难拉开分，把精力重点放在选择题上，主观题背肖四尽量写满！」',
    downloads: [
      { name: '完整考研经验贴 (.md)', href: 'download/一战上岸师大经验贴.md', size: '9 KB', icon: '📝' },
      { name: '完整考研经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' }
    ],
    externalLinks: [
      { name: '网课及资料汇总（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
    ]
  }
];

export const PROFILE_DATA = {
  id: 'profile',
  shortName: '419成绩单',
  title: '一战上岸华东师大 · 419 初试第一',
  subtitle: 'PERSONAL PROFILE · 择校 · 省钱 · 心态',
  category: '个人情况 & 综合建议',
  scoreBadge: '总分 419 · 计算机专硕第一',
  image: 'assets/score-419.jpg',
  summary: '本科苏州工学院（二本），有过 ACM 邀请赛铜牌经历。26 考研华东师范大学计算机专硕初试第一名：政治 67、英语二 73、数学二 150、408 129，总分 419 分。',
  sections: [
    {
      heading: '🎯 择校建议',
      text: '一定要根据自己的实力选择，并充分考虑复试准备时间与自身优势。前期（4–5月）不必焦虑，可以先定阶梯目标（当时计划冲南邮、华理、上大，江苏大学/苏科大保底），到 8–9 月摸清真实水平后再定最终目标院校。'
    },
    {
      heading: '💰 省钱技巧（全程花费 < 2000 元）',
      text: '没有报任何补习班，几乎没买网课。大部分网课与资料在网盘/金山文档中都有；后期模拟卷找 PDF 去淘宝打印；常用核心书买正版（纸质好无异味），偶尔翻看的可以买二手或平价版。'
    },
    {
      heading: '🧘 备考精神状态',
      text: '全年只有五一回了一次家，其余时间全部在学校。全年平均每天学习 10h+，冲刺期甚至达到 13–14h。过程很痛苦，但找到节奏、坚持到最后，二本也能一战上岸 985！'
    }
  ],
  downloads: [
    { name: '完整经验贴 (.pdf)', href: 'download/一战上岸师大经验贴.pdf', size: '338 KB', icon: '📄' },
    { name: '完整经验贴 (.md)', href: 'download/一战上岸师大经验贴.md', size: '9 KB', icon: '📝' }
  ],
  externalLinks: [
    { name: '全部网课及资料（金山文档）', href: 'https://www.kdocs.cn/l/cgQxEOyblJwA', icon: '🔗' }
  ]
};
