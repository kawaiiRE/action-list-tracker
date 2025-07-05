<template>
  <va-modal
    v-model="isVisible"
    title="Export Requests to Excel"
    size="medium"
    max-width="600px"
  >
    <div class="export-modal-content">
      <p class="export-description">
        Select the fields you want to include in the Excel export:
      </p>

      <div class="export-fields">
        <va-checkbox
          v-for="field in exportFields"
          :key="field.key"
          v-model="field.selected"
          :label="field.label"
          class="export-field-checkbox"
        />
      </div>

      <div class="export-options">
        <va-checkbox
          v-model="includeComments"
          label="Include Comments"
          class="export-option-checkbox"
        />
        <va-checkbox
          v-model="applyCurrentFilters"
          label="Apply Current Filters"
          class="export-option-checkbox"
        />
      </div>
    </div>

    <template #footer>
      <va-button @click="closeModal" preset="secondary" class="cancel-button">
        Cancel
      </va-button>
      <va-button
        @click="exportToExcel"
        color="primary"
        :loading="exportLoading"
        :disabled="!hasSelectedFields"
      >
        Export Excel
      </va-button>
    </template>
  </va-modal>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
