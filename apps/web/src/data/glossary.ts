export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const glossary: GlossaryEntry[] = [
  {
    term: 'Cache-Control',
    definition:
      '缓存控制——HTTP 响应头，告诉浏览器和 CDN 如何缓存资源，常用指令有 max-age、no-cache、no-store、public、private 等。',
  },
  {
    term: 'Service Worker',
    definition: '在浏览器后台运行的脚本，可拦截网络请求实现离线缓存、消息推送等功能，是 PWA 的核心技术。',
  },
  {
    term: 'Mixed Content',
    definition: '混合内容——HTTPS 页面中加载了 HTTP 资源，浏览器会阻止或警告，应升级所有资源为 HTTPS 避免此问题。',
  },
  {
    term: 'Source Map',
    definition: '源码映射——将压缩/编译后的代码映射回原始源文件的文件，方便在浏览器 DevTools 中调试原始代码。',
  },
  {
    term: 'Call Stack',
    definition: '调用栈——JavaScript 引擎追踪函数调用顺序的数据结构，报错时显示的堆栈信息指明了错误发生的调用路径。',
  },
  {
    term: 'IndexedDB',
    definition: '浏览器内置的 NoSQL 数据库，支持存储大量结构化数据和索引查询，适合离线应用和本地数据持久化。',
  },
  {
    term: 'Lighthouse',
    definition:
      'Google 开源的网页质量审计工具，从性能、可访问性、最佳实践、SEO 四个维度评分并给出优化建议，内置于 Chrome DevTools。',
  },
  {
    term: 'Minification',
    definition:
      '代码压缩/最小化——移除代码中的空格、注释、缩短变量名，减小文件体积以加速网络传输，常用于 JS/CSS 构建流程。',
  },
  {
    term: 'WebSocket',
    definition:
      '全双工通信协议——在单个 TCP 连接上实现客户端与服务端的双向实时通信，适合聊天、协作编辑、实时数据推送等场景。',
  },
  {
    term: 'Breakpoint',
    definition: '断点/响应式断点——CSS 媒体查询中定义的屏幕宽度阈值，页面布局在这些断点处切换以适应不同屏幕尺寸。',
  },
  {
    term: 'Hydration',
    definition:
      '水合——SSR 发送静态 HTML 到浏览器后，客户端 JavaScript 在已有 DOM 上绑定事件和状态，让页面变成可交互的过程。',
  },
  {
    term: 'SameSite',
    definition:
      'Cookie 的 SameSite 属性——控制跨站请求是否携带 Cookie，有 Strict/Lax/None 三种模式，用于防范 CSRF 攻击。',
  },
  {
    term: 'Viewport',
    definition:
      '视口——用户在浏览器中实际可见的网页区域，通过 meta viewport 标签和 CSS 媒体查询来控制不同设备上的布局。',
  },
  {
    term: 'HttpOnly',
    definition:
      'Cookie 的 HttpOnly 标志——禁止 JavaScript 通过 document.cookie 访问该 Cookie，即使发生 XSS 攻击也无法窃取该 Cookie 的值。',
  },
  {
    term: 'GraphQL',
    definition:
      'Facebook 开发的 API 查询语言，客户端可精确指定需要的数据字段，避免 REST 接口的过度获取和不足获取问题。',
  },
  {
    term: 'CORS',
    definition:
      '跨域资源共享——浏览器安全机制，控制一个域的网页能否请求另一个域的资源。报错通常是后端没设置 Access-Control-Allow-Origin 头。',
  },
  {
    term: 'CSRF',
    definition: '跨站请求伪造——诱导用户在已登录的站点上执行非本意的操作。通过 CSRF Token 或 SameSite Cookie 来防御。',
  },
  {
    term: 'CSP',
    definition: '内容安全策略——通过 HTTP 头或 meta 标签限制页面可加载的资源来源，是防御 XSS 和代码注入攻击的重要防线。',
  },
  {
    term: 'CDN',
    definition: '内容分发网络——在全球部署边缘节点，将静态资源缓存到离用户最近的服务器上，大幅降低访问延迟和源站压力。',
  },
  {
    term: 'CLS',
    definition:
      '累计布局偏移——页面加载过程中可见元素意外移动的程度，衡量视觉稳定性。Core Web Vitals 之一，应控制在 0.1 以内。',
  },
  {
    term: 'DNS',
    definition:
      '域名系统——将域名（如 google.com）解析为 IP 地址的分布式服务，是互联网访问的第一步，DNS 解析速度直接影响页面加载。',
  },
  {
    term: 'DOM',
    definition: '文档对象模型——浏览器将 HTML 解析成的树形结构，JavaScript 通过操作 DOM 来动态修改页面内容和样式。',
  },
  {
    term: 'ETag',
    definition:
      '实体标签——服务器为资源生成的版本标识符，浏览器通过 If-None-Match 请求头携带 ETag 以验证缓存是否过期，实现条件请求。',
  },
  {
    term: 'HAR',
    definition:
      'HTTP 归档文件——浏览器记录的完整网络请求日志，包含请求头、响应头、时间线等，常用于性能分析和前后端问题排查。',
  },
  {
    term: 'INP',
    definition:
      '交互到下一次绘制——用户交互（点击、按键）后到浏览器渲染下一帧的延迟，衡量页面响应性。Core Web Vitals 指标，替代了旧的 FID。',
  },
  {
    term: 'LCP',
    definition: '最大内容绘制——页面最大可见元素完成渲染的时间。Core Web Vitals 之一，应控制在 2.5 秒以内。',
  },
  {
    term: 'MPA',
    definition:
      '多页应用——每个页面是独立的 HTML 文件，通过浏览器导航切换页面。对 SEO 友好，但页面切换有白屏，需要服务端路由支持。',
  },
  {
    term: 'REST',
    definition:
      '一种 API 设计风格，使用 HTTP 方法（GET/POST/PUT/DELETE）操作资源，URL 代表资源而非动作，无状态且可缓存。',
  },
  {
    term: 'SPA',
    definition:
      '单页应用——整个应用只有一个 HTML 页面，通过 JavaScript 动态切换视图。用户体验流畅如原生应用，但首屏加载和 SEO 需要额外处理。',
  },
  {
    term: 'SSE',
    definition:
      '服务器推送事件——服务端向浏览器单向推送数据流的机制，基于 HTTP 协议，比 WebSocket 更轻量，适合实时通知和日志流。',
  },
  {
    term: 'SSG',
    definition:
      '静态站点生成——在构建时将页面预渲染为静态 HTML 文件，部署后访问速度极快，适合博客、文档等内容相对固定的站点。',
  },
  {
    term: 'SSR',
    definition:
      '服务端渲染——服务器将页面组件渲染为完整 HTML 后发送给浏览器，有利于 SEO 和首屏加载速度，但会增加服务器压力。',
  },
  {
    term: 'CSR',
    definition: '客户端渲染——由浏览器 JavaScript 在客户端动态生成页面内容，交互体验流畅但首屏可能较慢且不利于 SEO。',
  },
  {
    term: 'TTFB',
    definition: '首字节时间——从浏览器发起请求到收到服务器第一个字节的时间，是衡量服务器和网络响应速度的核心性能指标。',
  },
  {
    term: 'XSS',
    definition:
      '跨站脚本攻击——攻击者在页面中注入恶意脚本，窃取用户数据或劫持会话。防范手段包括输入过滤、输出转义和 CSP。',
  },
];
