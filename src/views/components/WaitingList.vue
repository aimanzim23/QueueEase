<template>
  <div class="card">
    <div class="p-3 pb-0 card-header">
      <h6 class="mb-0">Waiting List</h6>
    </div>
    <div class="p-3 card-body">
      <tr v-for="(queue, index) in queues" :key="index">
        <td class="mb-0 text-sm">#{{ queue.queueNo }}</td>
        <td>
          <h6 class="mb-0 text-sm">{{ queue.userName }}</h6>
          <p class="text-xs text-secondary mb-0">
            {{ queue.phoneNumber }}
          </p>
        </td>

        <td class="mb-0 text-sm">{{ queue.service }}</td>
        <td class="mb-0 text-sm">
          {{ formattedArrivalTime(queue.date) }}
        </td>
      </tr>
    </div>
  </div>
</template>

<script>
export default {
  name: "waiting-list",
  props: {
    cardTitle: {
      type: String,
      default: "Categories",
    },
    title: {
      type: String,
      default: "Devices",
    },
    title2: {
      type: String,
      default: "Tickets",
    },
    title3: {
      type: String,
      default: "Error logs",
    },
    title4: {
      type: String,
      default: "Happy Users",
    },
    titleDesc: {
      type: String,
      default: "250 in stock",
    },
    titleDesc2: {
      type: String,
      default: "346+ sold",
    },
    title2Desc: {
      type: String,
      default: "123 closed",
    },
    title4Desc: {
      type: String,
      default: "+ 430",
    },
    title2Desc2: {
      type: String,
      default: "15 open",
    },
    title3Desc: {
      type: String,
      default: "1 is active",
    },
    title3Desc2: {
      type: String,
      default: "40 closed",
    },
  },
};
</script>
