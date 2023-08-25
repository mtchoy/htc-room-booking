<script setup>
import { ref, computed, watch } from 'vue'
import { useMsal } from '../composition-api/useMsal';
import brandImage from '../assets/Holy-Trinity-College-logo-vector-01.svg'

defineProps({
    msg: String,
})

// const count = ref(0)

const { accounts } = useMsal();

watch(accounts, (accounts) => {
    if (accounts.value.length > 0) {
        // localStorage.setItem('msalAccount', JSON.stringify(accounts[0]));
        name.value = accounts.value[0].name;
    }
});

const name = computed(() => {
    if (accounts.value.length > 0) {
        const name = accounts.value[0].name;
        if (name) {
            return name.split(" ")[0];
        }
    }
    return "";
});

const navbarOptions = {
    elementId: "main-navbar",
    isUsingVueRouter: true,
    mobileBreakpoint: 992,
    brandImagePath: "./",
    brandImage,
    brandImageAltText: "HTC Room Booking System",
    collapseButtonOpenColor: "#661c23",
    collapseButtonCloseColor: "#661c23",
    showBrandImageInMobilePopup: true,
    ariaLabelMainNav: "Main Navigation",
    tooltipAnimationType: "shift-away",
    tooltipPlacement: "bottom",
    menuOptionsLeft: [
        // {
        //     type: "link",
        //     text: "Why Dunder Mifflin",
        //     arrowColor: "#659CC8",
        //     subMenuOptions: [
        //         {
        //             isLinkAction: true,
        //             type: "link",
        //             text: "About",
        //             subText: "Stupid corporate wet blankets. Like booze ever killed anyone.",
        //             path: { name: "booking-lists" },
        //             iconLeft: '<i class="fa fa-star fa-fw"></i>'
        //         },
        //         {
        //             type: "hr",
        //         },
        //         {
        //             type: "link",
        //             text: "Locations",
        //             subText: "You\'re a presentation tool!",
        //             path: { name: "locations" },
        //           arrowColor: "#659CC8",
        //         },
        //         {
        //             type: "hr",
        //         },
        //         {
        //             type: "link",
        //             text: "Blog",
        //             subText: "I enjoy having breakfast in bed. I like waking up to the smell of bacon. Sue me.",
        //             path: { name: "blog" }
        //         },
        //     ]
        // },
        // {
        //     type: "link",
        //     text: "Contact",
        //     subMenuOptions: [
        //         {
        //             type: "link",
        //             text: "Customer Service",
        //             path: { name: "customer-service" },
        //         },
        //         {
        //             type: "link",
        //             text: "Accounting",
        //             path: { name: "accounting" },
        //         },
        //         {
        //             type: "hr",
        //         },
        //         {
        //             type: "link",
        //             text: "Reception",
        //             path: { name: "reception" },
        //             iconLeft: '<svg id="i-telephone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"> <path d="M3 12 C3 5 10 5 16 5 22 5 29 5 29 12 29 20 22 11 22 11 L10 11 C10 11 3 20 3 12 Z M11 14 C11 14 6 19 6 28 L26 28 C26 19 21 14 21 14 L11 14 Z" /> <circle cx="16" cy="21" r="4" /> </svg>',
        //         },
        //     ]
        // },
        {
            type: "button",
            text: "New Booking",
            path: { name: "new-booking" },
            iconRight: '<i class="fa fa-long-arrow-right fa-fw"></i>',
        },
        {
            type: "button",
            text: "Bookings",
            path: { name: "booking-list" },
            iconRight: '<i class="fa fa-long-arrow-right fa-fw"></i>',
        },
        {
            type: "button",
            text: "Search by Date",
            // path: { name: "chart-view", params: { mode: 1 } },
            path: '/chart-view/1',
            iconRight: '<i class="fa fa-long-arrow-right fa-fw"></i>',
        },
        {
            isLinkAction: true,
            type: "button",
            text: "Search by Room",
            // path: { name: "chart-view", params: { mode: 1 } },
            path: '/chart-view/2',
            iconRight: '<i class="fa fa-long-arrow-right fa-fw"></i>',
        },
        // {
        //     isLinkAction: true,
        //     type: "link",
        //     text: "Equipment",
        //     path: { name: "equipment-view"},
        //     // path: '/chart-view/2',
        //     iconRight: '<i class="fa fa-long-arrow-right fa-fw"></i>',
        // },
    ],
    menuOptionsRight: [
        // {
        //     type: "button",
        //     text: "Signup",
        //     path: { name: "home" },
        //     class: "button-red"
        // },
        {
            type: 'hr'
        },
        {
            type: "link",
            text: name.value,
            path: { name: "home" },
            iconRight: '<svg id="i-arrow-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"> <path d="M22 6 L30 16 22 26 M30 16 L2 16" /> </svg>'
        }
    ]
}
</script>

<template>
    <vue-navigation-bar :options="navbarOptions" style="background-color: lightgray;" v-if="name"/>
    <!-- <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <a class="navbar-item" href="https://bulma.io">
                <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
            </a>

            <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">
                <a class="navbar-item">
                    Booking
                </a>

                <a class="navbar-item">
                    Documentation
                </a>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        More
                    </a>

                    <div class="navbar-dropdown">
                        <a class="navbar-item">
                            About
                        </a>
                        <a class="navbar-item">
                            Jobs
                        </a>
                        <a class="navbar-item">
                            Contact
                        </a>
                        <hr class="navbar-divider">
                        <a class="navbar-item">
                            Report an issue
                        </a>
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item">
                    <div class="buttons">
                        <SignOutButton v-if="isAuthenticated" />
                        <SignInButton v-else />
                    </div>
                </div>
            </div>
        </div>
    </nav> -->
</template>

<style scoped>
.read-the-docs {
    color: #888;
}

.vnb .button-red {
    background: #ff3b30;
}

.vnb .button-red:hover {
    background: #fc0d00;
}
</style>
