<template>
  <va-modal
    v-model="isVisible"
    size="medium"
    hide-default-actions
    fixed-layout
    noOutsideDismiss
    :mobile-fullscreen="false"
  >
    <template #header>
      <div class="modal-header">
        <h4 class="modal-title">User Profile</h4>
        <va-button
          @click="$emit('close')"
          icon="close"
          preset="plain"
          class="close-button"
        />
      </div>
    </template>
    <form @submit.prevent="handleSubmit">
      <div class="profile-form">
        <div class="form-row">
          <va-input
            v-model="form.firstName"
            label="First Name"
            :rules="[required]"
            class="profile-form-input"
          />

          <va-input
            v-model="form.lastName"
            label="Last Name"
            :rules="[required]"
            class="profile-form-input"
          />
        </div>
        <div class="form-row">
          <va-select
            v-model="form.department"
            label="Department"
            :options="departments"
            :rules="[required]"
            class="profile-form-input"
          />

          <va-input
            v-model="form.title"
            label="Job Title"
            :rules="[required]"
            class="profile-form-input"
          />
        </div>

        <va-input
          v-model="form.email"
          label="Email"
          disabled
          class="email-input"
        />

        <div class="form-actions">
          <va-button
            type="button"
            @click="$emit('close')"
            color="secondary"
            class="cancel-button"
          >
            Cancel
          </va-button>
          <va-button
            type="submit"
            color="primary"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            Save
          </va-button>
        </div>
      </div>
    </form>
  </va-modal>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
