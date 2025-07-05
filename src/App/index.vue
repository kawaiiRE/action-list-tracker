<template>
  <va-app>
    <!-- Show login view if user is not authenticated -->
    <LoginView v-if="!isAuthenticated" @login-success="handleLoginSuccess" />

    <!-- Main app content when authenticated -->
    <div v-else>
      <va-navbar color="primary" class="mb-4">
        <template #left>
          <va-navbar-item>
            <h2>Action Tracker</h2>
          </va-navbar-item>
        </template>
        <template #right>
          <div class="d-flex align-center">
            <!-- Admin User Management Button -->
            <va-button
              v-if="canManageUsers"
              @click="showUserManagementModal = true"
              color="secondary"
              icon="people"
              preset="plain"
              class="mr-2"
            >
              Users
            </va-button>

            <UserAvatar
              :user-profile="currentUserProfile"
              @edit-profile="openProfileModal"
              @logout="handleLogout"
            />
          </div>
        </template>
      </va-navbar>

      <va-container>
        <!-- Navigation Tabs -->
        <va-tabs v-model="currentView" class="mb-4">
          <va-tab name="requests" label="Requests" />
          <va-tab
            v-if="canCreateRequests"
            name="add-request"
            label="Add Request"
          />
        </va-tabs>

        <!-- Requests View -->
        <div v-if="currentView === 'requests'">
          <div class="mb-4">
            <h3>Action Requests</h3>
            <div class="filters mb-3">
              <va-select
                v-model="filters.status"
                :options="['All', 'Open', 'In-Progress', 'Closed']"
                label="Filter by Status"
                class="mr-3"
                style="width: 200px; display: inline-block"
              />
              <va-select
                v-model="filters.department"
                :options="['All', 'Sales', 'Legal', 'Finance', 'Other']"
                label="Filter by Department"
                style="width: 200px; display: inline-block"
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
          <h3>Add New Request</h3>
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
                      <em
                        >You have view-only access and cannot add comments.</em
                      >
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
              Are you sure you want to delete this request? This action cannot
              be undone.
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
              Are you sure you want to delete this comment? This action cannot
              be undone.
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
  </va-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import RequestList from '@/components/RequestList/index.vue'
import RequestForm from '@/components/RequestForm/index.vue'
import AddComment from '@/components/AddComment/index.vue'
import LoginView from '@/components/LoginView/index.vue'
import UserAvatar from '@/components/UserAvatar/index.vue'
import UserProfileModal from '@/components/UserProfileModal/index.vue'
import UserManagementModal from '@/components/UserManagementModal/index.vue'
import {
  getAllRequests,
  createNewRequest,
  addCommentToRequest,
  getRequestComments,
  deleteRequest as deleteRequestFromFirebase,
  deleteComment as deleteCommentFromFirebase,
  onAuthStateChanged,
  signOut,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getCurrentUser,
  hasPermission,
  canViewOnly,
  canManageUsers as canManageUsersFromService,
  type ActionRequest,
  type RequestComment,
  type UserProfile,
} from '@/services/firebase'

export default defineComponent({
  name: 'App',
  components: {
    RequestList,
    RequestForm,
    AddComment,
    LoginView,
    UserAvatar,
    UserProfileModal,
    UserManagementModal,
  },
  data() {
    return {
      // Authentication
      isAuthenticated: false,
      currentUserProfile: null as UserProfile | null,
      showProfileModal: false,
      showUserManagementModal: false,
      authUnsubscribe: null as (() => void) | null,

      // App state
      currentView: 'requests' as 'requests' | 'add-request',
      requests: [] as ActionRequest[],
      selectedRequest: null as ActionRequest | null,
      selectedRequestComments: [] as RequestComment[],
      showModal: false,
      showDeleteRequestDialog: false,
      showDeleteCommentDialog: false,
      deletingRequest: false,
      deletingComment: false,
      filters: {
        status: 'All',
        department: 'All',
      },
      commentIdToDelete: null as string | null,
    }
  },
  computed: {
    filteredRequests(): ActionRequest[] {
      return this.requests.filter((request) => {
        const statusMatch =
          this.filters.status === 'All' ||
          request.status === this.filters.status
        const departmentMatch =
          this.filters.department === 'All' ||
          request.department === this.filters.department
        return statusMatch && departmentMatch
      })
    },
    canCreateRequests(): boolean {
      return this.currentUserProfile
        ? hasPermission(this.currentUserProfile.role, 'create')
        : false
    },
    canComment(): boolean {
      return this.currentUserProfile
        ? hasPermission(this.currentUserProfile.role, 'comment')
        : false
    },
    canDelete(): boolean {
      return this.currentUserProfile
        ? hasPermission(this.currentUserProfile.role, 'delete_own')
        : false
    },
    canDeleteAll(): boolean {
      return this.currentUserProfile
        ? hasPermission(this.currentUserProfile.role, 'delete_all')
        : false
    },
    canManageUsers(): boolean {
      return this.currentUserProfile
        ? canManageUsersFromService(this.currentUserProfile.role)
        : false
    },
    isViewOnly(): boolean {
      return this.currentUserProfile
        ? canViewOnly(this.currentUserProfile.role)
        : false
    },
  },
  async created() {
    // Set up authentication listener
    this.authUnsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        this.isAuthenticated = true
        await this.loadUserProfile(user.uid)
        await this.loadRequests()
      } else {
        this.isAuthenticated = false
        this.currentUserProfile = null
        this.requests = []
      }
    })
  },
  beforeUnmount() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe()
    }
  },
  methods: {
    // Authentication methods
    async loadUserProfile(uid: string) {
      try {
        this.currentUserProfile = await getUserProfile(uid)
      } catch (error) {
        console.error('Error loading user profile:', error)
        this.currentUserProfile = null
      }
    },

    async handleLoginSuccess() {
      const user = getCurrentUser()
      if (user) {
        await this.loadUserProfile(user.uid)

        // If user profile is incomplete, open profile modal
        if (
          !this.currentUserProfile ||
          !this.currentUserProfile.firstName ||
          !this.currentUserProfile.lastName ||
          !this.currentUserProfile.department ||
          !this.currentUserProfile.title
        ) {
          this.showProfileModal = true
        }
      }
    },

    openProfileModal() {
      this.showProfileModal = true
    },

    async handleLogout() {
      try {
        await signOut()
        // Auth state listener will handle cleanup
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },

    async handleProfileSave(profileData: Partial<UserProfile>) {
      const user = getCurrentUser()
      if (!user) return

      try {
        if (!this.currentUserProfile) {
          // Create new profile
          await createUserProfile({
            uid: user.uid,
            email: user.email || '',
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            department: profileData.department || '',
            title: profileData.title || '',
            role: 'user', // Default role
          })
        } else {
          // Update existing profile
          await updateUserProfile(user.uid, profileData)
        }

        // Reload profile
        await this.loadUserProfile(user.uid)
        this.showProfileModal = false
      } catch (error) {
        console.error('Error saving profile:', error)
      }
    },

    // Existing methods
    async loadRequests() {
      try {
        this.requests = await getAllRequests()
      } catch (error) {
        console.error('Error loading requests:', error)
      }
    },
    async handleNewRequest(requestData: any) {
      try {
        await createNewRequest({
          ...requestData,
          createdAt: Date.now(),
        })
        await this.loadRequests() // Refresh the list
        this.currentView = 'requests' // Switch back to requests view
      } catch (error) {
        console.error('Error adding request:', error)
      }
    },
    async handleComment(payload: { id: string; text: string }) {
      try {
        await addCommentToRequest(payload.id, payload.text)
        await this.loadRequests() // Refresh the list
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    },
    async showRequestDetails(request: ActionRequest) {
      this.selectedRequest = request
      this.showModal = true

      // Load comments for this request
      if (request.id) {
        try {
          this.selectedRequestComments = await getRequestComments(request.id)
        } catch (error) {
          console.error('Error loading comments:', error)
          this.selectedRequestComments = []
        }
      }
    },
    async handleModalComment(text: string) {
      if (!this.selectedRequest?.id) return

      try {
        await addCommentToRequest(this.selectedRequest.id, text)
        // Refresh comments
        this.selectedRequestComments = await getRequestComments(
          this.selectedRequest.id,
        )
        // Also refresh the main requests list
        await this.loadRequests()
      } catch (error) {
        console.error('Error adding comment:', error)
      }
    },
    confirmDeleteRequestFromList(request: ActionRequest) {
      this.selectedRequest = request
      this.confirmDeleteRequest()
    },
    confirmDeleteRequest() {
      this.showDeleteRequestDialog = true
    },
    async deleteRequest() {
      if (!this.selectedRequest?.id) return

      this.deletingRequest = true
      try {
        await deleteRequestFromFirebase(this.selectedRequest.id)

        // Remove from local state
        const requestId = this.selectedRequest.id
        this.requests = this.requests.filter(
          (request) => request.id !== requestId,
        )
        this.showModal = false
      } catch (error) {
        console.error('Error deleting request:', error)
      } finally {
        this.deletingRequest = false
        this.showDeleteRequestDialog = false
      }
    },
    confirmDeleteComment(commentId: string | undefined) {
      if (!commentId) return
      this.commentIdToDelete = commentId
      this.showDeleteCommentDialog = true
    },
    async deleteComment() {
      if (!this.commentIdToDelete || !this.selectedRequest?.id) return

      this.deletingComment = true
      try {
        await deleteCommentFromFirebase(
          this.selectedRequest.id,
          this.commentIdToDelete,
        )

        // Remove from local state
        this.selectedRequestComments = this.selectedRequestComments.filter(
          (comment) => comment.id !== this.commentIdToDelete,
        )
      } catch (error) {
        console.error('Error deleting comment:', error)
      } finally {
        this.deletingComment = false
        this.showDeleteCommentDialog = false
        this.commentIdToDelete = null
      }
    },
    getStatusColor(status: string) {
      switch (status) {
        case 'Open':
          return 'warning'
        case 'In-Progress':
          return 'primary'
        case 'Closed':
          return 'success'
        default:
          return 'secondary'
      }
    },
    formatDate(date: string | number) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
})
</script>

<style lang="scss" src="./styles.scss"></style>
