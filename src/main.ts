import { createApp } from "vue"
import router from "./router"
import { createPinia } from "pinia"

import App from "./App.vue"

import "./style.css"

const app = createApp(App)
app.use(createPinia())

app.use(router)

app.mount("#app")

// reset hero roster if switching to sonic
if (!localStorage.getItem("sonic")) {
    localStorage.setItem("sonic", "true")
    localStorage.removeItem("heroRoster")
}
