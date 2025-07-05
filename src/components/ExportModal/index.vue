<template>
  <va-modal
    v-model="isVisible"
    title="Export Requests to Excel"
    size="medium"
    max-width="600px"
    hide-default-actions
    fixed-layout
    noOutsideDismiss
  >
    <template #header>
      <div class="modal-header">
        <h4 class="modal-title">Export Requests to Excel</h4>
        <div class="header-actions">
          <va-button
            @click="isVisible = false"
            icon="close"
            preset="plain"
            class="close-button"
          />
        </div>
      </div>
    </template>
    <div class="export-modal-content">
      <p class="export-description">
        Select the fields you want to include in the Excel export:
      </p>

      <div class="export-fields">
        <h5 class="fields-title">Select and reorder export fields:</h5>
        <draggable
          v-model="sortedExportFields"
          item-key="key"
          class="draggable-fields"
          handle=".drag-handle"
          :animation="150"
          ghost-class="ghost"
          chosen-class="chosen"
          drag-class="drag"
        >
          <template #item="{ element }">
            <div class="export-field-item">
              <div class="drag-handle">
                <va-icon name="drag_indicator" />
              </div>
              <va-checkbox
                v-model="element.selected"
                :label="element.label"
                class="export-field-checkbox"
              />
            </div>
          </template>
        </draggable>
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
        <va-checkbox
          v-model="useDateRange"
          label="Filter by Date Range"
          class="export-option-checkbox"
        />
      </div>

      <div v-if="useDateRange" class="date-range-options">
        <h5 class="date-range-title">Date Range Filter</h5>
        <div class="date-range-inputs">
          <va-date-input
            v-model="dateFrom"
            label="From Date"
            class="date-input"
            clearable
          />
          <va-date-input
            v-model="dateTo"
            label="To Date"
            class="date-input"
            clearable
          />
        </div>
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
