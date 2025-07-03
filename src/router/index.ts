import { createRouter, createWebHashHistory } from 'vue-router'

import LoginView from '../views/LoginView/index.vue'
import HomeView from '../views/HomeView/index.vue'
import RequestsView from '../views/RequestsView/index.vue'
import AddRequestView from '../views/AddRequestView/index.vue'
import RequestDetailView from '../views/RequestDetailView/index.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Login' },
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Dashboard', showBack: false },
  },
  {
    path: '/requests',
    name: 'Requests',
    component: RequestsView,
    meta: { title: 'All Requests', showBack: true, backTo: '/home' },
  },
  {
    path: '/requests/add',
    name: 'AddRequest',
    component: AddRequestView,
    meta: { title: 'Add New Request', showBack: true, backTo: '/requests' },
  },
  {
    path: '/requests/:id',
    name: 'RequestDetail',
    component: RequestDetailView,
    meta: { title: 'Request Details', showBack: true, backTo: '/requests' },
    props: true,
  },
  {
    path: '/requests/category/:category',
    name: 'RequestsByCategory',
    component: RequestsView,
    meta: {
      title: 'Requests by Category',
      showBack: true,
      backTo: '/requests',
    },
    props: true,
  },
  {
    path: '/requests/status/:status',
    name: 'RequestsByStatus',
    component: RequestsView,
    meta: { title: 'Requests by Status', showBack: true, backTo: '/requests' },
    props: true,
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
