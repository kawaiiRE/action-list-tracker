<template>
  <va-modal
    v-model="isVisible"
    title="Edit Request"
    size="large"
    hide-default-actions
    fixed-layout
    noOutsideDismiss
  >
    <template #header>
      <div class="modal-header">
        <h4 class="modal-title">Edit Request</h4>
        <va-button
          @click="closeModal"
          icon="close"
          preset="plain"
          class="close-button"
        />
      </div>
    </template>

    <div v-if="request">
      <va-card>
        <va-card-content>
          <form @submit.prevent="saveChanges" class="request-form">
            <va-input
              v-model="editForm.title"
              label="Request Title"
              :rules="[required]"
              class="form-input"
            />

            <va-select
              v-model="editForm.receiverDepartment"
              label="Receiver Department"
              :options="departments"
              :rules="[required]"
              class="form-input"
            />

            <va-textarea
              v-model="editForm.details"
              label="Request Details"
              :rows="4"
              class="form-textarea"
            />

            <!-- <va-select
              v-model="editForm.status"
              label="Status"
              :options="statusOptions"
              :rules="[required]"
              class="form-select"
            /> -->

            <div class="form-actions">
              <va-button
                @click="closeModal"
                color="secondary"
                class="cancel-button"
              >
                Cancel
              </va-button>
              <va-button
                type="submit"
                color="primary"
                :loading="saving"
                :disabled="!isFormValid"
              >
                Save Changes
              </va-button>
            </div>
          </form>
        </va-card-content>
      </va-card>
    </div>
  </va-modal>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
