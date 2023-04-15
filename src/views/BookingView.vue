<script setup>
// import HelloWorld from '../components/HelloWorld.vue'

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const today = new Date();

function nextWorkingDay(date) {
    date.setDate(date.getDate() + +"1111132"[date.getDay()]);
}

var afterTwoWorkingDays = new Date(new Date().setHours(0, 0, 0, 0));
nextWorkingDay(afterTwoWorkingDays);
nextWorkingDay(afterTwoWorkingDays);
nextWorkingDay(afterTwoWorkingDays);

const min = new Date();
min.setHours(7);
min.setMinutes(0);
const max = new Date();
max.setHours(18);
max.setMinutes(0);

const route = useRoute()
const id = route.params.id;

const bookingInfo = ref({
    date: afterTwoWorkingDays,
    equipments: [],
    recurrent: "once",
    repeatedTimes: 1,
    wirelessMic: 0,
    microphoneStand: 0,
    longTables: 0,
    chairs: 0,
    choirChairs: 0
});

const rooms = ref(JSON.parse(localStorage.getItem("rooms") || []));
const date = ref(new Date(new Date().setHours(0, 0, 0, 0)));
const minDate = ref(afterTwoWorkingDays);
const maxDate = ref(new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()));
const minTime = ref(min);
const maxTime = ref(max);
const hourFormat = ref("24"); // Browser locale
const enableSeconds = ref(false);
const locale = ref(undefined); // Browser locale
const minutesGranularity = ref(5);

const labelPosition = ref("0");
const dropFile = ref(null);
const isImageModalActive = ref(false);


// const isReading = ref("<%= action %>" == "read");
const isReading = ref(id ? true : false);
const isPrinting = ref(false);
const canBook = ref("<%= (!req.session.canBook) %>" == "false");
const canReview = ref("<%= (!req.session.canReview) %>" == "false");
const canApprove = ref("<%= (!req.session.canApprove) %>" == "false");
const selectedRoom = ref({})

watch(() => bookingInfo.value.room, async () => {

    if (!isReading.value) {
        bookingInfo.value.wirelessMic = 0;
        bookingInfo.value.microphoneStand = 0;
        bookingInfo.value.longTables = 0;
        bookingInfo.value.chairs = 0;
        bookingInfo.value.choirChairs = 0;
        bookingInfo.value.equipments = []
    }

    var response = await fetch(`/api/rooms/${bookingInfo.value.room}`);

    if (response.ok) {

        selectedRoom.value = await response.json();
        // alert(selectedRoom)
    } else {
        var message = await response.json();
        alert(JSON.stringify(message));
    }
});

const zhRecurrent = computed(() => {

    switch (bookingInfo.value.recurrent) {
        case 'once': return "一次";
        case 'daily': return "每天";
        case 'weekly': return "每周";
    }
});

const submitForm = async function () {

    if (!validate()) return;

    var response = await fetch("/booking/create", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(bookingInfo.value)
    });

    if (response.ok) {
        var text = await response.text();

        $buefy.snackbar.open({
            message: 'Application submitted successfully.',
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
        var message = await response.json();
        // alert(JSON.stringify(message));
    }
}

const fetchThisBooking = async function () {

    var response = await fetch(`/api/bookings/oid/${id}`);

    if (response.ok) {

        const jsonData = await response.json();
        var result = jsonData.result;

        result.dateString = new Date(result.date).toLocaleDateString('en-CA');
        result.startTimeString = new Date(result.startTime).toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' });
        result.endTimeString = new Date(result.endTime).toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' });

        bookingInfo.value = result;

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}

const changeStatus = async function (newStatus) {

    bookingInfo.value.status = newStatus;

    var response = await fetch("/booking/" + id, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(bookingInfo.value)
    });

    if (response.ok) {

        $buefy.snackbar.open(`OK`)

    } else {
        alert(response.statusText);
        // var message = await response.json();
        // alert(JSON.stringify(message));
    }

}

const fileChanged = async function () {

    if (!["png", "jpeg", "jpg", "gif"].includes(this.dropFile.name.split(".").pop().toLowerCase())) {
        this.dropFile = null;
        this.$buefy.snackbar.open("Only image files are allowed");
        return
    }

    const formData = new FormData();
    formData.append('avatar', this.dropFile);

    try {
        var response = await fetch("/file/upload", {
            method: "POST",
            body: formData
        });
        if (response.ok) {
            var data = await response.json();
            // var pieces = data.files[0].fd.split("/");
            // this.bookingInfo.fd = "/images/" + pieces.pop();

            this.bookingInfo.fd = data.files[0].fd;

        } else {
            console.log(response.status);
        }
    } catch (error) {
        console.log(error);
    }
}

const withdraw = function () {

    this.$buefy.dialog.confirm({
        message: 'Are you sure to withdraw this booking?',
        onConfirm: async () => {

            var response = await fetch("/booking/" + id, {
                method: 'delete'
            });

            if (response.ok) {

                this.$buefy.snackbar.open({
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

const printpdf = async function () {
    this.isPrinting = true;
    await this.$nextTick();

    printJS({
        printable: 'app', type: 'html', scanStyles: true,
        css: ["https://unpkg.com/buefy/dist/buefy.min.css",
            "https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css"],
        // style: ".o-checkbox.checkbox input[type=checkbox]:checked+.check:before { content: '✔️';}",
        style: "* { color-adjust: exact; -webkit-print-color-adjust: exact; }",
        documentTitle: "Room Booking System #" + id
    });

    this.isPrinting = false;
};

const validate = function () {
    if (!this.canApprove && !this.bookingInfo.teacher) {
        this.$buefy.snackbar.open(`No Teaching in Charge`)
        return false
    }

    if (!this.canApprove && this.bookingInfo.date < afterTwoWorkingDays) {
        this.$buefy.snackbar.open(`Need two working days for approval`)
        return false;
    }

    var now = new Date();
    var time = "07:00 AM";
    var dt = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + time;

    if (this.bookingInfo.startTime.getTime() < new Date(dt).getTime()) {
        this.$buefy.snackbar.open(`Start Time too early`)
        return false
    }

    var time = "06:00 PM";
    var dt = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + time;

    if (this.bookingInfo.endTime.getTime() > new Date(dt).getTime()) {
        this.$buefy.snackbar.open(`End Time too late`)
        return false
    }

    if (this.bookingInfo.endTime < this.bookingInfo.startTime) {
        this.$buefy.snackbar.open(`End Time before Start Time.`)
        return false
    }

    return true;
}

onMounted(() => {
    if (isReading.value) {
        fetchThisBooking();
    }
});
</script>

<template>
    <form class="container columns is-centered" @submit.prevent="submitForm">
        <div class="column is-half">
            <div class="columns is-multiline">

                <o-field class="column is-half" :label="isPrinting ? '課室' : 'Room'">
                    <o-select placeholder="Select a room" v-model="bookingInfo.room" v-if="!isReading" required>
                        <option v-for="option in rooms" :value="option" :key="option">
                            {{ option }}
                        </option>
                    </o-select>
                    <o-input v-model="selectedRoom.name" v-if="isReading && !isPrinting" readonly></o-input>
                    <o-input v-model="selectedRoom.zhname" v-if="isPrinting" readonly></o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '日期' : 'Select a date'">
                    <o-datepicker placeholder="Click to select..." :min-date="minDate" :max-date="maxDate" locale="en-CA"
                        v-model="bookingInfo.date" v-if="!isReading" editable icon="calendar-today" required>
                    </o-datepicker>
                    <o-input v-model="bookingInfo.dateString" v-if="isReading" readonly></o-input>
                </o-field>



                <o-field class="column is-half" :label="isPrinting ? '開始時間' : 'Start time'">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="bookingInfo.startTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="bookingInfo.startTimeString" v-if="isReading" readonly>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '結束時間' : 'End time'">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="bookingInfo.endTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="bookingInfo.endTimeString" v-if="isReading" readonly>
                    </o-input>
                </o-field>


                <o-field :label="isPrinting ? '預留形式' : 'Recurrent'" class="column">
                    <o-radio v-model="bookingInfo.recurrent" native-value="once" v-if="!isReading">
                        <o-icon icon="calendar-today"></o-icon>
                        <span>One time</span>
                    </o-radio>

                    <o-radio v-model="bookingInfo.recurrent" native-value="daily" v-if="!isReading">
                        <o-icon icon="calendar-week"></o-icon>
                        <span>Daily</span>
                    </o-radio>

                    <o-radio v-model="bookingInfo.recurrent" native-value="weekly" v-if="!isReading">
                        <o-icon icon="calendar-week-begin"></o-icon>
                        <span>Weekly</span>
                    </o-radio>
                    <o-input v-model="bookingInfo.recurrent" v-if="isReading && !isPrinting" readonly>
                    </o-input>
                    <o-input v-model="zhRecurrent" v-if="isPrinting" readonly>
                    </o-input>
                </o-field>


                <o-field class="column" :label="isPrinting ? '次數' : 'Number of Times'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.repeatedTimes"
                        placeholder="1" :min="1" max="99" :disabled="bookingInfo.recurrent == 'once'" v-if="!isReading">
                    </o-input>
                    <o-input v-model="bookingInfo.repeatedTimes" v-if="isReading" readonly></o-input>
                </o-field>


                <o-field class="column is-full" :label="isPrinting ? '學會/班級名稱' : 'User / Organization'">
                    <o-input placeholder="No label" rounded v-model="bookingInfo.user" :readonly="isReading" maxlength="70"
                        :use-html5-validation="true" required>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '負責老師' : 'Teacher In Charge:'">
                    <o-input placeholder="No label" rounded v-model="bookingInfo.teacher" :readonly="isReading">
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '總共學生人數' : 'No. of People'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.numOfPeople"
                        placeholder="1" :min="1" v-if="!isReading">
                    </o-input>
                    <o-input v-model="bookingInfo.numOfPeople" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column" :label="isPrinting ? '用途' : 'Purpose'" :label-position="labelPosition">
                    <o-input maxlength="200" type="textarea" v-model="bookingInfo.purpose" :readonly="isReading">
                    </o-input>
                </o-field>
            </div>
        </div>

        <div class="column is-half">

            <div class="columns is-multiline">

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '無線咪' : 'Wireless Mic'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.wirelessMic"
                        placeholder="0" :min="0" :max="selectedRoom.WirelessMic" v-if="!isReading"
                        :disabled="!selectedRoom.WirelessMic">
                    </o-input>
                    <o-input v-model="bookingInfo.wirelessMic" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-half-tablet" :label="isPrinting ? '咪STAND' : 'Microphone Stand'">
                    <o-input type="number" controls-position="compact" controls-rounded
                        v-model="bookingInfo.microphoneStand" placeholder="0" :min="0" :max="selectedRoom.MicrophoneStand"
                        v-if="!isReading" :disabled="!selectedRoom.MicrophoneStand">
                    </o-input>
                    <o-input v-model="bookingInfo.microphoneStand" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '長枱數量' : 'Long Tables'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.longTables"
                        placeholder="0" :min="0" :max="selectedRoom.LongTables" v-if="!isReading"
                        :disabled="!selectedRoom.LongTables">
                    </o-input>
                    <o-input v-model="bookingInfo.longTables" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '椅子數量' : 'Chairs'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.chairs"
                        placeholder="0" :min="0" :max="selectedRoom.Chairs" v-if="!isReading"
                        :disabled="!selectedRoom.Chairs">
                    </o-input>
                    <o-input v-model="bookingInfo.chairs" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '合唱團椅' : 'Choir Chairs'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="bookingInfo.choirChairs"
                        placeholder="0" :min="0" :max="selectedRoom.ChoirChairs" v-if="!isReading"
                        :disabled="!selectedRoom.ChoirChairs">
                    </o-input>
                    <o-input v-model="bookingInfo.choirChairs" v-if="isReading" readonly></o-input>
                </o-field>
            </div>

            <div class="columns is-multiline">

                <div class="column is-three-fifths-widescreen is-full-tablet" v-if="!isReading && !isPrinting">
                    <o-field>
                        <o-upload v-model="dropFile" drag-drop @input="fileChanged">
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

                <div class="column is-three-fifths-widescreen is-full-tablet" v-if="isReading && !isPrinting">
                    <div class="buttons">
                        <o-button label="See Floor Plan" type="is-primary" size="is-medium"
                            @click="isImageModalActive = true" :disabled="!bookingInfo.fd">
                        </o-button>
                    </div>

                    <!-- <figure class="image is-5by2">
                                                                                    <img :src="bookingInfo.preSignedURL" @click="isImageModalActive = true"
                                                                                        v-if="bookingInfo.preSignedURL" />
                                                                                    <o-skeleton height="180px" v-if="!bookingInfo.preSignedURL"></o-skeleton>
                                                                                </figure> -->

                    <o-modal v-model="isImageModalActive">
                        <p class="image">
                            <img :src="bookingInfo.preSignedURL">
                        </p>
                    </o-modal>
                </div>

                <div class="column is-two-fifths-widescreen is-full-tablet">
                    <o-checkbox v-model="bookingInfo.equipments" native-value="notebookComputer"
                        :disabled="!selectedRoom.NotebookComputer || isReading">
                        {{ isPrinting ? '電腦' : 'Notebook Computer' }}
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="LCDProjectorScreen"
                        :disabled="!selectedRoom.LCDProjectorScreen || isReading">
                        {{ isPrinting ? '投影器 及 幕' : 'LCD Projector & Screen' }}
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="wifi"
                        :disabled="!selectedRoom.WiFi || isReading">
                        WiFi
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="visualizer"
                        :disabled="!selectedRoom.Visualizer || isReading">
                        Visualizer
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="podium"
                        :disabled="!selectedRoom.Podium || isReading">
                        Podium
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="pianoMic"
                        :disabled="!selectedRoom.pianoMic || isReading">
                        {{ isPrinting ? '鋼琴咪' : 'Piano Mic' }}
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="portableAmplifier"
                        :disabled="!selectedRoom.PortableAmplifier || isReading">
                        {{ isPrinting ? '擴音器' : 'Portable Amplifier ' }}
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="cameraPhotoTaking"
                        :disabled="!selectedRoom.CameraPhotoTaking || isReading">
                        Camera (Photo-taking)
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="cdPlayer"
                        :disabled="!selectedRoom.CdPlayer || isReading">
                        CD Player
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="bell"
                        :disabled="!selectedRoom.Bell || isReading">
                        Bell
                    </o-checkbox>
                    <o-checkbox v-model="bookingInfo.equipments" native-value="rubbishBin"
                        :disabled="!selectedRoom.RubbishBin || isReading">
                        {{ isPrinting ? '垃圾桶' : 'Rubbish Bin' }}
                    </o-checkbox>
                </div>

            </div>

            <o-field class="is-full" :label="isPrinting ? '註記' : 'Remarks'" :label-position="labelPosition">
                <o-input maxlength="200" type="textarea" v-model="bookingInfo.remarks"></o-input>
            </o-field>

            <div class="field" v-if="!isPrinting">
                <div class="control">
                    <button class="button is-link" type="submit" v-if="!isReading">Submit</button>
                    <button class="button is-link is-warning" type="button" @click="withdraw"
                        v-if="isReading && bookingInfo.username == '<%= req.session.username %>'">Withdraw</button>
                    <button class="button is-link is-success" type="button" @click="changeStatus('Approved')"
                        v-if="isReading && canApprove && bookingInfo.status != 'Approved'">Approve</button>
                    <button class="button is-link is-danger" type="button" @click="changeStatus('Rejected')"
                        v-if="isReading && canApprove && bookingInfo.status != 'Rejected'">Reject</button>
                    <button class="button is-dark" type="button" @click="printpdf"
                        v-if="isReading && canReview">Print</button>
                </div>
            </div>

        </div>
    </form>

    <div class="container" v-if="isPrinting && bookingInfo.preSignedURL">
        <img :src="bookingInfo.preSignedURL" />
    </div>
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
