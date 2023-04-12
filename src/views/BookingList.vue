<script setup>
import { ref, computed, onMounted } from 'vue'

defineProps({
    msg: String,
})

const isMine = ref(false)
const radioButton = ref("All")
const numOfRecords = ref(0)
const currentPageNumber = ref(1)
const limit = ref(12)
const offset = ref(0)
const bookings = ref([])
const columns = ref([
    {
        field: 'id',
        label: 'ID',
        width: '40',
        numeric: true
    },
    {
        field: 'startTime',
        label: 'Start Time',
    },
    {
        field: 'endTime',
        label: 'End Time',
    },
    {
        field: 'date',
        label: 'Date',
        centered: true
    },
    {
        field: 'status',
        label: 'Status',
    }
])

const isFirstPage = computed(() => (offset.value < limit.value))
const isLastPage = computed(() => (offset.value + limit.value >= numOfRecords.value))

const fetchBookings = async (offset) => {

    if (isMine.value) {
        var response = await fetch("/booking/listMine?status=" + radioButton.value + "&offset=" + offset);
    } else {
        var response = await fetch("/booking/listAll?status=" + radioButton.value + "&offset=" + offset);
    }

    if (response.ok) {

        var data = await response.json();

        bookings.value = data.bookings;
        numOfRecords.value = data.numOfRecords;

        currentPageNumber.value = Math.floor(offset / limit.value) + 1;
        offset.value = offset;

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }
}


const submitForm = async () => {

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

        alert(text);

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }

}

const prevPage = () => {
    if (offset.value >= limit.value) {
        fetchBookings(offset.value - limit.value);
    }
}

const nextPage = () => {
    if (offset.value + limit.value < numOfRecords.value) {
        fetchBookings(offset.value + limit.value);
    }
}

const goToPage = (pageNumber) => {
    fetchBookings((pageNumber - 1) * limit.value);
}

const changeRadioButton = (value) => {
    radioButton.value = value;
    fetchBookings(0);
}

const changeIsMine = (value) => {
    isMine.value = value;
    fetchBookings(0);
}

const changeStatus = async (id, status) => {

    var response = await fetch("/booking/changeStatus", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            id: id,
            status: status
        })
    });

    if (response.ok) {
        var text = await response.text();

        alert(text);

    } else {
        // alert(response.statusText);
        var message = await response.json();
        alert(JSON.stringify(message));
    }

}

const changeStatusToCancelled = (id) => {
    changeStatus(id, "Cancelled");
}

const changeStatusToCompleted = (id) => {
    changeStatus(id, "Completed");
}

const changeStatusToPending = (id) => {
    changeStatus(id, "Pending");
}

const changeStatusToConfirmed = (id) => {
    changeStatus(id, "Confirmed");
}

const changeStatusToRejected = (id) => {
    changeStatus(id, "Rejected");
}

const changeStatusToCancelledByAdmin = (id) => {
    changeStatus(id, "CancelledByAdmin");
}

const changeStatusToCancelledByUser = (id) => {
    changeStatus(id, "CancelledByUser");
}

const changeStatusToCompletedByAdmin = (id) => {
    changeStatus(id, "CompletedByAdmin");
}

const changeStatusToCompletedByUser = (id) => {
    changeStatus(id, "CompletedByUser");
}

const changeStatusToPendingByAdmin = (id) => {
    changeStatus(id, "PendingByAdmin");
}

const changeStatusToPendingByUser = (id) => {
    changeStatus(id, "PendingByUser");
}

const changeStatusToConfirmedByAdmin = (id) => {
    changeStatus(id, "ConfirmedByAdmin");
}

const changeStatusToConfirmedByUser = (id) => {
    changeStatus(id, "ConfirmedByUser");
}

const changeStatusToRejectedByAdmin = (id) => {
    changeStatus(id, "RejectedByAdmin");
}

const changeStatusToRejectedByUser = (id) => {
    changeStatus(id, "RejectedByUser");
}

const filter = () => {
    fetchBookings(0);
}

const changeLimit = (value) => {
    limit.value = value;
    fetchBookings(0);
}

const changeOffset = (value) => {
    offset.value = value;
    fetchBookings(0);
}

onMounted(function () {
    fetchBookings(0);
});
</script>

<template>
    <div v-cloak>
        <section class="section">
            <div class="container columns is-centered">
                <b-field>
                    <b-tag class="is-info" size="is-medium">
                        {{ isMine ? "My Bookings" : "Review Bookings" }}
                    </b-tag>
                </b-field>
                &nbsp;
                <b-field>
                    <b-radio-button v-model="radioButton" native-value="All" type="is-primary is-light is-outlined"
                        @input="filter()">
                        <!-- <b-icon icon="close"></b-icon> -->
                        <span>All</span>
                    </b-radio-button>

                    <b-radio-button v-model="radioButton" native-value="Pending" type="is-warning is-light is-outlined"
                        @input="filter()">
                        <b-icon icon="account-clock"></b-icon>
                        <span>Pending</span>
                    </b-radio-button>

                    <b-radio-button v-model="radioButton" native-value="Approved" type="is-success is-light is-outlined"
                        @input="filter(0)">
                        <b-icon icon="check-decagram"></b-icon>
                        <span>Approved</span>
                    </b-radio-button>

                    <b-radio-button v-model="radioButton" native-value="Rejected" type="is-danger is-light is-outlined"
                        @input="filter(0)">
                        <b-icon icon="close-circle"></b-icon>
                        <span>Rejected</span>
                    </b-radio-button>
                </b-field>
            </div>

            <br>

            <div class="container columns is-centered">

                <b-table :data="bookings" striped="striped" :hoverable="hoverable" v-if="bookings.length > 0">

                    <b-table-column field="id" label="ID" width="40" numeric v-slot="props">
                        {{ props.row.id }}
                    </b-table-column>

                    <b-table-column field="createdAt" label="Created At" numeric v-slot="props">
                        {{ new Date(props.row.createdAt).toLocaleString("en-CA", {
                            timeZone: "Asia/Hong_Kong", hour12:
                                false
                        }) }}
                    </b-table-column>

                    <b-table-column field="username" label="Username" v-slot="props" v-if="!isMine">
                        {{ props.row.username }}
                    </b-table-column>

                    <b-table-column field="user" label="User/Org" v-slot="props">
                        {{ props.row.user }}
                    </b-table-column>

                    <b-table-column field="room" label="Room" v-slot="props">
                        {{ props.row.room }}
                    </b-table-column>

                    <b-table-column field="date" label="Date" centered v-slot="props">
                        <!-- <span class="tag is-success"> -->
                        {{ new Date(props.row.date).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" }) }}
                        <!-- </span> -->
                    </b-table-column>

                    <b-table-column field="status" label="Status" v-slot="props">
                        <a :href="/booking/ + props.row.id">
                            <span class="tag is-warning" v-if="props.row.status == 'Pending'">
                                {{ props.row.status }}
                            </span>
                            <span class="tag is-danger" v-if="props.row.status == 'Rejected'">
                                {{ props.row.status }}
                            </span>
                            <span class="tag is-success" v-if="props.row.status == 'Approved'">
                                {{ props.row.status }}
                            </span>
                        </a>
                    </b-table-column>

                </b-table>

                <div v-if="bookings.length == 0">
                    No Bookings
                </div>

            </div>
            <br>

            <div class="container columns is-centered">

                <b-pagination :total="numOfRecords" v-model="currentPageNumber" range-before="1" range-after="1"
                    :order="order" :size="size" :simple="isSimple" :rounded="isRounded" :per-page="limit"
                    :icon-prev="prevIcon" :icon-next="nextIcon" aria-next-label="Next page"
                    aria-previous-label="Previous page" aria-page-label="Page" aria-current-label="Current page"
                    @change="fetchBookings((currentPageNumber - 1) * limit)">
                </b-pagination>

            </div>

        </section>

    </div>
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
