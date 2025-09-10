import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { initTheme } from './theme'

initTheme();               // ← set dark/light class before mount

const app = createApp(App)
app.use(router)
app.mount('#app')
