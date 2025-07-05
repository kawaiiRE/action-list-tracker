import { defineComponent } from 'vue'
import RequestList from '@/components/RequestList/index.vue'
import RequestForm from '@/components/RequestForm/index.vue'
import LoginView from '@/components/LoginView/index.vue'
import UserAvatar from '@/components/UserAvatar/index.vue'
import UserProfileModal from '@/components/UserProfileModal/index.vue'
import UserManagementModal from '@/components/UserManagementModal/index.vue'
import RequestDetailsModal from '@/components/RequestDetailsModal/index.vue'
import ExportModal from '@/components/ExportModal/index.vue'
import EditRequestModal from '@/components/EditRequestModal/index.vue'
import { userStore } from '@/stores/userStore'
import {
  getAllRequests,
  createNewRequest,
  addCommentToRequest,
  getRequestComments,
  type ActionRequest,
  type RequestComment,
  type UserProfile,
} from '@/services/firebase'
import {
  DEPARTMENTS,
  DEPARTMENT_OPTIONS,
  SENDER_DEPARTMENT_OPTIONS,
  RECEIVER_DEPARTMENT_OPTIONS,
} from '@/constants/departments'

export default defineComponent({
  name: 'HomePage',
  components: {
    RequestList,
    RequestForm,
    LoginView,
    UserAvatar,
    UserProfileModal,
    UserManagementModal,
    RequestDetailsModal,
    ExportModal,
    EditRequestModal,
  },
  data() {
    return {
      // App state
      currentView: 'home' as 'home' | 'requests' | 'add-request',
      requests: [] as ActionRequest[],
      selectedRequest: null as ActionRequest | null,
      selectedRequestComments: [] as RequestComment[],

      // Modal states
      showRequestDetailsModal: false,
      showExportModal: false,
      showEditRequestModal: false,
      showProfileModal: false,
      showUserManagementModal: false,

      // Filters
      filters: {
        status: 'All',
        senderDepartment: 'All Sender Departments',
        receiverDepartment: 'All Receiver Departments',
        search: '',
        dateFrom: null as Date | null,
        dateTo: null as Date | null,
      },
      showAdvancedFilters: false,
    }
  },
  computed: {
    // Department options
    departmentOptions(): string[] {
      return DEPARTMENT_OPTIONS
    },
    senderDepartmentOptions(): string[] {
      return SENDER_DEPARTMENT_OPTIONS
    },
    receiverDepartmentOptions(): string[] {
      return RECEIVER_DEPARTMENT_OPTIONS
    },

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
        // Status filter
        const statusMatch =
          this.filters.status === 'All' ||
          request.status === this.filters.status

        // Sender department filter
        const senderDepartmentMatch =
          this.filters.senderDepartment === 'All Sender Departments' ||
          request.senderDepartment === this.filters.senderDepartment

        // Receiver department filter
        const receiverDepartmentMatch =
          this.filters.receiverDepartment === 'All Receiver Departments' ||
          request.receiverDepartment === this.filters.receiverDepartment

        // Search filter
        const searchMatch =
          !this.filters.search ||
          request.title
            ?.toLowerCase()
            ?.includes(this.filters.search?.toLowerCase()) ||
          request.details
            ?.toLowerCase()
            ?.includes(this.filters.search?.toLowerCase()) ||
          request.senderName
            ?.toLowerCase()
            ?.includes(this.filters.search?.toLowerCase()) ||
          request.senderDepartment
            ?.toLowerCase()
            ?.includes(this.filters.search?.toLowerCase()) ||
          request.receiverDepartment
            ?.toLowerCase()
            ?.includes(this.filters.search?.toLowerCase())

        // Date filters
        const dateFromMatch =
          !this.filters.dateFrom ||
          request.createdAt >= (this.filters.dateFrom as Date).getTime()

        const dateToMatch =
          !this.filters.dateTo ||
          request.createdAt <= (this.filters.dateTo as Date).getTime()

        return (
          statusMatch &&
          senderDepartmentMatch &&
          receiverDepartmentMatch &&
          searchMatch &&
          dateFromMatch &&
          dateToMatch
        )
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
      this.showRequestDetailsModal = true

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
    // Modal event handlers
    handleCommentAdded(requestId: string, commentText: string) {
      this.handleComment({ id: requestId, text: commentText })
    },
    handleCommentDeleted() {
      this.loadRequests()
    },
    handleRequestUpdated() {
      this.loadRequests()
    },
    handleRequestDeleted() {
      this.loadRequests()
      this.showRequestDetailsModal = false
    },
    handleEditRequest(request: ActionRequest) {
      this.selectedRequest = request
      this.showEditRequestModal = true
      this.showRequestDetailsModal = false
    },
    confirmDeleteRequestFromList(request: ActionRequest) {
      this.selectedRequest = request
      this.showRequestDetailsModal = true
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

    // Export methods
    openExportModal() {
      this.showExportModal = true
    },

    goHome() {
      this.currentView = 'home'
    },

    // Reload requests data
    async reloadRequests() {
      try {
        this.requests = await getAllRequests()
      } catch (error) {
        console.error('Error reloading requests:', error)
      }
    },
  },
})
