<script setup>
import { ref } from 'vue'
import OrugaTable from '../components/OrugaTable.vue'

const isSwitchedCustom = ref("My Bookings")

function filter() {
    console.log("filter")
}
</script>

<template>
    <o-field>
        <o-switch v-model="isSwitchedCustom" variant="dark" passive-variant="info" true-value="My Bookings"
            false-value="Review Bookings">
            {{ isSwitchedCustom }}
        </o-switch>
    </o-field>

    <o-tabs type="boxes">
        <o-tab-item label="All" icon="images">
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
