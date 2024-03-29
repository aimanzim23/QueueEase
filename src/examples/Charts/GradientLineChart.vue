<template>
  <div class="card">
    <div class="pb-0 card-header mb-0">
      <h6>{{ title }}</h6>
    </div>
    <div class="p-3 card-body">
      <div class="chart">
        <canvas
          id="totalServiceTimeChart"
          class="chart-canvas"
          height="300"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "ServiceTimeGraph",

  props: {
    title: {
      type: String,
      default: "Total Service Time Daily",
    },
  },

  data() {
    return {
      chartData: {
        labels: [],
        values: [],
      },
    };
  },

  async created() {
    try {
      await this.$store.dispatch("fetchArchivedQueues");
      this.processDataForChart();
    } catch (error) {
      console.error("Error fetching archived queues:", error);
    }
  },

  watch: {
    formattedArchivedQueues: "processDataForChart",
  },

  methods: {
    processDataForChart() {
      const archivedQueues = this.$store.getters.getArchivedQueues;

      // Flatten the object into an array of queues
      const allQueues = Object.values(archivedQueues).reduce(
        (acc, queue) => acc.concat(queue),
        []
      );

      const groupedQueues = allQueues.reduce((acc, queue) => {
        const dateKey = this.formatDate(new Date(queue.date), "MM/DD");
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            day: this.getDayOfWeek(queue.date),
            queues: [],
            totalServiceTime: 0,
            cancelledVisits: 0,
            totalVisits: 0,
          };
        }
        acc[dateKey].queues.push(queue);
        acc[dateKey].totalVisits += 1;
        if (queue.status === "Completed") {
          acc[dateKey].totalServiceTime += (queue.serviceTime || 0) / 60 / 1000;
        } else if (queue.status === "Cancelled") {
          acc[dateKey].cancelledVisits += 1;
        }
        return acc;
      }, {});

      const sortedDateKeys = Object.keys(groupedQueues).sort().slice(-8);

      this.chartData.labels = sortedDateKeys.map((dateKey) =>
        this.formatDate(new Date(groupedQueues[dateKey].date), "MM/DD")
      );

      this.chartData.values = sortedDateKeys.map(
        (dateKey) => +groupedQueues[dateKey].totalServiceTime.toFixed(2)
      );

      this.renderChart();
    },

    renderChart() {
      const ctx = document
        .getElementById("totalServiceTimeChart")
        .getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(1, "rgba(94, 114, 228, 0.2)");
      gradient.addColorStop(0.2, "rgba(94, 114, 228, 0.0)");
      gradient.addColorStop(0, "rgba(94, 114, 228, 0)");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: "Total Service Time (minutes)",
              tension: 0.4,
              borderWidth: 3,
              fill: true,
              borderColor: "#4BB543",
              backgroundColor: gradient,
              data: this.chartData.values,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const dateIndex = context.dataIndex;
                  const date = this.chartData.labels[dateIndex];
                  const totalServiceTime = this.chartData.values[dateIndex];
                  return `Date: ${date}, Total Service Time (minutes): ${totalServiceTime.toFixed(
                    2
                  )}`;
                },
              },
            },
          },
          scales: {
            y: {
              grid: {
                drawBorder: false,
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                padding: 10,
                color: "#fbfbfb",
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
            x: {
              grid: {
                drawBorder: false,
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [5, 5],
              },
              ticks: {
                display: true,
                color: "#ccc",
                padding: 20,
                font: {
                  size: 11,
                  family: "Open Sans",
                  style: "normal",
                  lineHeight: 2,
                },
              },
            },
          },
        },
      });
    },

    getDayOfWeek(date) {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayIndex = new Date(date).getDay();
      return daysOfWeek[dayIndex];
    },

    formatDate(date, format) {
      const options = {
        month: format.includes("MM") ? "2-digit" : undefined,
        day: format.includes("DD") ? "2-digit" : undefined,
        year: format.includes("YYYY") ? "numeric" : undefined,
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    },
  },
};
</script>
