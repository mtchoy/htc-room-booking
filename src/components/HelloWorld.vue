<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import { version } from "../../package.json";
import { useIsAuthenticated } from '../composition-api/useIsAuthenticated';

import SignInButton from "./SignInButton.vue";
import SignOutButton from "./SignOutButton.vue";

const isAuthenticated = useIsAuthenticated();

defineProps({
  msg: String,
})

// const count = ref(0)

const canSeeAll = inject("canSeeAll")

</script>

<template>
  <div style="height:480px">
    <section>
      <h1 class="title">HTC Room Booking System</h1>
    </section>
    <br><br>
    <SignOutButton v-if="isAuthenticated" />
    <SignInButton v-else />
    <br><br>
    <div class="my-4">
      <RouterLink to="/equipment-view" v-if="canSeeAll">Equipments</RouterLink>
    </div>
    <br><br>
    <span class="tag is-light">Version: {{ version }}</span>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
