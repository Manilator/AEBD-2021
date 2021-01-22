import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import Users from '@/components/Users'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/users',
      name: 'Users',
      component: Users
    }
  ]
})
