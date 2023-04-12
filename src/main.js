import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import Oruga from '@oruga-ui/oruga-next'
// import '@oruga-ui/oruga-next/dist/oruga.css'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@oruga-ui/theme-bulma/dist/bulma.css'
import '@mdi/font/css/materialdesignicons.min.css';

import VueNavigationBar from 'vue-navigation-bar';
import 'vue-navigation-bar/dist/vue-navigation-bar.css';

createApp(App).use(router).use(Oruga, bulmaConfig).component('vue-navigation-bar', VueNavigationBar).mount('#app')


