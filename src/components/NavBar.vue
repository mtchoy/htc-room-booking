<script setup>
import { ref, computed, watch } from 'vue'
import { useMsal } from '../composition-api/useMsal';

// defineProps({
//     msg: String,
// })

// const count = ref(0)

const { accounts } = useMsal();

watch(accounts, (accounts) => {
    if (accounts.value.length > 0) {
        // localStorage.setItem('msalAccount', JSON.stringify(accounts[0]));
        name.value = accounts.value[0].name;
    }
});

const name = computed(() => {
    if (accounts.value.length > 0) {
        const name = accounts.value[0].name;
        if (name) {
            return name.split(" ")[0];
        }
    }
    return "default";
});

const options = [{
    text: "Create Booking",
    path: "/booking"
},
{
    text: "Bookings",
    path: "/bookings"
},
{
    text: "Search by Date",
    path: "/chart-view/1"
},
{
    text: "Search by Room",
    path: "/chart-view/2"
}];

const burgerActive = ref(false);
const burgerClicked = () => {
    burgerActive.value = !burgerActive.value;
}
</script>

<template>
    <nav class="navbar" role="navigation" aria-label="main navigation" v-if="name">
        <div class="navbar-brand">
            <a class="navbar-item" href="/">
                <!-- <img src="../assets/Holy-Trinity-College-logo-vector-01.svg" width="112" height="28"> -->
                <b>HTC Room Booking System</b>
            </a>

            <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample"
                @click="burgerClicked()" :class="{ 'is-active': burgerActive }">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu" :class="{ 'is-active': burgerActive }">
            <div class="navbar-start">
                <a v-for="option in options" class="navbar-item" :href="option.path">
                    {{ option.text }}
                </a>
            </div>

            <div class="navbar-end">
                <div class="navbar-item">
                    <div class="buttons">
                        <a class="button is-outline-primary" href="/">
                            <strong>{{ name }}</strong>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}

.vnb .button-red {
    background: #ff3b30;
}

.vnb .button-red:hover {
    background: #fc0d00;
}
</style>
