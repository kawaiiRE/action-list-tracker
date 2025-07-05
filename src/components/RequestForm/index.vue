<template>
  <va-card class="request-form-card">
    <va-card-title>Request Details</va-card-title>
    <va-card-content>
      <form @submit.prevent="onSubmit" class="request-form">
        <div class="form-grid">
          <va-select
            v-model="form.department"
            label="Department"
            :options="departments"
            placeholder="Select department"
            :rules="[(v) => !!v || 'Department is required']"
            required
          />
        </div>

        <va-input
          v-model="form.title"
          label="Request Title"
          placeholder="Enter a descriptive title"
          :rules="[(v) => !!v || 'Title is required']"
          required
          class="full-width"
        />

        <va-textarea
          v-model="form.details"
          label="Request Details"
          placeholder="Provide detailed information about your request..."
          :rows="4"
          class="full-width"
        />

        <va-select
          v-model="form.status"
          label="Initial Status"
          :options="statuses"
          :rules="[(v) => !!v || 'Status is required']"
          required
          class="status-select"
        />

        <div class="form-actions">
          <va-button
            type="button"
            @click="resetForm"
            outline
            :disabled="isSubmitting"
          >
            Reset Form
          </va-button>

          <va-button
            type="submit"
            color="primary"
            :disabled="!isValid || isSubmitting"
            :loading="isSubmitting"
          >
            Create Request
          </va-button>
        </div>
      </form>
    </va-card-content>
  </va-card>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
