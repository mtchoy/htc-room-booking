<script setup>
import { ref, onMounted, watch, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { addDays, addHours, addMinutes, startOfMonth, startOfDay, formatISO9075 } from 'date-fns'

const props = defineProps({
    date: Date,
    room: String,
    msg: String,
})

const router = useRouter()
const canReview = ref(true);

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
            format: 'HH:mm'
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

const buildChart = async () => {

    // var open = props.date.getTime() + 28800000 + 25200000;   // UTC+8 and 7am
    // var open = addHours(props.date, 7); // UTC+8 and 7am

    // var close = open + 39600000;    // 11 hours

    // var open = props.date;
    var hiddenGroup = [];

    if (props.room) {
        var start = startOfMonth(props.date)
        var next = new Date(start)
        for (var i = 0; i < 31; i++) {
            hiddenGroup.push({ x: next.toDateString() });
            next = addDays(next, 1);
        }
    } else {
        var start = startOfDay(props.date)
        const rooms = JSON.parse(localStorage.getItem("rooms"));
        hiddenGroup = rooms.map(room => ({ x: room }))
    }

    await fetchSlots(formatISO9075(start, { representation: 'date' }), hiddenGroup);

    options.value = {
        ...options.value, ...{
            xaxis: {
                ...options.value.xaxis, ...{
                    min: addMinutes(addHours(start, 15), -5).getTime(),
                    max: addMinutes(addHours(start, 26), 5).getTime()
                    // addMinutes(open, -5).getTime(),
                    // max: addMinutes(close, 5).getTime()
                }
            }
        }
    };
};

const fetchSlots = async (startISOString, hiddenGroup) => {

    const roomParams = props.room ? `&room=${props.room}` : "";

    var response = await fetch(`/api/timeslots?date=${startISOString}${roomParams}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`
        }
    });

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
                            // new Date(startTime).getTime(),
                            // new Date(endTime).getTime()
                            new Date(startTime).getTime() + 28800000,
                            // addHours(startTime, 8).getTime(),
                            // addHours(endTime, 8).getTime()
                            new Date(endTime).getTime() + 28800000
                        ],  // UTC+8
                        fillColor: status == "Pending" ? '#ffcc00' : (status == "Approved" ? '#42ba96' : '#000000'),
                        booking: booking
                    }))
                }];
        }

    } else {
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}

const dataPointSelectionHandler = (event, chartContext, config) => {

    if (canReview.value) {
        router.push(`/booking/${series.value[config.seriesIndex].data[config.dataPointIndex].booking}`);
    }
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
        @dataPointSelection="dataPointSelectionHandler">
    </apexchart>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
