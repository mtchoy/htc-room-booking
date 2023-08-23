<script setup>
import { ref, onMounted, watch } from 'vue'
// import { useIsAuthenticated } from '../composition-api/useIsAuthenticated';
// import { useMsalAuthentication } from "../composition-api/useMsalAuthentication";
// import { InteractionType } from "@azure/msal-browser";
// import { loginRequest } from "../authConfig";

// import SignInButton from "./SignInButton.vue";
// import SignOutButton from "./SignOutButton.vue";

import { version } from "../../package.json";

import { useIsAuthenticated } from '../composition-api/useIsAuthenticated';
import SignInButton from "./SignInButton.vue";
import SignOutButton from "./SignOutButton.vue";

const isAuthenticated = useIsAuthenticated();

defineProps({
  msg: String,
})

const count = ref(0)

// const isAuthenticated = useIsAuthenticated();

// const { result, acquireToken } = useMsalAuthentication(InteractionType.Redirect, loginRequest);

const canSeeAll = ref(localStorage.getItem("canSeeAll") == "true");

// watch(isAuthenticated, (isAuthenticated) => {
//   if (isAuthenticated) {
//     // loadAsyncData(result.value.accessToken).catch(() => acquireToken());
//     acquireToken();
//   }
// });

// watch(result, () => {
//   // Fetch new data from the API each time the result changes (i.e. a new access token was acquired)
//   // updateData();
//   // alert(JSON.stringify(result.value))
//   localStorage.setItem('msalAccount', JSON.stringify(result.value.account));
//   localStorage.setItem('msalToken', result.value.accessToken);

//   if (result.value.account.idTokenClaims.groups.includes('f6f8e7d4-647a-434f-86d6-3949165d955f')) {
//     localStorage.setItem('canApprove', true);
//     localStorage.setItem('canSeeAll', true);
//     localStorage.setItem('canSeeOne', true);
//   }

//   alert(JSON.stringify(result.value.accessToken))
//   alert(JSON.stringify(result.value))
//   // location.assign('/bookings')
// });

// const account = ref(undefined)
// const github = ref('https://github.com/cmatskas')
// const twitter = ref('https://twitter.com/christosmatskas')
// const signin = ref('https://microsoft.com')

// const loginRequest = {
//   scopes: ['Bookings.Read'],
// };

// const msalConfig = {
//   auth: {
//     clientId: '51578f82-653c-4e5b-bca0-d805e361f14b',
//     authority:
//       'https://login.microsoftonline.com/691f6e87-f236-4be9-a9da-894ffbeb16ef',
//     // redirectUri: '/bookings', // Must be registered as a SPA redirectURI on your app registration
//   },
//   cache: {
//     cacheLocation: 'localStorage',
//   },
// };

// const msalInstance = new PublicClientApplication(
//   msalConfig
// );

// onMounted(async () => {
//   await msalInstance.initialize();
//   const accounts = msalInstance.getAllAccounts();
//   if (accounts.length == 0) {
//     return;
//   }
//   account.value = accounts[0];
//   // this.$emitter.emit('login', this.account);

// })


// const signIn = async function () {
//   await msalInstance
//     .loginPopup({})
//     .then(() => {
//       const myAccounts = msalInstance.getAllAccounts();
//       account.value = myAccounts[0];
//       // this.$emitter.emit('login', this.account);
//       // alert(JSON.stringify(account.value))
//       msalInstance.setActiveAccount(account);
//       getGraphData()
//     })
//     .catch(error => {
//       console.error(`error during authentication: ${error}`);
//     });
// }
// const signOut = async function () {
//   await msalInstance
//     .logoutPopup({})
//     .then(() => {
//       // this.$emitter.emit('logout', 'logging out');
//     })
//     .catch(error => {
//       console.error(error);
//     });
// }

// async function getGraphData() {
//   const response = await msalInstance.acquireTokenSilent({
//     ...loginRequest
//   }).catch(async (e) => {
//     if (e instanceof InteractionRequiredAuthError) {
//       await msalInstance.acquireTokenRedirect(loginRequest);
//     }
//     throw e;
//   });
//   alert(JSON.stringify(response.accessToken))

//   localStorage.setItem('msalAccount', JSON.stringify(msalInstance.getActiveAccount()));
//   localStorage.setItem('msalToken', response.accessToken);

//   location.assign('/bookings')

//   if (inProgress.value === InteractionStatus.None) {
//     alert(JSON.stringify(response.accessToken))

//     // const graphData = await callMsGraph(response.accessToken);
//     // state.data = graphData;
//     // state.resolved = true;
//     // stopWatcher();
//   }
// }

</script>

<template>
  <!-- <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p> -->
  <!-- <div class="content-container">
    <div class="section content-title-group">
      <h2 class="title">Welcome to the Azure AD + Storage app with Vue.js</h2>
    </div>

    <div v-if="account">
      <div class="level">
        <div class="level-item title">
          You are logged in as {{ account.name }}
        </div>
      </div>
    </div>
    <div v-else>You need to authenticate to access your Azure Storage data</div>

    <div class="buttons">
     
      <a v-if="!account" @click="signIn" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-sign-in-alt fa-2x" aria-hidden="false">Sign in</i>
      </a>
      <a v-else @click="signOut" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-sign-out-alt fa-2x" aria-hidden="false">Sign out</i>
      </a>
      <div v-if="account">{{ account.name }}</div>
    </div>

  </div> -->
  <div style="height:480px">
    <section>
      <h1>HTC Room Booking System</h1>
    </section>
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
