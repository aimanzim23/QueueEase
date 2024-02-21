<template>
  <div v-if="showSidenav">
    <div
      class="collapse navbar-collapse w-auto h-auto h-100"
      id="sidenav-collapse-main"
    >
      <ul class="navbar-nav">
        <li class="nav-item">
          <sidenav-item
            url="/dashboard-default"
            :class="getRoute() === 'dashboard-default' ? 'active' : ''"
            :navText="'Dashboard'"
          >
            <template v-slot:icon>
              <i class="fas fa-chart-line text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            url="/monitorqueue"
            :class="getRoute() === 'monitor queue' ? 'active' : ''"
            :navText="'Monitor Queue'"
          >
            <template v-slot:icon>
              <i class="ni ni-tv-2 text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            url="/live-queue-main"
            :class="getRoute() === 'live-queue-main' ? 'active' : ''"
            :navText="'Live Queue'"
          >
            <template v-slot:icon>
              <i class="fas fa-users text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item
            url="/tables"
            :class="getRoute() === 'tables' ? 'active' : ''"
            :navText="'Queue History'"
          >
            <template v-slot:icon>
              <i
                class="ni ni-calendar-grid-58 text-dark text-sm opacity-10"
              ></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item url="/qr" navText="QR Code">
            <template v-slot:icon>
              <i
                class="fas fa-qrcode text-dark text-sm opacity-10"
                style="color: black; font-size: 1rem; opacity: 0.5"
              ></i>
            </template>
          </sidenav-item>
        </li>
        <li class="nav-item">
          <sidenav-item url="/announcement" navText="Announcement">
            <template v-slot:icon>
              <i
                class="fab fa-font-awesome-flag text-dark text-sm opacity-10"
              ></i>
            </template>
          </sidenav-item>
        </li>

        <li class="nav-item">
          <sidenav-item
            url="/profile"
            :class="getRoute() === 'profile' ? 'active' : ''"
            :navText="'Profile'"
          >
            <template v-slot:icon>
              <i class="ni ni-single-02 text-dark text-sm opacity-10"></i>
            </template>
          </sidenav-item>
        </li>
      </ul>
    </div>
  </div>

  <div v-else>
    <div
      class="collapse navbar-collapse w-auto h-auto h-100"
      id="sidenav-collapse-main"
    >
      <ul class="navbar-nav">
        <li class="mt-3 nav-item">
          <h6
            class="text-xs ps-4 text-uppercase font-weight-bolder opacity-6"
            :class="this.$store.state.isRTL ? 'me-4' : 'ms-2'"
          >
            VISITOR
          </h6>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import SidenavItem from "./SidenavItem.vue";

export default {
  name: "SidenavList",
  props: {
    cardBg: String,
  },
  data() {
    return {
      title: "QueueEase",
      controls: "dashboardsExamples",
      isActive: "active",
    };
  },
  components: {
    SidenavItem,
  },
  methods: {
    getRoute() {
      const routeArr = this.$route.path.split("/");
      return routeArr[1];
    },
  },
  computed: {
    showSidenav() {
      const currentRoute = this.$route;

      return currentRoute.meta && currentRoute.meta.authRequired;
    },
  },
};
</script>
