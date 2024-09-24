<script setup>
import { ref, onMounted, watch, toRaw, inject } from 'vue'
import { useRouter } from 'vue-router'
import { addDays, addHours, addMinutes, startOfMonth, add, differenceInDays } from 'date-fns'

const props = defineProps({
    date: String,     // Date part only
    room: String,
    msg: String,
})

const router = useRouter()
var canReview = ref(localStorage.getItem("role") == "admin" || localStorage.getItem("role") == "officer" || localStorage.getItem("role") == "teacher");

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

const rooms = inject('rooms');

const buildChart = async () => {

    const dateObj = new Date(props.date);
    var hiddenGroup = [];

    if (props.room) {
        var next = dateObj;
        for (var i = 0; i < 31; i++) {
            hiddenGroup.push({ x: next.toDateString() });
            next = addDays(next, 1);
        }
    } else {
        hiddenGroup = rooms.map(room => ({ x: room }))
        // console.log(hiddenGroup);
        hiddenGroup[12].x = "Rm214 (Band Rm)"   
    }

    await fetchSlots(props.date, hiddenGroup);

    // Set the hours to 7 AM and convert to UTC
    const sevenAmUtc = new Date(
        Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            7,
            0,
            0
        )
    );

    options.value = {
        ...options.value, ...{
            xaxis: {
                ...options.value.xaxis, ...{
                    min: addMinutes(sevenAmUtc, -5).getTime(),
                    max: addMinutes(addHours(sevenAmUtc, 11), 5).getTime()
                }
            }
        }
    };
};

const fetchSlots = async (startISOString, hiddenGroup) => {

    const roomParams = props.room ? `&room=${props.room}` : "";

    var response = await fetch(`/api/timeslots?date=${startISOString}${roomParams}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('msalToken')}`,
            'X-Custom-Authorization': `Bearer ${localStorage.getItem('msalToken')}`
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
                            add(startTime, { hours: 8 }).getTime() - differenceInDays(startTime, startOfMonth(startTime)) * 86400000,
                            add(endTime, { hours: 8 }).getTime() - differenceInDays(endTime, startOfMonth(endTime)) * 86400000,
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
                            add(startTime, { hours: 8 }).getTime(),
                            add(endTime, { hours: 8 }).getTime()
                        ],
                        fillColor: status == "Pending" ? '#ffcc00' : (status == "Approved" ? '#42ba96' : '#000000'),
                        booking: booking
                    }))
                }
            ];
        }

    } else {
        // var message = await response.json();
        // alert(JSON.stringify(message));
        // if (localStorage.getItem('msalToken') == null) {
        location.assign('/logout');
        // }
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
