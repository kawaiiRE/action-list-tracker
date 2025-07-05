<template>
  <!-- Show loading state while checking authentication -->
  <div v-if="authLoading" class="loading-container">
    <div class="loading-content">
      <va-icon name="autorenew" spin size="large" color="primary" />
      <p class="loading-text">Loading...</p>
    </div>
  </div>

  <!-- Show login view if user is not authenticated or session expired -->
  <LoginView
    v-else-if="!isAuthenticated"
    @login-success="handleLoginSuccess"
    :session-expired="sessionExpired"
  />

  <!-- Main app content when authenticated -->
  <div class="body" v-else>
    <va-navbar color="primary" class="main-navbar">
      <template #left>
        <va-navbar-item>
          <img
            src="@/assets/1730296212_1713508690_Bawabat Alsenaya 5.webp"
            alt="Logo"
            class="logo"
          />
          <h2>AZAD Properties : BAS - Project Integration</h2>
        </va-navbar-item>
      </template>
      <template #right>
        <div class="navbar-right">
          <UserAvatar
            :user-profile="currentUserProfile"
            @edit-profile="openProfileModal"
            @logout="handleLogout"
          />
        </div>
      </template>
    </va-navbar>

    <va-container class="main-content">
      <!-- Home Page Selection Boxes -->
      <div v-if="currentView === 'home'" class="home-page">
        <!-- <h2 class="dashboard-title">
          AZAD Properties : BAS - Project Integration Dashboard
        </h2> -->
        <div class="action-boxes">
          <va-card
            v-for="[key, box] in Object.entries(availableActions).filter(
              ([_, box]) => box.enabled,
            )"
            :key="key"
            @click="selectAction(key)"
            class="action-box"
            :class="{ disabled: !box.enabled }"
            hover
          >
            <va-card-content class="action-box-content">
              <va-icon
                :name="box.icon"
                size="3rem"
                :color="box.enabled ? box.color : 'secondary'"
                class="action-icon"
              />
              <h4 class="action-title">{{ box.title }}</h4>
              <p class="action-description">{{ box.description }}</p>
              <va-button
                v-if="box.enabled"
                :color="box.color"
                size="small"
                class="action-button"
              >
                {{ box.buttonText }}
              </va-button>
              <va-chip
                v-else
                color="secondary"
                size="small"
                class="no-access-chip"
              >
                No Access
              </va-chip>
            </va-card-content>
          </va-card>
        </div>
      </div>

      <!-- Requests View -->
      <div v-if="currentView === 'requests'">
        <div class="requests-header">
          <va-button
            @click="goHome"
            icon="arrow_back"
            preset="plain"
            class="back-button"
          >
            Back to Home
          </va-button>
          <h3 class="requests-title">Action Requests</h3>
          <va-button
            @click="openExportModal"
            icon="download"
            color="primary"
            preset="secondary"
          >
            Export Excel
          </va-button>
        </div>
        <div class="filters-container">
          <!-- Search Bar -->
          <va-input
            v-model="filters.search"
            label="Search Requests"
            placeholder="Search by title, details, sender, or department..."
            prepend-icon="search"
            clearable
            class="search-input"
          >
            <template #appendInner>
              <VaIcon name="search" color="secondary" />
            </template>
          </va-input>

          <!-- Main Filters -->
          <div class="filters-section">
            <div class="main-filters">
              <va-select
                v-model="filters.status"
                :options="['All', 'Open', 'In-Progress', 'Closed']"
                label="Status"
                class="filter-select"
              />
              <va-select
                v-model="filters.senderDepartment"
                :options="senderDepartmentOptions"
                label="Sent From"
                class="filter-select"
              />
              <va-select
                v-model="filters.receiverDepartment"
                :options="receiverDepartmentOptions"
                label="Sent To"
                class="filter-select"
              />
            </div>

            <!-- Advanced Filters (collapsed by default) -->
            <va-collapse v-model="showAdvancedFilters">
              <template #header>
                <va-button
                  @click="showAdvancedFilters = !showAdvancedFilters"
                  preset="plain"
                  icon="tune"
                  size="small"
                >
                  {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
                </va-button>
              </template>

              <div class="advanced-filters">
                <va-date-input
                  v-model="filters.dateFrom"
                  label="From Date"
                  class="filter-select"
                  clearable
                />
                <va-date-input
                  v-model="filters.dateTo"
                  label="To Date"
                  class="filter-select"
                  clearable
                />
              </div>
            </va-collapse>
          </div>
        </div>

        <RequestList
          :requests="filteredRequests"
          :can-comment="canComment"
          :can-delete="canDelete"
          :can-delete-all="canDeleteAll"
          :is-view-only="isViewOnly"
          :current-user-id="currentUserProfile?.uid"
          @comment="handleComment"
          @view-request="showRequestDetails"
          @delete-request="confirmDeleteRequestFromList"
        />
      </div>

      <!-- Add Request View -->
      <div v-if="currentView === 'add-request'">
        <div class="add-request-header">
          <va-button
            @click="goHome"
            icon="arrow_back"
            preset="plain"
            class="back-button"
          >
            Back to Home
          </va-button>
          <h3>Add New Request</h3>
        </div>
        <RequestForm @submit="handleNewRequest" />
      </div>

      <!-- Request Details Modal -->
      <RequestDetailsModal
        v-model="showRequestDetailsModal"
        :request="selectedRequest"
        :comments="selectedRequestComments"
        :is-view-only="isViewOnly"
        :can-comment="canComment"
        :can-delete="canDelete"
        :can-delete-all="canDeleteAll"
        :current-user-id="currentUserProfile?.uid"
        @comment-added="handleCommentAdded"
        @comment-deleted="handleCommentDeleted"
        @request-updated="handleRequestUpdated"
        @request-deleted="handleRequestDeleted"
        @edit-request="handleEditRequest"
        @reload-data="loadRequests"
      />

      <!-- Export Modal -->
      <ExportModal
        v-model="showExportModal"
        :requests="requests"
        :current-filters="filters"
      />

      <!-- Edit Request Modal -->
      <EditRequestModal
        v-model="showEditRequestModal"
        :request="selectedRequest"
        @request-updated="handleRequestUpdated"
        @reload-data="loadRequests"
      />
    </va-container>

    <!-- User Profile Modal -->
    <UserProfileModal
      :is-visible="showProfileModal"
      :user-profile="currentUserProfile"
      @saved="handleProfileSave"
      @close="showProfileModal = false"
    />

    <!-- User Management Modal -->
    <UserManagementModal v-model="showUserManagementModal" />
  </div>
</template>

<script lang="ts" src="./script.ts"></script>
<style lang="scss" src="./styles.scss"></style>
