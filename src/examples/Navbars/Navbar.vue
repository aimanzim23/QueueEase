<template>
  <nav
    class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
    :class="
      this.$store.state.isRTL ? 'top-0 position-sticky z-index-sticky' : ''
    "
    v-bind="$attrs"
    id="navbarBlur"
    data-scroll="true"
  >
    <div class="px-3 py-1 container-fluid">
      <breadcrumbs :currentPage="currentRouteName" textWhite="text-white" />

      <div
        class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4"
        :class="this.$store.state.isRTL ? 'px-0' : 'me-sm-4'"
        id="navbar"
      >
        <div
          class="pe-md-3 d-flex align-items-center"
          :class="this.$store.state.isRTL ? 'me-md-auto' : 'ms-md-auto'"
        ></div>

        <ul v-if="shouldShowNavbar" class="navbar-nav justify-content-end">
          <li v-if="user" class="nav-item d-flex align-items-center">
            <span class="text-white">Logged in as {{ userEmail }}</span>
          </li>
          <li class="nav-item d-flex align-items-center">
            <router-link
              v-if="!user"
              :to="{ name: 'Signin' }"
              class="px-0 nav-link font-weight-bold text-white"
              target="_blank"
            >
              <i
                class="fa fa-user"
                :class="this.$store.state.isRTL ? 'ms-sm-2' : 'me-sm-2'"
              ></i>
              <span class="d-sm-inline d-none">Sign In</span>
            </router-link>
          </li>

          <li class="nav-item ps-3 d-flex align-items-center">
            <a
              href="#"
              @click="toggleSidebar"
              class="p-0 nav-link text-white"
              id="iconNavbarSidenav"
            >
              <div class="sidenav-toggler-inner">
                <i class="sidenav-toggler-line bg-white"></i>
                <i class="sidenav-toggler-line bg-white"></i>
                <i class="sidenav-toggler-line bg-white"></i>
              </div>
            </a>
          </li>
          <li class="px-3 nav-item d-flex align-items-center">
            <a class="p-0 nav-link text-white" @click="toggleConfigurator">
              <i class="cursor-pointer fa fa-cog fixed-plugin-button-nav"></i>
            </a>
          </li>

          <li class="px-2 nav-item d-flex align-items-center">
            <a class="p-0 nav-link text-white" @click="handleClick">
              <i class="cursor-pointer fa fa-sign-out-alt"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import Breadcrumbs from "../Breadcrumbs.vue";
import { mapMutations, mapActions } from "vuex";
import "firebase/auth";
import { useStore } from "vuex";
import { computed } from "vue";

export default {
  name: "navbar",
  data() {
    return {
      showMenu: false,
    };
  },
  props: ["minNav", "textWhite"],
  created() {
    this.minNav;
  },
  setup() {
    const store = useStore();
    const handleClick = () => {
      store.dispatch("logout");
    };
    const user = computed(() => store.getters.getUser);
    const userEmail = computed(() => (user.value ? user.value.email : null));
    return {
      handleClick,
      user,
      userEmail,
    };
  },
  methods: {
    ...mapMutations(["navbarMinimize", "toggleConfigurator"]),
    ...mapActions(["toggleSidebarColor"]),

    toggleSidebar() {
      this.toggleSidebarColor("bg-white");
      this.navbarMinimize();
    },
  },
  components: {
    Breadcrumbs,
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    shouldShowNavbar() {
      const isJoinRoute =
        this.$route.name === "Join Queue" &&
        this.$route.params.userId &&
        this.$route.params.queueId;
      const isQueueTicketRoute =
        this.$route.name === "QueueTicket" &&
        this.$route.params.userId &&
        this.$route.params.queueId;

      const isThankYouRoute = this.$route.name === "Thank You";

      // Show the navbar if the route is not "Join Queue" or "QueueTicket" with parameters
      return !(isJoinRoute || isQueueTicketRoute || isThankYouRoute);
    },
  },
};
</script>
