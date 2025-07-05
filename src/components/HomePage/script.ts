import { defineComponent } from 'vue'
import RequestList from '@/components/RequestList/index.vue'
import RequestForm from '@/components/RequestForm/index.vue'
import AddComment from '@/components/AddComment/index.vue'
import LoginView from '@/components/LoginView/index.vue'
import UserAvatar from '@/components/UserAvatar/index.vue'
import UserProfileModal from '@/components/UserProfileModal/index.vue'
import UserManagementModal from '@/components/UserManagementModal/index.vue'
import { userStore } from '@/stores/userStore'
import {
  getAllRequests,
  createNewRequest,
  addCommentToRequest,
  getRequestComments,
  deleteRequest as deleteRequestFromFirebase,
  deleteComment as deleteCommentFromFirebase,
  type ActionRequest,
  type RequestComment,
  type UserProfile,
} from '@/services/firebase'

export default defineComponent({
  name: 'HomePage',
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
      // App state
      currentView: 'home' as 'home' | 'requests' | 'add-request',
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
      showProfileModal: false,
      showUserManagementModal: false,
    }
  },
  computed: {
    // Authentication computed properties from store
    isAuthenticated(): boolean {
      return userStore.isAuthenticated
    },
    currentUserProfile(): UserProfile | null {
      return userStore.user
    },
    authLoading(): boolean {
      return userStore.loading
    },
    authError(): string | null {
      return userStore.error
    },
    sessionExpired(): boolean {
      return userStore.sessionExpired
    },

    // Permission computed properties from store
    canCreateRequests(): boolean {
      return userStore.canCreateRequests
    },
    canComment(): boolean {
      return userStore.canComment
    },
    canDelete(): boolean {
      return userStore.canDelete
    },
    canDeleteAll(): boolean {
      return userStore.canDeleteAll
    },
    canManageUsers(): boolean {
      return userStore.canManageUsers
    },
    isViewOnly(): boolean {
      return userStore.isViewOnly
    },

    // Existing computed properties
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
    availableActions() {
      return {
        viewRequests: {
          title: 'View All Requests',
          description: 'Browse and manage action requests',
          icon: 'list',
          color: 'primary',
          buttonText: 'View Requests',
          enabled: true,
          view: 'requests',
        },
        addRequest: {
          title: 'Add New Request',
          description: 'Create a new action request',
          icon: 'add_circle',
          color: 'success',
          buttonText: 'Add Request',
          enabled: this.canCreateRequests,
          view: 'add-request',
        },
        userManagement: {
          title: 'User Management',
          description: 'Manage users and permissions',
          icon: 'people',
          color: 'info',
          buttonText: 'Manage Users',
          enabled: this.canManageUsers,
          view: 'user-management',
        },
      }
    },
  },
  async created() {
    // Load requests when component is created
    // The userStore is already initialized in main.ts
    if (userStore.isAuthenticated) {
      await this.loadRequests()
    }
  },
  watch: {
    // Watch for authentication changes
    isAuthenticated: {
      handler(newVal: boolean) {
        if (newVal) {
          this.loadRequests()
        } else {
          this.requests = []
        }
      },
      immediate: true,
    },
  },
  methods: {
    // Authentication methods using userStore
    async handleLoginSuccess() {
      // UserStore handles authentication automatically
      // Just check if profile is incomplete
      if (
        this.currentUserProfile &&
        (!this.currentUserProfile.firstName ||
          !this.currentUserProfile.lastName ||
          !this.currentUserProfile.department ||
          !this.currentUserProfile.title)
      ) {
        this.showProfileModal = true
      }
    },

    openProfileModal() {
      this.showProfileModal = true
    },

    async handleLogout() {
      try {
        await userStore.logout()
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },

    async handleProfileSave(profileData: Partial<UserProfile>) {
      try {
        await userStore.saveUserProfile(profileData)
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
        this.currentView = 'home' // Switch back to home view
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

    // Navigation methods
    selectAction(actionKey: string) {
      const actions = this.availableActions as any
      const action = actions[actionKey]
      if (!action || !action.enabled) return

      if (action.view === 'user-management') {
        this.showUserManagementModal = true
      } else {
        this.currentView = action.view as 'home' | 'requests' | 'add-request'
      }
    },

    goHome() {
      this.currentView = 'home'
    },
  },
})
