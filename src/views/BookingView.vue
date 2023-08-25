<script setup>
// import HelloWorld from '../components/HelloWorld.vue'
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { addBusinessDays, addYears, setHours, formatISO9075 } from 'date-fns'
import { useI18n } from 'vue-i18n'
import { useProgrammatic } from '@oruga-ui/oruga-next'
import vPrint from 'vue3-print-nb'

const { t, locale } = useI18n({
    inheritLocale: true,
    useScope: 'local'
})

const route = useRoute()
const id = route.params.id;

const booking = ref({
    date: addBusinessDays(new Date(), 2),
    equipments: [],
    recurrent: 0,
    repeatedTimes: 1,
    wirelessMic: 0,
    microphoneStand: 0,
    longTables: 0,
    chairs: 0,
    choirChairs: 0
});

const rooms = ref(JSON.parse(localStorage.getItem("rooms") || []));
// const date = ref(new Date(new Date().setHours(0, 0, 0, 0)));
const minDate = ref(addBusinessDays(new Date(), 2));
const maxDate = ref(addYears(new Date(), 2));
const minTime = ref(setHours(new Date(), 7));
const maxTime = ref(setHours(new Date(), 18));
const hourFormat = ref("24"); // Browser locale
const enableSeconds = ref(false);
// const locale = ref(undefined); // Browser locale
const minutesGranularity = ref(5);

const labelPosition = ref("0");
const dropFile = ref(null);
const isImageModalActive = ref(false);

// const isReading = ref("<%= action %>" == "read");
const isReading = ref(id ? true : false);
// const canBook = ref("<%= (!req.session.canBook) %>" == "false");
const canReview = ref(true);
const canApprove = ref(localStorage.getItem("canApprove") == "true");
const selectedRoom = ref({})

const { oruga } = useProgrammatic()

watch(() => booking.value.room, async () => {

    if (!isReading.value) {
        booking.value.wirelessMic = 0;
        booking.value.microphoneStand = 0;
        booking.value.longTables = 0;
        booking.value.chairs = 0;
        booking.value.choirChairs = 0;
        booking.value.equipments = []
    }

    var response = await fetch(`/api/rooms/${booking.value.room}`);

    if (response.ok) {

        selectedRoom.value = await response.json();
        // alert(selectedRoom)
    } else {
        var message = await response.json();
        alert(JSON.stringify(message));
    }
});

watch(() => dropFile.value, async () => {
    if (dropFile.value) {
        fileChanged();
    }
})

const submitForm = async function () {

    var postData = { ...booking.value };
    postData.date = formatISO9075(postData.date, { representation: 'date' })
    postData.startTime = formatISO9075(postData.startTime, { representation: 'time' })
    postData.endTime = formatISO9075(postData.endTime, { representation: 'time' })

    var response = await fetch("/api/bookings/", {
        method: "post",
        headers: {
            'Content-Type': 'application/json',    
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
            'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}`
        },
        body: JSON.stringify(postData)
    });

    if (response.ok) {
        var text = await response.text();

        oruga.notification.open({
            message: text,
            variant: 'success',
            position: 'top',
            actionText: 'OK',
            // indefinite: true,
            onAction: () => {
                location.assign("/booking/listMine")
            }
        })

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}

const fetchThisBooking = async function () {

    var response = await fetch(`/api/bookings/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
            'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}`
        }
    });

    if (response.ok) {

        const jsonData = await response.json();
        var result = jsonData.result;

        if (!isReading) {
            result.date = new Date(result.date)
            result.startTime = new Date(result.startTime)
            result.endTime = new Date(result.endTime)

            result.recurrent = t('once')
        }

        booking.value = result;

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}

const changeStatus = async function (newStatus) {

    booking.value.status = newStatus;

    var response = await fetch("/api/bookings/" + id, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
            'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}`
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(booking.value)
    });

    if (response.ok) {

        oruga.notification.open(`OK`)

    } else {
        alert(response.statusText);
        // var message = await response.json();
        // alert(JSON.stringify(message));
    }

}

const fileChanged = async function () {

    if (!["png", "jpeg", "jpg", "gif"].includes(dropFile.value.name.split(".").pop().toLowerCase())) {
        dropFile.value = null;
        oruga.notification.open("Only image files are allowed");
        return
    }

    const formData = new FormData();
    formData.append('foo', dropFile.value);

    try {
        var response = await fetch("/api/upload", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
                'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}` 
            },
            body: formData
        });
        if (response.ok) {
            // var data = await response.json();
            // var pieces = data.files[0].fd.split("/");
            // this.booking.fd = "/images/" + pieces.pop();

            // booking.value.fd = data.files[0].fd;

            var data = await response.text();
            booking.value.filename = data;

            // alert(booking.value.filename)

        } else {
            console.log(response.status);
        }
    } catch (error) {
        console.log(error);
    }
}

const withdraw = function () {

    oruga.dialog.confirm({
        message: 'Are you sure to withdraw this booking?',
        onConfirm: async () => {

            var response = await fetch("/api/bookings/" + id, {
                method: 'delete',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
                    'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}`
                } 
            });

            if (response.ok) {

                oruga.notification.open({
                    message: 'Application withdrawn successfully.',
                    type: 'is-success',
                    position: 'is-top',
                    actionText: 'OK',
                    indefinite: true,
                    onAction: () => {
                        location.assign("/booking/listMine")
                    }
                })

            } else {
                alert(response.statusText);
                // var message = await response.json();
                // alert(JSON.stringify(message));
            }
        }
    })
}

const printLoading = ref(true);

const printObj = {
    id: "printMe",
    popTitle: 'good print',
    // extraCss: "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css",
    // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
    beforeOpenCallback(vue) {
        vue.printLoading = true;
        // console.log('打开之前')
    },
    openCallback(vue) {
        vue.printLoading = false
        // console.log('执行了打印')
    },
    closeCallback(vue) {
        locale.value = "en"
        // console.log('关闭了打印工具')
    }

    // printJS({
    //     printable: 'app', type: 'html', scanStyles: true,
    //     // css: ["https://unpkg.com/buefy/dist/buefy.min.css",
    //     //     "https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css"],
    //     css: ["/node_modules/bulma/css/bulma.min.css",
    //         "/node_modules/@mdi/font/css/materialdesignicons.min.css"],
    //     // style: ".o-checkbox.checkbox input[type=checkbox]:checked+.check:before { content: '✔️';}",
    //     style: "* { color-adjust: exact; -webkit-print-color-adjust: exact; }",
    //     documentTitle: "Room Booking System #" + id
    // });
};

onMounted(() => {
    if (isReading.value) {
        fetchThisBooking();
    }
});
</script>

<template>
    <form id="printMe" class="container columns is-centered is-multiline" @submit.prevent="submitForm">
        <div class="column is-half">
            <div class="columns is-multiline">

                <o-field class="column is-half" :label="t('message.room')">
                    <o-select placeholder="Select a room" v-model="booking.room" v-if="!isReading" required>
                        <option v-for="option in rooms" :value="option" :key="option">
                            {{ option }}
                        </option>
                    </o-select>
                    <o-input v-model="selectedRoom.name" v-if="isReading && locale == 'en'" readonly></o-input>
                    <o-input v-model="selectedRoom.zhname" v-if="locale == 'zh'" readonly></o-input>
                </o-field>

                <o-field class="column is-half" :label="t('message.date')">
                    <o-datepicker placeholder="Click to select..." :min-date="minDate" :max-date="maxDate" locale="en-CA"
                        v-model="booking.date" v-if="!isReading" editable icon="calendar-today" required>
                    </o-datepicker>
                    <o-input v-model="booking.date" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-half" :label="t('message.startTime')">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="booking.startTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="booking.startTime" v-if="isReading" readonly>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="t('message.endTime')">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="booking.endTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="booking.endTime" v-if="isReading" readonly>
                    </o-input>
                </o-field>

                <o-field :label="t('message.recurrent')" class="column">
                    <o-radio v-model="booking.recurrent" native-value="0" v-if="!isReading">
                        <o-icon icon="calendar-today"></o-icon>
                        <span>{{ t('message.once') }}</span>
                    </o-radio>

                    <o-radio v-model="booking.recurrent" native-value="1" v-if="!isReading">
                        <o-icon icon="calendar-week"></o-icon>
                        <span>{{ t('message.daily') }}</span>
                    </o-radio>

                    <o-radio v-model="booking.recurrent" native-value="7" v-if="!isReading">
                        <o-icon icon="calendar-week-begin"></o-icon>
                        <span>{{ t('message.weekly') }}</span>
                    </o-radio>
                    <o-input v-model="booking.recurrent" v-if="isReading" readonly>
                    </o-input>
                    <!-- <o-input v-model="zhRecurrent" v-if="locale == 'zh'" readonly>
                                                                </o-input> -->
                </o-field>

                <o-field class="column" :label="t('message.repeatedTimes')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.repeatedTimes"
                        placeholder="1" :min="1" max="99" :disabled="booking.recurrent == 'once'" v-if="!isReading">
                    </o-input>
                    <o-input v-model="booking.repeatedTimes" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-full" :label="t('message.user')">
                    <o-input placeholder="No label" rounded v-model="booking.user" :readonly="isReading" maxlength="70"
                        :use-html5-validation="true" required>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="t('message.teacher')">
                    <o-input placeholder="No label" rounded v-model="booking.teacher" :readonly="isReading">
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="t('message.numOfPeople')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.numOfPeople"
                        placeholder="1" :min="1" v-if="!isReading">
                    </o-input>
                    <o-input v-model="booking.numOfPeople" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column" :label="t('message.purpose')" :label-position="labelPosition">
                    <o-input maxlength="200" type="textarea" v-model="booking.purpose" :readonly="isReading">
                    </o-input>
                </o-field>
            </div>
        </div>

        <div class="column is-half">

            <div class="columns is-multiline">

                <o-field class="column is-one-third-tablet" :label="t('message.wirelessMic')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.wirelessMic"
                        placeholder="0" :min="0" :max="selectedRoom.WirelessMic" v-if="!isReading"
                        :disabled="!selectedRoom.WirelessMic">
                    </o-input>
                    <o-input v-model="booking.wirelessMic" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-half-tablet" :label="t('message.microphoneStand')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.microphoneStand"
                        placeholder="0" :min="0" :max="selectedRoom.MicrophoneStand" v-if="!isReading"
                        :disabled="!selectedRoom.MicrophoneStand">
                    </o-input>
                    <o-input v-model="booking.microphoneStand" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="t('message.longTables')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.longTables"
                        placeholder="0" :min="0" :max="selectedRoom.LongTables" v-if="!isReading"
                        :disabled="!selectedRoom.LongTables">
                    </o-input>
                    <o-input v-model="booking.longTables" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="t('message.chairs')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.chairs"
                        placeholder="0" :min="0" :max="selectedRoom.Chairs" v-if="!isReading"
                        :disabled="!selectedRoom.Chairs">
                    </o-input>
                    <o-input v-model="booking.chairs" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="t('message.ChoirChairs')">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.choirChairs"
                        placeholder="0" :min="0" :max="selectedRoom.ChoirChairs" v-if="!isReading"
                        :disabled="!selectedRoom.ChoirChairs">
                    </o-input>
                    <o-input v-model="booking.choirChairs" v-if="isReading" readonly></o-input>
                </o-field>
            </div>

            <div class="columns is-multiline">

                <div class="column is-three-fifths-widescreen is-full-tablet" v-if="!isReading && locale == 'en'">
                    <o-field>
                        <o-upload v-model="dropFile" drag-drop>
                            <section class="section">
                                <div class="content has-text-centered">
                                    <p>
                                        <o-icon icon="upload" size="is-large">
                                        </o-icon>
                                    </p>
                                    <p>Drop your <b>floor plan</b> here or click to upload</p>
                                    <p>Accepted file types: png, jpeg, jpg and gif.</p>
                                </div>
                            </section>
                        </o-upload>
                    </o-field>

                    <div class="tags">
                        <span v-if="dropFile" class="tag is-primary">
                            {{ dropFile.name }}
                            <button class="delete is-small" type="button" @click="deleteDropFile(index)">
                            </button>
                        </span>
                    </div>
                </div>

                <div class="column is-three-fifths-widescreen is-full-tablet" v-if="isReading && locale == 'en'">
                    <div class="buttons">
                        <o-button label="See Floor Plan" type="is-primary" size="is-medium"
                            @click="isImageModalActive = true" :disabled="!booking.filename">
                        </o-button>
                    </div>

                    <!-- <figure class="image is-5by2">
                        <img :src="booking.preSignedURL" @click="isImageModalActive = true"
                            v-if="booking.preSignedURL" />
                        <o-skeleton height="180px" v-if="!booking.preSignedURL"></o-skeleton>
                    </figure> -->

                    <o-modal v-model:active="isImageModalActive">
                        <p class="image">
                            <img :src="booking.imageUri">
                        </p>
                    </o-modal>
                </div>

                <div class="column is-two-fifths-widescreen is-full-tablet">
                    <o-checkbox v-model="booking.equipments" native-value="notebookComputer"
                        :disabled="!selectedRoom.NotebookComputer || isReading">
                        {{ t('message.notebookComputer') }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="LCDProjectorScreen"
                        :disabled="!selectedRoom.LCDProjectorScreen || isReading">
                        {{ t('message.LCDProjectorScreen') }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="wifi"
                        :disabled="!selectedRoom.WiFi || isReading">
                        WiFi
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="visualizer"
                        :disabled="!selectedRoom.Visualizer || isReading">
                        Visualizer
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="podium"
                        :disabled="!selectedRoom.Podium || isReading">
                        Podium
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="pianoMic"
                        :disabled="!selectedRoom.pianoMic || isReading">
                        {{ t('message.pianoMic') }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="portableAmplifier"
                        :disabled="!selectedRoom.PortableAmplifier || isReading">
                        {{ t('message.portableAmplifier') }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="cameraPhotoTaking"
                        :disabled="!selectedRoom.CameraPhotoTaking || isReading">
                        Camera (Photo-taking)
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="cdPlayer"
                        :disabled="!selectedRoom.CdPlayer || isReading">
                        CD Player
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="bell"
                        :disabled="!selectedRoom.Bell || isReading">
                        Bell
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="rubbishBin"
                        :disabled="!selectedRoom.RubbishBin || isReading">
                        {{ t('message.rubbishBin') }}
                    </o-checkbox>
                </div>

            </div>

            <o-field class="is-full" :label="t('message.remarks')" :label-position="labelPosition">
                <o-input maxlength="200" type="textarea" v-model="booking.remarks"></o-input>
            </o-field>

            <div class="field" v-if="locale == 'en'">
                <div class="control">
                    <button class="button is-link" type="submit" v-if="!isReading">Submit</button>
                    <button class="button is-link is-warning" type="button" @click="withdraw"
                        v-if="isReading && booking.username == '<%= req.session.username %>'">Withdraw</button>
                    <button class="button is-link is-success" type="button" @click="changeStatus('Approved')"
                        v-if="isReading && canApprove && booking.status != 'Approved'">Approve</button>
                    <button class="button is-link is-danger" type="button" @click="changeStatus('Rejected')"
                        v-if="isReading && canApprove && booking.status != 'Rejected'">Reject</button>
                    <!-- <button class="button is-dark" type="button" @click="" v-if="isReading && canReview">Print</button> -->
                    <button class="button is-dark" @click="locale = 'zh'" v-if="isReading && canReview" v-print="printObj" >Print</button>
                </div>
            </div>

        </div>
        
        <!-- <div id="loading" v-show="printLoading"></div> -->
        
        <div class="container column is-full" v-if="locale == 'zh' && booking.imageUri">
            <img :src="booking.imageUri" />
        </div>
    </form>
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

.toast-notification {
    margin: 0.5em 0;
    text-align: center;
    box-shadow: 0 1px 4px rgb(0 0 0 / 12%), 0 0 6px rgb(0 0 0 / 4%);
    border-radius: 2em;
    padding: 0.75em 1.5em;
    pointer-events: auto;
    color: rgba(0, 0, 0, 0.7);
    background: #ffdd57;
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
