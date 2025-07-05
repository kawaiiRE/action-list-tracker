import { createApp } from 'vue'
import App from './App/index.vue'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'
import 'material-design-icons-iconfont/dist/material-design-icons.min.css'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)
app.use(createVuestic())
app.mount('#app')
