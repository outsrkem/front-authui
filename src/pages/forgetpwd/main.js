import { createApp } from 'vue'
import App from './app.vue'
import ElementPlus from 'element-plus'
import vueCookies from 'vue-cookies'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(vueCookies)
app.mount('#main')
