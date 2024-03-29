<template>
  <div class="card">
    <div class="p-3 pb-0 card-header">
      <h6 class="mb-0">Announcements</h6>
    </div>
    <div class="p-3 card-body">
      <ul v-if="displayedAnnouncements.length > 0" class="list-group">
        <li
          v-for="(announcement, index) in displayedAnnouncements"
          :key="index"
          class="mb-2 border-0 list-group-item d-flex justify-content-between border-radius-lg"
        >
          <div class="d-flex align-items-center">
            <div
              class="text-center shadow icon icon-shape icon-sm bg-gradient-dark me-3"
            >
              <i class="ni ni-mobile-button text-white opacity-10"></i>
            </div>
            <div class="d-flex flex-column">
              <h6 class="mb-1 text-sm text-dark">{{ announcement.title }}</h6>
              <span class="text-xs">{{ announcement.content }}</span>
            </div>
          </div>
          <div class="d-flex">
            <a href="/announcement">
              <button
                class="my-auto btn btn-link btn-icon-only btn-rounded btn-sm text-dark icon-move-right"
              >
                <i class="ni ni-bold-right" aria-hidden="true"></i>
              </button>
            </a>
          </div>
        </li>
      </ul>
      <p v-else class="text-center">
        No announcements available.
        <a href="/announcement">Go to announcement page</a> to publish
        announcement.
      </p>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc } from "firebase/firestore";
import { db, auth } from "@/main";

export default {
  name: "announcement-card",
  data() {
    return {
      postedAnnouncements: [],
    };
  },
  computed: {
    displayedAnnouncements() {
      return this.postedAnnouncements.slice(0, 4);
    },
  },

  async created() {
    await this.fetchAnnouncements();
  },
  methods: {
    async fetchAnnouncements() {
      try {
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const announcementsCollectionRef = collection(
            userDocRef,
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
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    },
  },
};
</script>
