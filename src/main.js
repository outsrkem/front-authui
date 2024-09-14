import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
import vueCookies from 'vue-cookies'
app.use(ElementPlus, {
    locale: zhCn,
})

app.use(vueCookies)
app.mount('#login')