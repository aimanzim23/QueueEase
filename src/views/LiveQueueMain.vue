<template>
  <div
    class="card"
    :class="{ fullscreen: isFullScreen }"
    style="position: relative"
  >
    <div
      class="card-header text-center text-white"
      style="
        position: sticky;
        top: 0;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #2dce89;
      "
    >
      <h2 class="d-inline-block">QueueEase</h2>
      <i @click="toggleFullScreen" class="fas fa-expand fullscreen-icon"></i>
    </div>

    <div class="card-body">
      <div class="row">
        <div class="col-12 col-md-7">
          <div class="row">
            <div class="col-12 mb-3">
              <div class="video-container">
                <iframe
                  width="100%"
                  height="315"
                  src="https://www.youtube.com/embed/your_video_id"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <p
                class="text-center text-uppercase text-secondary custom-large-text font-weight-bolder"
              >
                {{ getFormattedDateTime() }}
              </p>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-5">
          <template v-if="ongoingQueues.length > 0">
            <div
              class="card mb-3"
              v-for="queue in ongoingQueues"
              :key="queue.queueId"
            >
              <div
                class="card-body d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5 class="card-title">{{ queue.service }}</h5>
                  <p class="card-text">{{ queue.userName }}</p>
                </div>
                <p class="card-text" style="font-size: 24px; font-weight: bold">
                  #{{ queue.queueNo }}
                </p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="card mb-3">
              <div class="card-body">
                <p class="card-text">No ongoing queues right now</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="postedAnnouncements.length > 0" class="announcement-container">
      <marquee behavior="scroll" direction="left">
        <p class="mb-0 announcement">
          <strong
            v-for="(announcement, index) in postedAnnouncements"
            :key="index"
            class="announcement-item"
          >
            {{ announcement.title }}:
            {{ announcement.content }} &nbsp;&nbsp;&nbsp;&nbsp;
          </strong>
        </p>
      </marquee>
    </div>
  </div>
</template>

<script>
import { doc, collection, onSnapshot, getDocs } from "firebase/firestore";
import { db, auth } from "@/main";

export default {
  name: "live-queue-main",
  data() {
    return {
      isFullScreen: false,
      ongoingQueues: [],
      waitingQueues: [],
      isLiveQueuesLoaded: false,
      queueData: [],
      currentAnnouncementIndex: 0,
      postedAnnouncements: [],
    };
  },
  methods: {
    toggleFullScreen() {
      const cardElement = document.querySelector(".card");
      if (cardElement.requestFullscreen) {
        cardElement.requestFullscreen();
      } else if (cardElement.mozRequestFullScreen) {
        /* Firefox */
        cardElement.mozRequestFullScreen();
      } else if (cardElement.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        cardElement.webkitRequestFullscreen();
      } else if (cardElement.msRequestFullscreen) {
        /* IE/Edge */
        cardElement.msRequestFullscreen();
      }
    },
    getFormattedDateTime() {
      return new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    },
    startAnnouncementAnimation() {
      setInterval(() => {
        this.currentAnnouncementIndex =
          (this.currentAnnouncementIndex + 1) % this.postedAnnouncements.length;
      }, 5000);
    },
    async fetchLiveQueues() {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const queuesCollectionRef = collection(userDocRef, "queues");

          onSnapshot(queuesCollectionRef, (querySnapshot) => {
            this.queueData = querySnapshot.docs.map((doc) => doc.data());
            this.ongoingQueues = this.queueData.filter(
              (queue) => queue.status === "Ongoing"
            );
            this.waitingQueues = this.queueData.filter(
              (queue) => queue.status === "Waiting"
            );
            this.isLiveQueuesLoaded = true;
          });
        }
      } catch (error) {
        console.error("Error fetching live queues:", error);
      }
    },

    async fetchAnnouncements() {
      try {
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;

          const announcementsCollectionRef = collection(
            db,
            "users",
            userId,
            "announcements"
          );
          const querySnapshot = await getDocs(announcementsCollectionRef);

          this.postedAnnouncements = querySnapshot.docs.map((doc) => {
            const announcementData = doc.data();
            return {
              id: doc.id,
              ...announcementData,
            };
          });
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    },
  },
  mounted() {
    this.fetchLiveQueues();
    this.fetchAnnouncements();
    this.startAnnouncementAnimation();
  },
};
</script>

<style scoped>
.fullscreen-icon {
  cursor: pointer;
  font-size: 1.5rem;
  transition: transform 0.3s, color 0.3s;
}

.fullscreen-icon:hover {
  color: #28a745;
  transform: scale(1.1);
}

.fullscreen-icon:active {
  transform: scale(0.9);
}
.fullscreen {
  width: 100vw;
  height: 100vh;
}

@media (min-width: 768px) {
  .fullscreen {
    display: flex;
    flex-direction: column;
  }

  .col-12 {
    width: 100%;
  }

  .col-md-5 {
    width: 50%;
  }

  .col-md-7 {
    width: 50%;
  }

  .video-container {
    width: 100%;
  }

  iframe {
    width: 100%;
    height: 400px;
  }

  .custom-large-text {
    font-size: 2rem;
  }
}
.announcement-item {
  margin-right: 1000px;
}
.live-queue-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.queue-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease-in-out;
  margin-bottom: 20px;
}

.queue-card:hover {
  transform: scale(1.05);
}

.larger-card {
  grid-row: span 2;

  background-color: lightblue;
}

.smaller-card {
  background-color: lightgreen;
}
.announcement-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
}

.moving-text {
  margin: 0;
  animation: moveAnnouncement 20s linear infinite;
}

@keyframes moveAnnouncement {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
.custom-large-text {
  font-size: 1.5rem;
}
</style>
