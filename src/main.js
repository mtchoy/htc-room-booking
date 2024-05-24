import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import Oruga from '@oruga-ui/oruga-next'
// import '@oruga-ui/oruga-next/dist/oruga.css'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@oruga-ui/theme-bulma/dist/bulma.css'
import '@mdi/font/css/materialdesignicons.min.css';

import VueApexCharts from "vue3-apexcharts";

import { msalPlugin } from "./plugins/msalPlugin";
import { msalInstance } from "./authConfig";

import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    locale: 'en', // set locale
    fallbackLocale: 'zh', // set fallback locale
    // messages, // set locale messages
    // If you need to specify other options, you can set other options
    // ...
})

msalInstance.initialize();

createApp(App).use(router).use(msalPlugin, msalInstance).use(Oruga, bulmaConfig).use(VueApexCharts)
    .use(i18n).mount('#app')


