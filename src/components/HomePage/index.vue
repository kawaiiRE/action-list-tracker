<template>
  <!-- Show loading state while checking authentication -->
  <div v-if="authLoading" class="loading-container">
    <div class="loading-content">
      <va-icon name="autorenew" spin size="large" color="primary" />
      <p class="mt-3">Loading...</p>
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
    <va-navbar color="primary" class="mb-4">
      <template #left>
        <va-navbar-item>
          <h2>AZAD Properties : BAS - Project Integration</h2>
        </va-navbar-item>
      </template>
      <template #right>
        <div class="d-flex align-center">
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
        <h2 class="mb-4">AZAD Properties : BAS - Project Integration Dashboard</h2>
        <div class="action-boxes">
          <va-card
            v-for="(box, key) in availableActions"
            :key="key"
            @click="selectAction(key)"
            class="action-box"
            :class="{ disabled: !box.enabled }"
            hover
          >
            <va-card-content class="text-center">
              <va-icon
                :name="box.icon"
                size="3rem"
                :color="box.enabled ? box.color : 'secondary'"
                class="mb-3"
              />
              <h4 class="mb-2">{{ box.title }}</h4>
              <p class="text-muted">{{ box.description }}</p>
              <va-button
                v-if="box.enabled"
                :color="box.color"
                size="small"
                class="mt-2"
              >
                {{ box.buttonText }}
              </va-button>
              <va-chip v-else color="secondary" size="small" class="mt-2">
                No Access
              </va-chip>
            </va-card-content>
          </va-card>
        </div>
      </div>

      <!-- Requests View -->
      <div v-if="currentView === 'requests'">
        <div class="d-flex align-center mb-4">
          <va-button
            @click="goHome"
            icon="arrow_back"
            preset="plain"
            class="mr-3"
          >
            Back to Home
          </va-button>
          <h3 class="flex-grow-1">Action Requests</h3>
          <va-button
            @click="openExportModal"
            icon="download"
            color="primary"
            preset="secondary"
          >
            Export CSV
          </va-button>
        </div>
        <div class="mb-4">
          <div class="filters mb-3">
            <va-select
              v-model="filters.status"
              :options="['All', 'Open', 'In-Progress', 'Closed']"
              label="Filter by Status"
              class="mr-3 filter-select"
            />
            <va-select
              v-model="filters.department"
              :options="departmentOptions"
              label="Filter by Department"
              class="filter-select"
            />
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
        <div class="d-flex align-center mb-4">
          <va-button
            @click="goHome"
            icon="arrow_back"
            preset="plain"
            class="mr-3"
          >
            Back to Home
          </va-button>
          <h3>Add New Request</h3>
        </div>
        <RequestForm @submit="handleNewRequest" />
      </div>

      <!-- Request Details Modal -->
      <va-modal v-model="showModal" title="Request Details" size="large">
        <div v-if="selectedRequest">
          <va-card>
            <va-card-title>{{ selectedRequest.title }}</va-card-title>
            <va-card-content>
              <div class="mb-3">
                <strong>Status:</strong>
                <va-badge
                  :color="getStatusColor(selectedRequest.status)"
                  :text="selectedRequest.status"
                  class="ml-2"
                />
              </div>
              <div class="mb-3">
                <strong>Department:</strong> {{ selectedRequest.department }}
              </div>
              <div class="mb-3">
                <strong>Creator:</strong> {{ selectedRequest.creatorName }}
              </div>
              <div class="mb-3">
                <strong>Created:</strong>
                {{ formatDate(selectedRequest.createdAt) }}
              </div>
              <div class="mb-3">
                <strong>Description:</strong>
                <p>{{ selectedRequest.details }}</p>
              </div>

              <!-- Request Actions -->
              <div class="mb-4" v-if="!isViewOnly">
                <va-button
                  v-if="
                    canDelete ||
                    canDeleteAll ||
                    selectedRequest.creatorId === currentUserProfile?.uid
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
              <div class="mt-4">
                <h4>Comments</h4>
                <div v-if="selectedRequestComments.length > 0">
                  <div
                    v-for="comment in selectedRequestComments"
                    :key="comment.id"
                    class="comment mb-3"
                  >
                    <va-card>
                      <va-card-content>
                        <div
                          class="comment-meta mb-2 d-flex justify-between align-center"
                        >
                          <div>
                            <strong>{{ comment.authorName }}</strong>
                            <span class="text-muted ml-2">{{
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
                  <p class="text-muted">No comments yet.</p>
                </div>

                <!-- Add Comment -->
                <AddComment v-if="canComment" @submit="handleModalComment" />
                <div v-else-if="isViewOnly" class="text-muted">
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
        <div class="pa-4">
          <p>
            Are you sure you want to delete this request? This action cannot be
            undone.
          </p>
          <div class="d-flex justify-end mt-4">
            <va-button
              @click="showDeleteRequestDialog = false"
              color="secondary"
              class="mr-2"
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
        <div class="pa-4">
          <p>
            Are you sure you want to delete this comment? This action cannot be
            undone.
          </p>
          <div class="d-flex justify-end mt-4">
            <va-button
              @click="showDeleteCommentDialog = false"
              color="secondary"
              class="mr-2"
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

      <!-- Export CSV Modal -->
      <va-modal
        v-model="showExportModal"
        title="Export Requests to CSV"
        size="medium"
        max-width="600px"
      >
        <div class="export-modal-content">
          <p class="mb-4">
            Select the fields you want to include in the CSV export:
          </p>

          <div class="export-fields">
            <va-checkbox
              v-for="field in exportFields"
              :key="field.key"
              v-model="field.selected"
              :label="field.label"
              class="mb-2"
            />
          </div>

          <div class="export-options mt-4">
            <va-checkbox
              v-model="includeComments"
              label="Include Comments"
              class="mb-2"
            />
            <va-checkbox
              v-model="applyCurrentFilters"
              label="Apply Current Filters"
              class="mb-2"
            />
          </div>
        </div>

        <template #footer>
          <va-button
            @click="showExportModal = false"
            preset="secondary"
            class="mr-3"
          >
            Cancel
          </va-button>
          <va-button
            @click="exportToCSV"
            color="primary"
            :loading="exportLoading"
            :disabled="!hasSelectedFields"
          >
            Export CSV
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
