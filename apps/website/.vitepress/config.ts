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
            { text: 'DOM 元素', link: '/pages/useElement' },
            { text: 'Vue', link: '/pages/useOpenComp' },
            { text: '异步任务', link: '/pages/useTasks' },
            { text: '事件', link: '/pages/useMouse' },
            { text: '浏览器', link: '/pages/useTitle' },
            { text: '文件分片', link: '/pages/useFileSplit' },
            { text: '额外脚本', link: '/pages/useExtraScript' },
            { text: '工具函数', link: '/pages/debounce' }
          ]
        }
      ],
      '/pages': [
        {
          text: '数据&状态',
          items: [
            { text: 'useToggle', link: '/pages/useToggle' },
            { text: 'useCycleList', link: '/pages/useCycleList' },
            { text: 'useStorage', link: '/pages/useStorage' },
            { text: 'useHistory', link: '/pages/useHistory' }
          ]
        },
        {
          text: 'DOM 元素',
          items: [
            { text: 'useElement', link: '/pages/useElement' },
            { text: 'useExtraScript', link: '/pages/useExtraScript' }
          ]
        },
        {
          text: 'Vue',
          items: [{ text: 'useOpenComp', link: '/pages/useOpenComp' }]
        },
        {
          text: '异步任务',
          items: [
            { text: 'useTasks', link: '/pages/useTasks' },
            { text: 'useIdleTask', link: '/pages/useIdleTask' },
            { text: 'useFetch', link: '/pages/useFetch' }
          ]
        },
        {
          text: '事件',
          items: [{ text: 'useMouse', link: '/pages/useMouse' }]
        },
        {
          text: '浏览器',
          items: [
            { text: 'useTitle', link: '/pages/useTitle' },
            { text: 'useFileSplit', link: '/pages/useFileSplit' }
          ]
        },
        {
          text: '工具函数',
          items: [
            { text: 'debounce', link: '/pages/debounce' },
            { text: 'throttle', link: '/pages/throttle' }
          ]
        },
        {
          text: '组件',
          items: [{ text: 'VirtualList', link: '/pages/virtualList' }]
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
