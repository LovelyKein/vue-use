---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Kyle-VueUse'
  text: '定制化 Vue Composition 工具集'
  tagline: 基于 <b class="vue3">Vue3</b> 实现的 <b class="vue3">Composition API</b> 的组合式工具库
  image:
    src: /static/vitepress-logo.svg
    alt: Kyle-VueUse
  actions:
    - theme: brand
      text: 立即开始
      link: /guides/what
    - theme: alt
      text: API 文档
      link: /pages/useToggle

features:
  - icon: 🦾
    title: 类型安全
    details: Typescript 编写，完整类型约束
  - icon: 🚀
    title: 灵活
    details: 易于使用，方便管理，团队横向产出
  - icon: 🔋
    title: 持续迭代
    details: 基于基础工程化框架，可持续迭代新 Composition API
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
.vue3 {
  font-size: 36px;
  background: linear-gradient(
        90deg,
        #ffcb47,
        #e34ba9,
        #369eff,
        #95f3d9
      );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
