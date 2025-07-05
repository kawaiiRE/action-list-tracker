<template>
  <va-modal
    v-model="isVisible"
    title="User Profile"
    size="medium"
    :hide-default-actions="true"
  >
    <form @submit.prevent="handleSubmit">
      <div class="profile-form">
        <va-input
          v-model="form.firstName"
          label="First Name"
          :rules="[required]"
          class="mb-3"
        />

        <va-input
          v-model="form.lastName"
          label="Last Name"
          :rules="[required]"
          class="mb-3"
        />

        <va-select
          v-model="form.department"
          label="Department"
          :options="departments"
          :rules="[required]"
          class="mb-3"
        />

        <va-input
          v-model="form.title"
          label="Job Title"
          :rules="[required]"
          class="mb-3"
        />

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
