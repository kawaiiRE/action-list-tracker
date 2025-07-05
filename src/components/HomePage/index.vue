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
      <va-modal
        v-model="showModal"
        title="Request Details"
        size="large"
        hide-default-actions
        fixed-layout
      >
        <template #header>
          <div class="modal-header">
            <h4 class="modal-title">Request Details</h4>
            <va-button
              @click="showModal = false"
              icon="close"
              preset="plain"
              class="close-button"
            />
          </div>
        </template>
        <div v-if="selectedRequest">
          <va-card>
            <va-card-title>{{ selectedRequest.title }}</va-card-title>
            <va-card-content>
              <div class="request-field">
                <strong>Status:</strong>
                <va-badge
                  :color="getStatusColor(selectedRequest.status)"
                  :text="selectedRequest.status"
                  class="status-badge"
                />
              </div>
              <div class="request-field">
                <strong>Sender:</strong> {{ selectedRequest.senderName }}
              </div>
              <div class="request-field">
                <strong>Sender Department:</strong>
                {{ selectedRequest.senderDepartment }}
              </div>
              <div class="request-field">
                <strong>Receiver Department:</strong>
                {{ selectedRequest.receiverDepartment }}
              </div>
              <div class="request-field">
                <strong>Created:</strong>
                {{ formatDate(selectedRequest.createdAt) }}
              </div>
              <div class="request-field">
                <strong>Description:</strong>
                <p>{{ selectedRequest.details }}</p>
              </div>

              <!-- Request Actions -->
              <div class="request-actions" v-if="!isViewOnly">
                <va-button
                  v-if="
                    canDelete ||
                    canDeleteAll ||
                    selectedRequest.senderId === currentUserProfile?.uid
                  "
                  @click="confirmDeleteRequest"
                  color="danger"
                  icon="delete"
                  size="small"
                >
                  Delete Request
                </va-button>
              </div>

              <!-- Comments Section -->
              <div class="comments-section">
                <h4>Comments</h4>
                <div v-if="selectedRequestComments.length > 0">
                  <div
                    v-for="comment in selectedRequestComments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <va-card>
                      <va-card-content>
                        <div class="comment-meta">
                          <div>
                            <strong>{{ comment.authorName }}</strong>
                            <span class="comment-date">{{
                              formatDate(comment.createdAt)
                            }}</span>
                          </div>
                          <va-button
                            v-if="
                              !isViewOnly &&
                              (canDelete ||
                                canDeleteAll ||
                                comment.authorId === currentUserProfile?.uid)
                            "
                            @click="confirmDeleteComment(comment.id)"
                            color="danger"
                            icon="delete"
                            size="small"
                            preset="plain"
                          />
                        </div>
                        <p>{{ comment.text }}</p>
                      </va-card-content>
                    </va-card>
                  </div>
                </div>
                <div v-else>
                  <p class="no-comments">No comments yet.</p>
                </div>

                <!-- Add Comment -->
                <AddComment
                  v-if="canComment"
                  :isSubmittingComment="isSubmittingComment"
                  @submit="handleModalComment"
                />
                <div v-else-if="isViewOnly" class="view-only-message">
                  <p>
                    <em>You have view-only access and cannot add comments.</em>
                  </p>
                </div>
              </div>
            </va-card-content>
          </va-card>
        </div>
      </va-modal>

      <!-- Delete Request Confirmation Dialog -->
      <va-modal
        v-model="showDeleteRequestDialog"
        title="Confirm Delete"
        size="small"
        :hideDefaultActions="true"
      >
        <div class="confirmation-dialog">
          <p>
            Are you sure you want to delete this request? This action cannot be
            undone.
          </p>
          <div class="dialog-actions">
            <va-button
              @click="showDeleteRequestDialog = false"
              color="secondary"
              class="cancel-button"
            >
              Cancel
            </va-button>
            <va-button
              @click="deleteRequest"
              color="danger"
              :loading="deletingRequest"
            >
              Delete
            </va-button>
          </div>
        </div>
      </va-modal>

      <!-- Delete Comment Confirmation Dialog -->
      <va-modal
        v-model="showDeleteCommentDialog"
        title="Confirm Delete"
        size="small"
        :hideDefaultActions="true"
      >
        <div class="confirmation-dialog">
          <p>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </p>
          <div class="dialog-actions">
            <va-button
              @click="showDeleteCommentDialog = false"
              color="secondary"
              class="cancel-button"
            >
              Cancel
            </va-button>
            <va-button
              @click="deleteComment"
              color="danger"
              :loading="deletingComment"
            >
              Delete
            </va-button>
          </div>
        </div>
      </va-modal>

      <!-- Export Excel Modal -->
      <va-modal
        v-model="showExportModal"
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
          <va-button
            @click="showExportModal = false"
            preset="secondary"
            class="cancel-button"
          >
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
