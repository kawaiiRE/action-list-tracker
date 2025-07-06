<template>
  <va-card class="request-form-card">
    <va-card-title>Create New Request</va-card-title>
    <va-card-content>
      <!-- Sender Preview -->
      <va-card class="sender-preview-card" color="info" stripe>
        <va-card-content>
          <h4 class="preview-title">Request Preview</h4>
          <p class="preview-item">
            <strong>Sender:</strong> {{ currentUserProfile?.firstName }}
            {{ currentUserProfile?.lastName }}
          </p>
          <p class="preview-item">
            <strong>From Department:</strong>
            {{ currentUserProfile?.department }}
          </p>
          <!-- <p class="preview-item">
            <strong>To Department:</strong>
            {{ form.receiverDepartment || 'Not selected' }}
          </p> -->
        </va-card-content>
      </va-card>

      <form @submit.prevent="onSubmit" class="request-form">
        <va-input
          v-model="form.title"
          label="Request Title"
          placeholder="Enter a descriptive title for your request"
          :rules="[(v) => !!v || 'Title is required']"
          required
          class="form-input"
          autocomplete="off"
          spellcheck="true"
          :tabindex="1"
        />

        <va-select
          v-model="form.receiverDepartment"
          label="Request To Department"
          :options="departments"
          placeholder="Select which department should handle this request"
          :rules="[(v) => !!v || 'Receiver department is required']"
          required
          class="form-input"
          :tabindex="2"
        />

        <va-textarea
          v-model="form.details"
          label="Request Details"
          placeholder="Provide detailed information about your request..."
          :rows="4"
          class="form-textarea"
          autocomplete="off"
          spellcheck="true"
          :tabindex="3"
        />

        <va-select
          v-model="form.status"
          label="Initial Status"
          :options="statuses"
          :rules="[(v) => !!v || 'Status is required']"
          required
          class="status-select"
          :tabindex="4"
        />

        <div class="form-actions">
          <va-button
            type="button"
            @click="resetForm"
            outline
            :disabled="loading"
          >
            Reset Form
          </va-button>

          <va-button
            type="submit"
            color="primary"
            :disabled="!isValid || loading"
            :loading="loading"
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
