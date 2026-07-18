<script setup>
import { ref } from 'vue'
import OrugaTable from '../components/OrugaTable.vue'

const canReview = ref(localStorage.getItem("role") == "admin" || localStorage.getItem("role") == "officer");
const isSwitchedCustom = canReview.value ? ref("Review Bookings") : ref("My Bookings")
</script>

<template>
    <o-field>
        <o-switch v-model="isSwitchedCustom" variant="dark" passive-variant="info" true-value="My Bookings"
            false-value="Review Bookings" v-if="canReview">
            {{ isSwitchedCustom }}
        </o-switch>
    </o-field>

    <o-tabs type="boxes">
        <o-tab-item label="All" icon="select-all">
            <OrugaTable :isReviewer="isSwitchedCustom === 'Review Bookings'" status=""></OrugaTable>
        </o-tab-item>
        <o-tab-item label="Pending" icon="account-clock">
            <OrugaTable :isReviewer="isSwitchedCustom === 'Review Bookings'" status="Pending"></OrugaTable>
        </o-tab-item>
        <o-tab-item label="Approved" icon="check-decagram">
            <OrugaTable :isReviewer="isSwitchedCustom === 'Review Bookings'" status="Approved"></OrugaTable>
        </o-tab-item>
        <o-tab-item label="Rejected" icon="close-circle">
            <OrugaTable :isReviewer="isSwitchedCustom === 'Review Bookings'" status="Rejected"></OrugaTable>
        </o-tab-item>
    </o-tabs>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
