<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { addDays, addMonths, addHours, addMinutes } from 'date-fns'
// import ApexRangebars from '../components/ApexRangebars.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({
    inheritLocale: true,
    useScope: 'local'
})

// const count = ref(0)
const route = useRoute()
const canReview = ref(false);
const rooms = ref(JSON.parse(localStorage.getItem("rooms")));
const room = ref('');
const minDate = ref(new Date(new Date().getFullYear() - 80, new Date().getMonth(), new Date().getDate()));
const maxDate = ref(new Date(new Date().getFullYear() + 18, new Date().getMonth(), new Date().getDate()));
// const date = ref(route.params.mode == 1 ? new Date(new Date().setHours(0, 0, 0, 0)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const date = ref(addMinutes(new Date(), new Date().getTimezoneOffset() + 480)); // 8 hours ahead of UTC 


// const date = new Date(new Date().setHours(0, 0, 0, 0));
const labelPosition = ref('on-border');

const previousDay = async function () {
    // date.value = new Date(date.value.getTime() - 86400000);
    date.value = addDays(date.value, -1);
}

const nextDay = async function () {
    // date.value = new Date(date.value.getTime() + 86400000);
    date.value = addDays(date.value, 1);
}

const isEmpty = ref(false)
const isBordered = ref(false)
const isStriped = ref(false)
const isNarrowed = ref(false)
const isHoverable = ref(false)
const isFocusable = ref(false)
const isLoading = ref(false)
// const data = ref(tableData)
const hasMobileCards = ref(true)

watch(() => date.value, () => {
    // alert("here")
    fetchDate();
});

const timeslots = ref([]);

const fetchDate = async function () {
    var response = await fetch(`/api/timeslots/bookings?date=${date.value}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`
        }
    });

    if (response.ok) {
        var result = await response.json();
        timeslots.value = result;
    }
}

onMounted(async () => {
    locale.value = "zh"
    fetchDate();
});

</script>

<template>
    <div class="is-flex is-justify-content-space-around is-align-items-center">
        <o-button class="is-flex-grow-0" variant="primary" icon-left="chevron-left" outlined v-if="!room"
            @click="previousDay">Previous Day
        </o-button>

        <o-field label="Date" :label-position="labelPosition" v-if="!room">
            <o-datepicker placeholder="Click to select..." :min-date="minDate" :max-date="maxDate" locale="en-CA"
                v-model="date" editable icon="calendar-today">
            </o-datepicker>
        </o-field>

        <o-button class="is-flex-grow-0" label="Next Day" icon-right="chevron-right" v-if="!room" @click="nextDay">
        </o-button>
    </div>

    <table style="height:480px">
        <o-table :data="isEmpty ? [] : timeslots" :bordered="isBordered" :striped="isStriped" :narrowed="isNarrowed"
            :hoverable="isHoverable" :loading="isLoading" :focusable="isFocusable" :mobile-cards="hasMobileCards">
            <o-table-column field="id" :label="t('message.room')" width="40" numeric v-slot:default="props">
                {{ props.row.room }}
            </o-table-column>

            <o-table-column field="first_name" :label="t('message.startTime')" v-slot:default="props">
                {{ new Date(props.row.startTime).toLocaleTimeString('en-GB') }}
            </o-table-column>

            <o-table-column field="last_name" :label="t('message.endTime')" v-slot:default="props">
                {{ new Date(props.row.endTime).toLocaleTimeString('en-GB') }}
            </o-table-column>

            <o-table-column field="date" :label="t('message.wirelessMic')" position="centered" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].wirelessMic : "" }}
            </o-table-column>

            <o-table-column field="date2" :label="t('message.microphoneStand')" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].microphoneStand : "" }}
            </o-table-column>

            <o-table-column :label="t('message.longTables')" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].longTables : "" }}
            </o-table-column>

            <o-table-column :label="t('message.chairs')" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].chairs : "" }}
            </o-table-column>

            <o-table-column :label="t('message.ChoirChairs')" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].choirChairs : "" }}
            </o-table-column>

            <o-table-column label="Equipment" v-slot:default="props">
                {{ props.row.bookings[0]? props.row.bookings[0].equipments : "" }}
            </o-table-column>
        </o-table>
    </table>
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

<i18n>
    {
        "en": {
            "message": {
                "room": 'Room',
                "date": 'Select a date',
                "startTime": 'Start Time',
                "endTime": 'End Time',
                "recurrent": 'Recurrent',
                "repeatedTimes": 'Number of times',
                "user" : "User / Organization",
                "teacher" : "Teacher In Charge",
                "numOfPeople": 'Number of People',
                "purpose": 'Purpose',
                "wirelessMic": "Wireless Mic",
                "microphoneStand": "Microphone Stand",
                "longTables": "Long Tables",
                "chairs": "Chairs",
                "ChoirChairs": "Choir Chairs",
                "notebookComputer": 'Notebook Computer',
                "LCDProjectorScreen": 'LCD Projector & Screen',
                "pianoMic": 'Piano Mic',
                "portableAmplifier": 'Portable Amplifier',
                "rubbishBin": 'Rubbish Bin',
                "remarks": 'Remarks',
                "once": "once",
                "daily": "daily",
                "weekly": "weekly"
            }
        },
        "zh": {
            "message": {
                "room": '課室',
                "date": '日期',
                "startTime": '開始時間',
                "endTime": '結束時間',
                "recurrent": '預留形式',
                "repeatedTimes": '次數',
                "user" :" 使用者 / 組織",
                "teacher" : "負責老師",
                "numOfPeople": '總共學生人數',
                "purpose": '用途',
                "wirelessMic": '無線咪',
                "microphoneStand": '咪STAND',
                "longTables": '長枱數量', 
                "chairs": '椅子數量',
                "ChoirChairs": "合唱團椅",
                "notebookComputer": '電腦',
                "LCDProjectorScreen": '投影器 及 幕', 
                "pianoMic": '鋼琴咪',
                "portableAmplifier": '擴音器',
                "rubbishBin": '垃圾桶',
                "remarks": '註記',
                "once": "一次",
                "daily": "每日",
                "weekly": "每週",
            }
        }
    }
    </i18n>
    
