import { createApp } from "vue";
import App from "./app.vue";
import ElementPlus from "element-plus";
import vueCookies from "vue-cookies";
import "element-plus/dist/index.css";

const app = createApp(App);

// 从 @element-plus/icons-vue 中导入所有图标并进行全局注册
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(ElementPlus);
app.use(vueCookies);
app.mount("#main");
