<template>
  <!-- Button trigger modal -->
  <button
    type="button"
    class="btn btn-primary"
    data-bs-toggle="modal"
    data-bs-target="#exampleModalCenter"
    style="margin-left: 10px"
  >
    Add Queue
  </button>
  <button
    type="button"
    class="btn btn-primary"
    style="margin-left: 10px; background-color: orange"
  >
    Call Next
  </button>

  <!-- Bootstrap Modal Structure -->
  <div
    class="modal fade"
    id="exampleModalCenter"
    tabindex="-1"
    aria-labelledby="addForm"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addForm">Add Users To Queue</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <!-- Vue.js Form -->
          <form>
            <div class="mb-3">
              <label for="userName" class="form-label">User Name</label>
              <input
                type="text"
                class="form-control"
                placeholder="Enter user name"
              />
            </div>
            <div class="mb-3">
              <label for="phoneNumber" class="form-label">Phone Number</label>
              <input
                type="text"
                class="form-control"
                placeholder="Enter phone number"
              />
            </div>
            <div class="mb-3">
              <label for="notes" class="form-label">Notes</label>
              <textarea
                class="form-control"
                rows="3"
                placeholder="Enter notes"
              ></textarea>
            </div>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
            >
              Add
            </button>
          </form>
          <!-- End of Vue.js Form -->
        </div>
      </div>
    </div>
  </div>
</template>
