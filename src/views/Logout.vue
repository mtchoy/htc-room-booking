<script setup>
import { onMounted, inject } from 'vue'

onMounted(() => {
  inject('canApprove').value = false
  inject('canSeeAll').value = false
  inject('canSeeOne').value = false
  localStorage.clear();
  location.assign('/')
});

// const logoutPopup = () => {
//     alert("logoutPopup");
//   instance.logoutPopup({
//     mainWindowRedirectUri: "/"
//   });
// }
</script>

<template>
  Logging out...
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
