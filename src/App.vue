<script setup>
import NavBar from './components/NavBar.vue'
import { ref, provide } from 'vue';
provide('rooms', ["Hall", "CvrdPlayGndEnt", "CvrdPlayGndMir", "CvrdPlayGndAnnex", "RdgCor", "MusicRm", "ConfRm1F",
    "ConfRm6F", "MpRm413", "OpenPlayGnd", "RoofPlayGnd", "StdntActCntr", "Rm514", "Rm214", "Rm104",
    "Rm105", "Rm106", "Rm107", "Rm111", "Rm112", "Rm201", "Rm202", "Rm203", "Rm204", "Rm205", "Rm206",
    "Rm207", "Rm208", "Rm209", "Rm211", "Rm212", "Rm301", "Rm302", "Rm303", "Rm304", "Rm305", "Rm306",
    "Rm311", "Rm312", "Rm405", "Rm411", "Rm412", "Rm414", "Rm418", "Rm419", "Rm501", "Rm504"])
provide('canApprove', ref(false))
provide('canSeeAll', ref(false))
provide('canSeeOne', ref(false))
</script>

<template>
    <NavBar />
    <router-view />
</template>
