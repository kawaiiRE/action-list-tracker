import { createApp } from 'vue'
import App from './App.vue'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'
import 'material-design-icons-iconfont/dist/material-design-icons.min.css'
import '@mdi/font/css/materialdesignicons.css'
import { userStore } from '@/stores/userStore'

const app = createApp(App)
app.use(createVuestic())

// Initialize user store before mounting
userStore.initialize()

app.mount('#app')
