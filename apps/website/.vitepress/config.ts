import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'Kyle-VueUse',
  description: '基于 Vue 实现的 Composition API 库',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/static/favicon.svg' }]],
  themeConfig: {
    logo: '/static/vitepress-logo.svg',
    // 导航栏配置
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/core' }
    ],
    // 侧边栏配置
    sidebar: {
      '/guides/': [
        {
          text: '指南',
          items: [{ text: '立即开始', link: '/guides' }]
        }
      ],
      '/core/': [
        {
          text: '状态',
          items: [
            { text: 'useToggle', link: '/core/useToggle' },
            { text: 'useRefHistory', link: '/core/useRefHistory' }
          ]
        },
        {
          text: '浏览器',
          items: [{ text: 'useMouse', link: '/core/useMouse' }]
        },
        {
          text: '网络',
          items: [{ text: 'useFetch', link: '/core/useFetch' }]
        }
      ]
    },
    // 右侧大纲配置
    outline: {
      label: '大纲',
      level: 2
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/LovelyKein' },
      { icon: 'gitee', link: 'https://gitee.com/LovelyKein' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/1402280' }
    ]
  }
})
