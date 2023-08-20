<script setup>
import { useMsal } from '../composition-api/useMsal';
import WelcomeName from './WelcomeName.vue';
    
const { instance } = useMsal();

const logoutPopup = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: "/"
  });
}

const logoutRedirect = () => {
  instance.logoutRedirect();
}
</script>

<template>
    <!-- <el-dropdown>
        <WelcomeName />
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item v-on:click="logoutPopup">Logout Popup</el-dropdown-item>
                <el-dropdown-item v-on:click="logoutRedirect">Logout Redirect</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown> -->
    <button type="button" @click="logoutPopup">Sign Out</button>
</template>