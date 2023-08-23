<script setup>
import { ref, onMounted, watch } from 'vue'
import { useIsAuthenticated } from '../composition-api/useIsAuthenticated';
import { useMsalAuthentication } from "../composition-api/useMsalAuthentication";
import { InteractionType } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";

// import SignInButton from "./SignInButton.vue";
// import SignOutButton from "./SignOutButton.vue";

// const isSwitchedCustom = ref("My Bookings")

onMounted(() => {
  alert("onMounted")
  // alert(localStorage.getItem("isSwitchedCustom"))
  // isSwitchedCustom.value = localStorage.getItem("isSwitchedCustom")
  // alert(isSwitchedCustom.value)
  if (isAuthenticated) {
    // loadAsyncData(result.value.accessToken).catch(() => acquireToken());
    acquireToken();
  }
})

const isAuthenticated = useIsAuthenticated();

const { result, acquireToken } = useMsalAuthentication(InteractionType.Redirect, loginRequest);

// const canSeeAll = ref(localStorage.getItem("canSeeAll") == "true");

watch(isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    // loadAsyncData(result.value.accessToken).catch(() => acquireToken());
    acquireToken();
  }
});

watch(result, () => {
  // Fetch new data from the API each time the result changes (i.e. a new access token was acquired)
  // updateData();
  // alert(JSON.stringify(result.value))
  localStorage.setItem('msalAccount', JSON.stringify(result.value.account));
  localStorage.setItem('msalToken', result.value.accessToken);

  if (result.value.account.idTokenClaims.groups.includes('f6f8e7d4-647a-434f-86d6-3949165d955f')) {
    localStorage.setItem('canApprove', true);
    localStorage.setItem('canSeeAll', true);
    localStorage.setItem('canSeeOne', true);
  }

  // alert(JSON.stringify(result.value.accessToken))
  // alert(JSON.stringify(result.value))
  location.assign('/bookings')
});
</script>

<template>
    loading...
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
