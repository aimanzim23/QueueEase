<template>
  <div class="card p-4 m-4">
    <div class="mb-3">
      <h4>Create an Announcement</h4>
    </div>

    <!-- Posting Form -->
    <form @submit.prevent="postAnnouncement">
      <div class="mb-3">
        <label for="announcementTitle" class="form-label">Title</label>
        <input
          type="text"
          id="announcementTitle"
          class="form-control"
          v-model="postTitle"
        />
      </div>

      <div class="mb-3">
        <label for="announcementContent" class="form-label">Content</label>
        <textarea
          id="announcementContent"
          class="form-control"
          v-model="postContent"
          rows="3"
          placeholder="What's on your mind?"
        ></textarea>
      </div>

      <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary">Post</button>
      </div>
    </form>

    <div class="mt-4">
      <h5>Posted Announcements</h5>

      <!-- Check if there are no announcements -->
      <div v-if="postedAnnouncements.length === 0">
        No announcements. Publish one now!
      </div>

      <!-- Loop through announcements if there are any -->
      <div
        v-else
        v-for="(announcement, index) in postedAnnouncements"
        :key="index"
        class="mb-3 border border-top-0 border-end-0 border-bottom border-start-0"
      >
        <!-- Announcement details -->
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <strong>{{ announcement.title }}</strong>
          </div>
          <div class="d-flex">
            <i
              class="fas fa-trash text-danger me-2"
              @click="deleteAnnouncement(index, announcement.id)"
              style="cursor: pointer"
            ></i>
            <i
              class="fas fa-edit text-primary"
              @click="editAnnouncement(announcement.id)"
              style="cursor: pointer"
            ></i>
          </div>
        </div>
        <p>{{ announcement.content }}</p>
        <span class="text-muted">{{ announcement.timestamp }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/main";

export default {
  data() {
    return {
      postTitle: "",
      postContent: "",
      postedAnnouncements: [],
      editingAnnouncementId: null,
    };
  },
  methods: {
    async postAnnouncement() {
      try {
        const user = auth.currentUser;

        if (
          user &&
          this.postTitle.trim() !== "" &&
          this.postContent.trim() !== ""
        ) {
          const userId = user.uid;
          const timestamp = Date.now();
          const formattedTimestamp = this.formatTimestamp(timestamp);

          const announcementData = {
            title: this.postTitle.trim(),
            content: this.postContent.trim(),
            timestamp: formattedTimestamp,
          };

          const announcementsCollectionRef = collection(
            db,
            "users",
            userId,
            "announcements"
          );

          if (this.editingAnnouncementId) {
            const announcementRef = doc(
              db,
              "users",
              userId,
              "announcements",
              this.editingAnnouncementId
            );

            await updateDoc(announcementRef, announcementData);

            // Update the local state to reflect the changes
            const editedIndex = this.postedAnnouncements.findIndex(
              (ann) => ann.id === this.editingAnnouncementId
            );

            if (editedIndex !== -1) {
              this.postedAnnouncements[editedIndex] = {
                id: this.editingAnnouncementId,
                ...announcementData,
              };
            }
          } else {
            // If not editing, add a new announcement
            const addedDoc = await addDoc(
              announcementsCollectionRef,
              announcementData
            );

            // Update the local state to reflect the addition
            this.postedAnnouncements.unshift({
              id: addedDoc.id,
              ...announcementData,
            });
          }

          this.postTitle = "";
          this.postContent = "";
          this.editingAnnouncementId = null;
        }
      } catch (error) {
        console.error("Error posting/editing announcement:", error);
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
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
    async deleteAnnouncement(index, announcementId) {
      try {
        if (announcementId) {
          const user = auth.currentUser;
          const userId = user.uid;

          const announcementRef = doc(
            db,
            "users",
            userId,
            "announcements",
            announcementId
          );

          await deleteDoc(announcementRef);
          this.postedAnnouncements.splice(index, 1);
        } else {
          console.error(
            "Error deleting announcement: announcementId is undefined"
          );
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    },
    editAnnouncement(announcementId) {
      const announcement = this.postedAnnouncements.find(
        (ann) => ann.id === announcementId
      );

      if (announcement) {
        this.postTitle = announcement.title;
        this.postContent = announcement.content;
        this.editingAnnouncementId = announcementId;
      }
    },
  },
  mounted() {
    this.fetchAnnouncements();
  },
};
</script>
