import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

//set up local storage
import Storage from 'vue-ls';
let options = {
  namespace: 'camera__', // key prefix
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local', // storage name session, local, memory
}; 
Vue.use(Storage, options);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
