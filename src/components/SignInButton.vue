<script setup>
import { useMsal } from '../composition-api/useMsal';
import { loginRequest } from "../authConfig";

const { instance } = useMsal();

const loginPopup = () => {
  instance.loginPopup(loginRequest);
}
    
const loginRedirect = () => {
  instance.loginRedirect(loginRequest);
}
</script>

<template>
    <!-- <el-dropdown>
        <el-button type="primary">Sign In</el-button>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item v-on:click="loginPopup">Login Popup</el-dropdown-item>
                <el-dropdown-item v-on:click="loginRedirect">Login Redirect</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown> -->
    <button type="button" @click="loginPopup">
      <img src="../assets/ms-symbollockup_signin_dark.svg" alt="Sign In" width="215" height="41" />
    </button>
</template>