<!-- QueueCard.vue -->
<template>
  <div class="mb-4 card">
    <div class="p-3 card-body">
      <div class="d-flex">
        <div>
          <div class="numbers">
            <p class="mb-0 text-sm text-uppercase font-weight-bold">
              {{ label }}
            </p>
            <h5 class="font-weight-bolder">
              {{ value }}
            </h5>
            <span class="text-sm">{{ serviceLabel }}</span>
            {{ serviceName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "live-queue-card",
  props: {
    label: String,
    value: String,
    serviceLabel: String,
    serviceName: String,
  },
};
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>
