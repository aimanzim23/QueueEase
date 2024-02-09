<template>
  <div>
    <button
      type="button"
      class="btn btn-primary btn-lg mx-2 mt-3"
      style="background-color: primary"
      @click="createQueue"
      :disabled="loading"
    >
      Create QR Code
    </button>

    <div v-if="showQRCode" class="card p-4" style="width: 600px; height: 600px">
      <div class="d-flex flex-column align-items-center">
        <!-- Center Section -->
        <div style="text-align: center; margin-top: 20px">
          <!-- QR Code Section -->
          <div class="card-icons">
            <div v-if="qrCodeLoading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <button class="btn btn-secondary mx-2" @click="copyLink">
                <i class="fas fa-copy"></i> Copy Link
              </button>
              <button class="btn btn-secondary mx-2" @click="printLink">
                <i class="fas fa-print"></i> Print
              </button>

              <!-- Display QR code if available -->
              <qr-code
                :text="qrCodeData"
                :size="qrCodeSize"
                color="#000"
                bg-color="#FFF"
                error-level="H"
              ></qr-code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/main";

export default {
  name: "QRCode",
  data() {
    return {
      showQRCode: false,
      qrCodeData: "",
      qrCodeSize: 350,
      loading: false,
      qrCodeLoading: false,
    };
  },
  methods: {
    async createQueue() {
      try {
        this.loading = true; // Set loading to true when the button is clicked

        const user = auth.currentUser;

        if (user) {
          const queueId = uuidv4();
          const userData = {
            userId: user.uid,
            queueId: queueId,
          };

          await this.$store.dispatch("saveUserData", userData);

          // Simulate a delay for the QR code loading
          this.qrCodeLoading = true;
          setTimeout(() => {
            const joinLink = `http://localhost:8080/join/${user.uid}/${queueId}`;
            console.log("Join Link:", joinLink);

            this.qrCodeData = joinLink;
            this.showQRCode = true;
            this.qrCodeLoading = false;
          }, 1000);
        } else {
          console.error("User not authenticated.");
        }
      } catch (error) {
        console.error("Error creating queue:", error);
      } finally {
        // Set loading to false after 1 second
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      }
    },
    copyLink() {
      try {
        navigator.clipboard
          .writeText(this.qrCodeData)
          .then(() => {
            alert("Link copied to clipboard!");
          })
          .catch((error) => {
            console.error("Error copying link:", error);
            alert("Error copying link. Please try again.");
          });
      } catch (error) {
        console.error("Clipboard API not supported:", error);
        // Fallback for browsers that do not support the Clipboard API
        const tempInput = document.createElement("textarea");
        tempInput.value = this.qrCodeData;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("Link copied to clipboard!");
      }
    },

    printLink() {
      // Implement print link logic if needed
    },
  },
};
</script>

<style scoped>
.qr-code-container {
  text-align: center;
  margin-top: 20px;
}
</style>
