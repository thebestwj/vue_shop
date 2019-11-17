import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
axios.interceptors.request.use(config => {
// Do something before request is sent
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
}, error => {
// Do something with request error
  return Promise.reject(error)
})

Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
