<template>
  <va-modal
    v-model="isVisible"
    title="User Profile"
    size="medium"
    :hide-default-actions="true"
  >
    <form @submit.prevent="handleSubmit">
      <div class="profile-form">
        <div class="row">
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
        <div class="row">
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

        <va-input v-model="form.email" label="Email" disabled class="mb-3" />

        <div class="form-actions">
          <va-button
            type="button"
            @click="$emit('close')"
            color="secondary"
            class="mr-3"
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
