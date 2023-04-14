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

import VueApexCharts from "vue3-apexcharts";

localStorage.setItem("rooms", JSON.stringify(
    ["Hall", "CvrdPlayGndEnt", "CvrdPlayGndMir", "CvrdPlayGndAnnex", "RdgCor", "MusicRm", "ConfRm1F",
        "ConfRm6F", "MpRm413", "OpenPlayGnd", "RoofPlayGnd", "StdntActCntr", "Rm514", "Rm214", "Rm104",
        "Rm105", "Rm106", "Rm107", "Rm111", "Rm112", "Rm201", "Rm202", "Rm203", "Rm204", "Rm205", "Rm206",
        "Rm207", "Rm208", "Rm209", "Rm211", "Rm212", "Rm301", "Rm302", "Rm303", "Rm304", "Rm305", "Rm306",
        "Rm311", "Rm312", "Rm405", "Rm411", "Rm412", "Rm414", "Rm418", "Rm419", "Rm501", "Rm504"]))

createApp(App).use(router).use(Oruga, bulmaConfig).use(VueApexCharts)
    .component('vue-navigation-bar', VueNavigationBar).mount('#app')


