import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Gallery from '@/views/Gallery'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    { 
      path: '/gallery',
      name: 'gallery',
      component: Gallery
    }
   
  ]
})