<script setup>
import { ref, onMounted, watch, toRaw } from 'vue'

const props = defineProps({
    date: Date,
    room: String,
    msg: String,
})

const options = ref({
    plotOptions: {
        bar: {
            horizontal: true,
            rangeBarGroupRows: true
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            format: 'HH:mm',
        }
    },
    legend: {
        show: false
    },
    tooltip: {
        enabled: true,
        x: {
            show: true,
            format: 'HH:mm'
        },
        y: {
            show: true,
            title: {
                formatter: function (seriesName) {
                    return "";
                },
            },
        }
    },
    grid: {
        show: true,
        borderColor: "#ececec",
        strokeDashArray: 0,
        position: "back",
        xaxis: {
            lines: {
                show: true,
            },
        },
        row: {
            colors: ['#f3f4f5', '#fff'],
            opacity: 0.3
        }
    }
});

const series = ref([{
    data: []
}]);

const buildChart = () => {

    var open = props.date.getTime() + 28800000 + 25200000;   // UTC+8 and 7am
    var close = open + 39600000;    // 11 hours

    var hiddenGroup = [];

    if (props.room) {
        for (var i = 0; i < 31; i++) {
            hiddenGroup.push({ x: new Date(new Date(open).getTime() + i * 86400000).toDateString() });
        }
    } else {
        const rooms = JSON.parse(localStorage.getItem("rooms"));
        hiddenGroup = rooms.map(room => ({ x: room }))
    }

    fetchSlots(hiddenGroup, open, close);
};

const fetchSlots = async (hiddenGroup, open, close) => {

    const roomParams = props.room ? `&room=${props.room}` : "";

    var response = await fetch(`/api/timeslots?date=${props.date.toISOString()}${roomParams}`);

    if (response.ok) {

        const slots = await response.json();

        if (props.room) {

            series.value = [
                { data: hiddenGroup },
                {
                    data: slots.map(({ startTime, endTime, status, booking }) => ({
                        x: new Date(startTime).toDateString(),
                        y: [
                            new Date(startTime).getTime() + 28800000 - (new Date(startTime).getDate() - 1) * 86400000,
                            new Date(endTime).getTime() + 28800000 - (new Date(endTime).getDate() - 1) * 86400000
                        ],
                        fillColor: status == "Pending" ? '#ffcc00' : (status == "Approved" ? '#42ba96' : '#000000'),
                        booking: booking
                    }))
                }];

        } else {

            series.value = [
                { data: hiddenGroup },
                {
                    data: slots.map(({ room, startTime, endTime, status, booking }) => ({
                        x: room,
                        y: [
                            new Date(startTime).getTime() + 28800000,
                            new Date(endTime).getTime() + 28800000
                        ],  // UTC+8
                        fillColor: status == "Pending" ? '#ffcc00' : (status == "Approved" ? '#42ba96' : '#000000'),
                        booking: booking
                    }))
                }];
        }

        options.value = {
            ...options.value, ...{
                xaxis: {
                    ...options.value.xaxis, ...{
                        min: open - 288000,
                        max: close + 288000,
                    }
                }
            }
        };

    } else {
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}

// const fetchSlotsByDate = async () => {

//     var response = await fetch(`/api/timeslots?date=${props.date.toISOString()}`);

//     if (response.ok) {

//         const slots = await response.json();



//     } else {
//         var message = await response.json();
//         alert(JSON.stringify(message));
//     }

// };

// const fetchSlotsByRoom = async () => {

//     var response = await fetch(`/api/timeslots?date=${props.date.toISOString()}&room=${props.room}`);

//     if (response.ok) {

//         var slots = await response.json();



//     } else {
//         var message = await response.json();
//         alert(JSON.stringify(message));
//     }
// };

const clickHandler = (event, chartContext, config) => {

    // if (canReview.value) {

    //     var series = series.value[config.seriesIndex];

    //     if (series) {

    //         var id = series.data[config.dataPointIndex].booking;

    //         if (id) location.assign("/booking/" + id);

    //     }
    // }
};

watch(() => props.date, () => {
    buildChart();
});

watch(() => props.room, () => {
    buildChart();
});

onMounted(() => {
    buildChart()
})
</script>

<template>
    <apexchart type="rangeBar" width="1280px" height="640px" :options="options" :series="toRaw(series)"
        @click="clickHandler">
    </apexchart>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
