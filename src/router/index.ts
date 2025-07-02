import { createRouter, createWebHistory } from 'vue-router'

import LoginView       from '../views/LoginView/index.vue'
import HomeView        from '../views/HomeView/index.vue'
import RequestsView    from '../views/RequestsView/index.vue'
import AddRequestView  from '../views/AddRequestView/index.vue'

const routes = [
  { path: '/',            name: 'Login',    component: LoginView },
  { path: '/home',        name: 'Home',     component: HomeView },
  { path: '/requests',    name: 'Requests', component: RequestsView },
  { path: '/requests/add',name: 'AddReq',   component: AddRequestView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
