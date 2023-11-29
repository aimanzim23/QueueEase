<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <queue-list />
      </div>
    </div>
    <div class="mt-4 row">
      <div class="col-12">
        <projects-table />
      </div>
    </div>
  </div>
</template>

<script>
import ProjectsTable from "./components/ProjectsTable.vue";
import QueueList from "./components/QueueList.vue";

export default {
  name: "App",
  components: {
    ProjectsTable,
    QueueList,
  },
};
</script>
