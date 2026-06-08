import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { vPermission } from './components/Permission'
import SvgIcon from './components/SvgIcon.vue'
import { loadSvgIcons } from './icons'
import 'element-plus/dist/index.css'
import './styles/global.scss'

// 必须在 App 挂载前注入 SVG 精灵图到 DOM
loadSvgIcons()

const app = createApp(App)
const pinia = createPinia()

// 全局注册 SvgIcon 组件
app.component('SvgIcon', SvgIcon)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.directive('permission', vPermission)

app.mount('#app')
