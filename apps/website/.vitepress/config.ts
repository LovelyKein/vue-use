import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 语言配置
  lang: 'zh-CN',
  // 站点标题
  title: 'Kyle-VueUse',
  // 站点描述
  description: '基于 Vue 实现的 Composition API 库',
  // 站点图标
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/static/favicon.svg' }]],
  // 主题配置
  themeConfig: {
    // 站点logo
    logo: '/static/vitepress-logo.svg',
    // 顶部右侧导航栏配置
    nav: [
      { text: '主页', link: '/' },
      { text: '文档', link: '/pages/useToggle' }
    ],
    // 页面侧边栏配置（根据路径匹配分类）
    sidebar: {
      '/guides': [
        {
          text: '指南',
          items: [
            { text: '动机', link: '/guides/what' },
            { text: '快速上手', link: '/guides/start' }
          ]
        },
        {
          text: 'API 文档',
          items: [
            { text: '数据&状态', link: '/pages/useToggle' },
            { text: 'DOM 元素', link: '/pages/useMouse' },
            { text: '网络', link: '/pages/useFetch' }
          ]
        }
      ],
      '/pages': [
        {
          text: '数据&状态',
          items: [
            { text: 'useToggle', link: '/pages/useToggle' },
            { text: 'useStorage', link: '/pages/useStorage' },
            { text: 'useHistory', link: '/pages/useHistory' }
          ]
        },
        {
          text: 'DOM 元素',
          items: [{ text: 'useElement', link: '/pages/useElement' }]
        },
        {
          text: '异步任务',
          items: [
            { text: 'useTasks', link: '/pages/useTasks' },
            { text: 'useFetch', link: '/pages/useFetch' }
          ]
        },
        {
          text: '事件',
          items: [{ text: 'useMouse', link: '/pages/useMouse' }]
        },
        {
          text: '其他',
          items: [{ text: 'useTitle', link: '/pages/useTitle' }]
        }
      ]
    },
    // 右侧大纲配置
    outline: {
      label: '目录',
      level: 2
    },
    // 顶部右侧导航栏配置（社交链接）
    socialLinks: [
      { icon: 'github', link: 'https://github.com/LovelyKein' },
      { icon: 'gitee', link: 'https://gitee.com/LovelyKein' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/417059354?spm_id_from=333.33.0.0' }
    ]
  }
})
