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
  <!-- <button type="button" class="btn btn-primary" @click="logoutPopup"><span style="color:black">Sign Out</span></button> -->
  <div class="navbar-item">
    <WelcomeName />
  </div>
  <div>
    <a class="button is-primary is-light  is-outlined" @click="logoutPopup">Sign out
      Microsoft account &nbsp; <i class="mdi mdi-logout"></i></a>
  </div>
</template>