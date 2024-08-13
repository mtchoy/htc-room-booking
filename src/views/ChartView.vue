<script setup>
import { ref, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import { addDays, addMonths, format, startOfMonth, startOfDay } from 'date-fns'
import ApexRangebars from '../components/ApexRangebars.vue'

// const count = ref(0)
const route = useRoute()
const canReview = ref(localStorage.getItem("role") == "admin" || localStorage.getItem("role") == "officer" || localStorage.getItem("role") == "teacher");
const rooms = ref(inject('rooms'));
const room = ref(route.params.mode == 1 ? '' : 'Hall');
const minDate = ref(new Date(new Date().getFullYear() - 80, new Date().getMonth(), new Date().getDate()));
const maxDate = ref(new Date(new Date().getFullYear() + 18, new Date().getMonth(), new Date().getDate()));
const date = ref(route.params.mode == 1 ? startOfDay(new Date()) : startOfMonth(new Date()));

const labelPosition = ref('on-border');

const previousDay = async function () {
    date.value = addDays(date.value, -1);
}

const nextDay = async function () {
    date.value = addDays(date.value, 1);
}

const previousMonth = async function () {
    date.value = addMonths(date.value, -1)
}

const nextMonth = async function () {
    date.value = addMonths(date.value, 1)
}

watch(() => route.params.mode, () => {

    if (route.params.mode == 1) {
        room.value = '';
        date.value = startOfDay(new Date());
    } else {
        room.value = 'Hall';
        date.value = startOfMonth(new Date());
    }

});

</script>

<template>
    <div class="is-flex is-justify-content-space-around is-align-items-center">
        <o-button class="is-flex-grow-0" variant="primary" icon-left="chevron-left" outlined v-if="!room"
            @click="previousDay">Previous Day
        </o-button>

        <o-button class="is-flex-grow-0" variant="primary" icon-left="chevron-left" outlined v-if="room"
            @click="previousMonth">Previous Month
        </o-button>

        <div class="is-flex-grow-1">
            <span class="tag is-success">
                Approved
            </span>
            <span class="tag is-warning">
                Pending
            </span>
        </div>

        <o-field class="is-flex-grow-1" label="Room" v-if="room">
            <o-select placeholder="Select a room" v-model="room">
                <option v-for="option in rooms" :value="option" :key="option">
                    {{ option }}
                </option>
            </o-select>
        </o-field>

        <o-field label="Month" :label-position="labelPosition" v-if="room">
            <o-datepicker type="month" placeholder="Click to select..." icon="calendar-today" trap-focus v-model="date">
            </o-datepicker>
        </o-field>

        <o-field label="Date" :label-position="labelPosition" v-if="!room">
            <o-datepicker placeholder="Click to select..." :min-date="minDate" :max-date="maxDate" locale="en-CA"
                v-model="date" editable icon="calendar-today">
            </o-datepicker>
        </o-field>

        <o-button class="is-flex-grow-0" label="Next Day" icon-right="chevron-right" v-if="!room" @click="nextDay">
        </o-button>

        <o-button class="is-flex-grow-0" label="Next Month" icon-right="chevron-right" v-if="room" @click="nextMonth">
        </o-button>

    </div>
    <ApexRangebars :date="format(date, 'yyyy-MM-dd')" :room="room" />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
