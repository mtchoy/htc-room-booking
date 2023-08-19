<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    isReviewer: Boolean,
    status: String,
    // msg: String,
})

const data = ref([])
const total = ref(0)
const loading = ref(false)
const sortField = ref('vote_count')
const sortOrder = ref('desc')
const defaultSortOrder = ref('desc')
const page = ref(1)
const perPage = ref(10)

const loadAsyncData = () => {
    var params = [
        // 'api_key=bb6f51bef07465653c3e553d6ab161a8',
        // 'language=en-US',
        // 'include_adult=false',
        // 'include_video=false',
        // `sort_by=${sortField.value}.${sortOrder.value}`,
        `limit=${perPage.value}`,
        `page=${page.value}`,
    ].join('&');

    if (props.isReviewer) {
        params += `&is_reviewer=${props.isReviewer}`
    }

    if (props.status) {
        params += `&status=${props.status}`
    }

    loading.value = true
    fetch(`/api/bookings?${params}`)
        .then((response) => response.json())
        .then((result) => {
            // api.themoviedb.org manage max 1000 pages
            let currentTotal = result.total
            // if (result.total_results / perPage.value > 1000) {
            //     currentTotal = perPage.value * 1000
            // }
            total.value = currentTotal;
            // data.value = result.result.map((item) => {
            //     item.release_date = item.release_date
            //         ? item.release_date.replace(/-/g, '/') : null;
            //     return item
            // });
            data.value = result.result

            // while (data.value.length < 10) {
            //     data.value.push({})
            // }

            loading.value = false
        })
        .catch((error) => {
            data.value = []
            total.value = 0
            loading.value = false
            throw error
        })
}

/*
* Handle page-change event
*/
const onPageChange = (p) => {
    page.value = p
    loadAsyncData()
}

/*
* Handle sort event
*/
const onSort = (field, order) => {
    sortField.value = field
    sortOrder.value = order
    loadAsyncData()
}

/*
* Type style in relation to the value
*/
const type = (value) => {
    const number = parseFloat(value);
    if (number < 6) {
        return 'is-danger';
    } else if (number >= 6 && number < 8) {
        return 'is-warning';
    } else if (number >= 8) {
        return 'is-success';
    }
}

onMounted(() => {
    loadAsyncData()
})
</script>

<template>
    <!-- <section> -->
    <o-table :data="data" :loading="loading" paginated backend-pagination :total="total" :per-page="perPage"
        @page-change="onPageChange" aria-next-label="Next page" aria-previous-label="Previous page" aria-page-label="Page"
        aria-current-label="Current page" backend-sorting :default-sort-direction="defaultSortOrder"
        :default-sort="[sortField, sortOrder]" @sort="onSort" height="480px">

        <o-table-column field="id" label="ID" width="40" numeric v-slot="props">
            {{ props.row._id }}
        </o-table-column>

        <o-table-column field="createdAt" label="Created At" numeric v-slot="props">
            {{ new Date(props.row.createdAt).toLocaleString("en-CA", {
                timeZone: "Asia/Hong_Kong", hour12:
                    false
            }) }}
        </o-table-column>

        <o-table-column field="username" label="Username" v-slot="props" v-if="isReviewer">
            {{ props.row.username }}
        </o-table-column>

        <o-table-column field="user" label="User/Org" v-slot="props">
            {{ props.row.user }}
        </o-table-column>

        <o-table-column field="room" label="Room" v-slot="props">
            {{ props.row.room }}
        </o-table-column>

        <o-table-column field="date" label="Date" centered v-slot="props">
            <!-- <span class="tag is-success"> -->
            {{ new Date(props.row.date).toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" }) }}
            <!-- </span> -->
        </o-table-column>

        <o-table-column field="status" label="Status" v-slot="props">
            <router-link :to="'/booking/' + props.row._id">
                <span class="tag is-warning" v-if="props.row.status == 'Pending'">
                    {{ props.row.status }}
                </span>
                <span class="tag is-danger" v-if="props.row.status == 'Rejected'">
                    {{ props.row.status }}
                </span>
                <span class="tag is-success" v-if="props.row.status == 'Approved'">
                    {{ props.row.status }}
                </span>
            </router-link>
        </o-table-column>

        <!-- <o-table-column field="original_title" label="Title" sortable #default="props">
                            {{ props.row.original_title }}
                        </o-table-column>
                        <o-table-column field="vote_average" label="Vote Average" numeric sortable #default="props">
                            <span class="tag" :class="type(props.row.vote_average)">
                                {{ props.row.vote_average }}
                            </span>
                        </o-table-column>
                        <o-table-column field="vote_count" label="Vote Count" numeric sortable #default="props">
                            {{ props.row.vote_count }}
                        </o-table-column>
                        <o-table-column field="release_date" label="Release Date" sortable centered #default="props">
                            {{
                                props.row.release_date
                                ? new Date(props.row.release_date).toLocaleDateString()
                                : 'unknown'
                            }}
                        </o-table-column>
                        <o-table-column label="Overview" width="500" #default="props">
                            {{ props.row.overview }}
                        </o-table-column> -->
    </o-table>
    <!-- </section> -->
    <!-- <div v-if="bookings.length == 0">
                                                        No Bookings
                                                    </div> -->

    <!-- </div> -->
</template>

<style scoped>
.read-the-docs {
    color: #888;
}
</style>
