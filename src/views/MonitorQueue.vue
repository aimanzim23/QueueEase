<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <queue-list />
      </div>
    </div>
  </div>
</template>

<script>
import QueueList from "./components/QueueList.vue";

export default {
  name: "App",
  components: {
    QueueList,
  },
};
</script>
