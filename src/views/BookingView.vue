<script setup>
// import HelloWorld from '../components/HelloWorld.vue'

import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import print from 'vue3-print-nb'

const vPrint = print;

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

const booking = ref({
    date: afterTwoWorkingDays,
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
const canReview = ref(true);
const canApprove = ref("<%= (!req.session.canApprove) %>" == "false");
const selectedRoom = ref({})

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

const zhRecurrent = computed(() => {

    switch (booking.value.recurrent) {
        case 'once': return "一次";
        case 'daily': return "每天";
        case 'weekly': return "每周";
    }
});

const submitForm = async function () {

    if (!validate()) return;

    var postData = booking.value;
    postData.date = new Date(postData.date).toLocaleDateString('en-CA');
    postData.startTime = new Date(postData.startTime).toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' });
    postData.endTime = new Date(postData.endTime).toLocaleTimeString('en-CA', { hour12: false, hour: '2-digit', minute: '2-digit' });

    var response = await fetch("/booking", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    });

    if (response.ok) {
        var text = await response.text();

        $oruga.notification.open({
            message: text,
            variant: 'success',
            position: 'top',
            actionText: 'OK',
            indefinite: true,
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

    var response = await fetch(`/api/bookings/oid/${id}`);

    if (response.ok) {

        const jsonData = await response.json();
        var result = jsonData.result;

        if (!isReading) {
            result.date = new Date(result.date)
            result.startTime = new Date(result.startTime)
            result.endTime = new Date(result.endTime)
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

    var response = await fetch("/booking/" + id, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(booking.value)
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

    if (!["png", "jpeg", "jpg", "gif"].includes(dropFile.name.split(".").pop().toLowerCase())) {
        dropFile.value = null;
        $buefy.snackbar.open("Only image files are allowed");
        return
    }

    const formData = new FormData();
    formData.append('avatar', dropFile.value);

    try {
        var response = await fetch("/file/upload", {
            method: "POST",
            body: formData
        });
        if (response.ok) {
            var data = await response.json();
            // var pieces = data.files[0].fd.split("/");
            // this.booking.fd = "/images/" + pieces.pop();

            booking.value.fd = data.files[0].fd;

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
    isPrinting.value = true;
    // await nextTick();

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

    // isPrinting.value = false;
};

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
        isPrinting.value = false;
        // console.log('关闭了打印工具')
    }
};

const validate = function () {
    if (!this.canApprove && !this.booking.teacher) {
        this.$buefy.snackbar.open(`No Teaching in Charge`)
        return false
    }

    if (!this.canApprove && this.booking.date < afterTwoWorkingDays) {
        this.$buefy.snackbar.open(`Need two working days for approval`)
        return false;
    }

    var now = new Date();
    var time = "07:00 AM";
    var dt = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + time;

    if (this.booking.startTime.getTime() < new Date(dt).getTime()) {
        this.$buefy.snackbar.open(`Start Time too early`)
        return false
    }

    var time = "06:00 PM";
    var dt = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " " + time;

    if (this.booking.endTime.getTime() > new Date(dt).getTime()) {
        this.$buefy.snackbar.open(`End Time too late`)
        return false
    }

    if (this.booking.endTime < this.booking.startTime) {
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
    <form id="printMe" class="container columns is-centered" @submit.prevent="submitForm">
        <div class="column is-half">
            <div class="columns is-multiline">

                <o-field class="column is-half" :label="isPrinting ? '課室' : 'Room'">
                    <o-select placeholder="Select a room" v-model="booking.room" v-if="!isReading" required>
                        <option v-for="option in rooms" :value="option" :key="option">
                            {{ option }}
                        </option>
                    </o-select>
                    <o-input v-model="selectedRoom.name" v-if="isReading && !isPrinting" readonly></o-input>
                    <o-input v-model="selectedRoom.zhname" v-if="isPrinting" readonly></o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '日期' : 'Select a date'">
                    <o-datepicker placeholder="Click to select..." :min-date="minDate" :max-date="maxDate" locale="en-CA"
                        v-model="booking.date" v-if="!isReading" editable icon="calendar-today" required>
                    </o-datepicker>
                    <o-input v-model="booking.date" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '開始時間' : 'Start time'">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="booking.startTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="booking.startTime" v-if="isReading" readonly>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '結束時間' : 'End time'">
                    <o-timepicker rounded placeholder="Click to select..." icon="clock" :enable-seconds="enableSeconds"
                        :hour-format="hourFormat" :locale="locale" :increment-minutes="minutesGranularity"
                        v-model="booking.endTime" v-if="!isReading" :min-time="minTime" :max-time="maxTime"
                        :mobile-native="false" editable required>
                    </o-timepicker>
                    <o-input v-model="booking.endTime" v-if="isReading" readonly>
                    </o-input>
                </o-field>

                <o-field :label="isPrinting ? '預留形式' : 'Recurrent'" class="column">
                    <o-radio v-model="booking.recurrent" native-value="0" v-if="!isReading">
                        <o-icon icon="calendar-today"></o-icon>
                        <span>One time</span>
                    </o-radio>

                    <o-radio v-model="booking.recurrent" native-value="1" v-if="!isReading">
                        <o-icon icon="calendar-week"></o-icon>
                        <span>Daily</span>
                    </o-radio>

                    <o-radio v-model="booking.recurrent" native-value="7" v-if="!isReading">
                        <o-icon icon="calendar-week-begin"></o-icon>
                        <span>Weekly</span>
                    </o-radio>
                    <o-input v-model="booking.recurrent" v-if="isReading && !isPrinting" readonly>
                    </o-input>
                    <o-input v-model="zhRecurrent" v-if="isPrinting" readonly>
                    </o-input>
                </o-field>

                <o-field class="column" :label="isPrinting ? '次數' : 'Number of Times'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.repeatedTimes"
                        placeholder="1" :min="1" max="99" :disabled="booking.recurrent == 'once'" v-if="!isReading">
                    </o-input>
                    <o-input v-model="booking.repeatedTimes" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-full" :label="isPrinting ? '學會/班級名稱' : 'User / Organization'">
                    <o-input placeholder="No label" rounded v-model="booking.user" :readonly="isReading" maxlength="70"
                        :use-html5-validation="true" required>
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '負責老師' : 'Teacher In Charge:'">
                    <o-input placeholder="No label" rounded v-model="booking.teacher" :readonly="isReading">
                    </o-input>
                </o-field>

                <o-field class="column is-half" :label="isPrinting ? '總共學生人數' : 'No. of People'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.numOfPeople"
                        placeholder="1" :min="1" v-if="!isReading">
                    </o-input>
                    <o-input v-model="booking.numOfPeople" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column" :label="isPrinting ? '用途' : 'Purpose'" :label-position="labelPosition">
                    <o-input maxlength="200" type="textarea" v-model="booking.purpose" :readonly="isReading">
                    </o-input>
                </o-field>
            </div>
        </div>

        <div class="column is-half">

            <div class="columns is-multiline">

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '無線咪' : 'Wireless Mic'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.wirelessMic"
                        placeholder="0" :min="0" :max="selectedRoom.WirelessMic" v-if="!isReading"
                        :disabled="!selectedRoom.WirelessMic">
                    </o-input>
                    <o-input v-model="booking.wirelessMic" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-half-tablet" :label="isPrinting ? '咪STAND' : 'Microphone Stand'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.microphoneStand"
                        placeholder="0" :min="0" :max="selectedRoom.MicrophoneStand" v-if="!isReading"
                        :disabled="!selectedRoom.MicrophoneStand">
                    </o-input>
                    <o-input v-model="booking.microphoneStand" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '長枱數量' : 'Long Tables'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.longTables"
                        placeholder="0" :min="0" :max="selectedRoom.LongTables" v-if="!isReading"
                        :disabled="!selectedRoom.LongTables">
                    </o-input>
                    <o-input v-model="booking.longTables" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '椅子數量' : 'Chairs'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.chairs"
                        placeholder="0" :min="0" :max="selectedRoom.Chairs" v-if="!isReading"
                        :disabled="!selectedRoom.Chairs">
                    </o-input>
                    <o-input v-model="booking.chairs" v-if="isReading" readonly></o-input>
                </o-field>

                <o-field class="column is-one-third-tablet" :label="isPrinting ? '合唱團椅' : 'Choir Chairs'">
                    <o-input type="number" controls-position="compact" controls-rounded v-model="booking.choirChairs"
                        placeholder="0" :min="0" :max="selectedRoom.ChoirChairs" v-if="!isReading"
                        :disabled="!selectedRoom.ChoirChairs">
                    </o-input>
                    <o-input v-model="booking.choirChairs" v-if="isReading" readonly></o-input>
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
                            @click="isImageModalActive = true" :disabled="!booking.fd">
                        </o-button>
                    </div>

                    <!-- <figure class="image is-5by2">
                                                                                                                            <img :src="booking.preSignedURL" @click="isImageModalActive = true"
                                                                                                                                v-if="booking.preSignedURL" />
                                                                                                                            <o-skeleton height="180px" v-if="!booking.preSignedURL"></o-skeleton>
                                                                                                                        </figure> -->

                    <o-modal v-model="isImageModalActive">
                        <p class="image">
                            <img :src="booking.preSignedURL">
                        </p>
                    </o-modal>
                </div>

                <div class="column is-two-fifths-widescreen is-full-tablet">
                    <o-checkbox v-model="booking.equipments" native-value="notebookComputer"
                        :disabled="!selectedRoom.NotebookComputer || isReading">
                        {{ isPrinting ? '電腦' : 'Notebook Computer' }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="LCDProjectorScreen"
                        :disabled="!selectedRoom.LCDProjectorScreen || isReading">
                        {{ isPrinting ? '投影器 及 幕' : 'LCD Projector & Screen' }}
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
                        {{ isPrinting ? '鋼琴咪' : 'Piano Mic' }}
                    </o-checkbox>
                    <o-checkbox v-model="booking.equipments" native-value="portableAmplifier"
                        :disabled="!selectedRoom.PortableAmplifier || isReading">
                        {{ isPrinting ? '擴音器' : 'Portable Amplifier ' }}
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
                        {{ isPrinting ? '垃圾桶' : 'Rubbish Bin' }}
                    </o-checkbox>
                </div>

            </div>

            <o-field class="is-full" :label="isPrinting ? '註記' : 'Remarks'" :label-position="labelPosition">
                <o-input maxlength="200" type="textarea" v-model="booking.remarks"></o-input>
            </o-field>

            <div class="field" v-if="!isPrinting">
                <div class="control">
                    <button class="button is-link" type="submit" v-if="!isReading">Submit</button>
                    <button class="button is-link is-warning" type="button" @click="withdraw"
                        v-if="isReading && booking.username == '<%= req.session.username %>'">Withdraw</button>
                    <button class="button is-link is-success" type="button" @click="changeStatus('Approved')"
                        v-if="isReading && canApprove && booking.status != 'Approved'">Approve</button>
                    <button class="button is-link is-danger" type="button" @click="changeStatus('Rejected')"
                        v-if="isReading && canApprove && booking.status != 'Rejected'">Reject</button>
                    <button class="button is-dark" type="button" @click="printpdf"
                        v-if="isReading && canReview">Print</button>
                </div>
            </div>

        </div>
    </form>

    <button @click="printpdf()" v-print="printObj">Print local range</button>
    <div id="loading" v-show="printLoading"></div>

    <div class="container" v-if="isPrinting && booking.preSignedURL">
        <img :src="booking.preSignedURL" />
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
