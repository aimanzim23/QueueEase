<template>
  <div>
    <div>{{ formatElapsedTime(elapsedTime) }}</div>
  </div>
</template>

<script>
export default {
  name: "timer",
  props: {
    startTimer: {
      type: Function,
      required: true,
    },
    stopTimer: {
      type: Function,
      required: true,
    },
    elapsedTime: {
      type: Number,
      required: true,
    },
  },

  methods: {
    formatElapsedTime(milliseconds) {
      let seconds = Math.floor(milliseconds / 1000);
      let hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      let minutes = Math.floor(seconds / 60);
      seconds %= 60;

      const formattedHours = String(hours).padStart(2, "0");
      const formattedMinutes = String(minutes).padStart(2, "0");
      const formattedSeconds = String(seconds).padStart(2, "0");

      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    },
  },
};
</script>
