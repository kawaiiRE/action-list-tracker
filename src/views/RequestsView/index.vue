<template>
  <va-page>
    <div class="requests-container">
      <div class="page-header">
        <h1>All Requests</h1>
        <va-button 
          @click="goToAddRequest" 
          color="primary" 
          icon="add"
          class="add-button"
        >
          Add New Request
        </va-button>
      </div>

      <!-- Filters Section -->
      <va-card class="filters-card">
        <va-card-title>Filters & Search</va-card-title>
        <va-card-content>
          <div class="filters-grid">
            <div class="filter-group">
              <label>Search</label>
              <va-input
                v-model="search"
                placeholder="Search by title, details, or creator..."
                clearable
                icon="search"
              />
            </div>

            <div class="filter-group">
              <label>Status</label>
              <va-select
                v-model="filterStatus"
                :options="statuses"
                placeholder="Filter by status"
                clearable
              />
            </div>

            <div class="filter-group">
              <label>Department</label>
              <va-select
                v-model="filterDept"
                :options="departments"
                placeholder="Filter by department"
                clearable
              />
            </div>

            <div class="filter-group">
              <label>Creator</label>
              <va-select
                v-model="filterCreator"
                :options="uniqueCreators"
                placeholder="Filter by creator"
                clearable
              />
            </div>

            <div class="filter-group">
              <label>Sort By</label>
              <va-select
                v-model="sortBy"
                :options="[
                  { text: 'Created Date', value: 'createdAt' },
                  { text: 'Title', value: 'title' },
                  { text: 'Status', value: 'status' },
                  { text: 'Creator', value: 'creator' }
                ]"
                text-by="text"
                value-by="value"
              />
            </div>

            <div class="filter-group">
              <label>Order</label>
              <va-select
                v-model="sortOrder"
                :options="[
                  { text: 'Descending', value: 'desc' },
                  { text: 'Ascending', value: 'asc' }
                ]"
                text-by="text"
                value-by="value"
              />
            </div>
          </div>
          
          <div class="filter-actions">
            <va-button @click="clearFilters" outline>
              Clear All Filters
            </va-button>
            <span class="results-count">
              Showing {{ filtered.length }} of {{ allRequests.length }} requests
            </span>
          </div>
        </va-card-content>
      </va-card>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <va-progress-circle indeterminate />
        <p>Loading requests...</p>
      </div>

      <!-- Requests List -->
      <div v-else-if="filtered.length > 0">
        <request-list
          :requests="filtered"
          @comment="onAddComment"
        />
      </div>

      <!-- Empty State -->
      <va-card v-else class="empty-state">
        <va-card-content>
          <va-icon name="inbox" size="large" class="empty-icon" />
          <h3>No requests found</h3>
          <p v-if="search || filterStatus || filterDept || filterCreator">
            Try adjusting your filters or search terms.
          </p>
          <p v-else>
            No requests have been created yet. Be the first to add one!
          </p>
          <va-button @click="goToAddRequest" color="primary">
            Create First Request
          </va-button>
        </va-card-content>
      </va-card>
    </div>
  </va-page>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss" scoped></style>
