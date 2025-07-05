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
import {
  DEPARTMENTS,
  DEPARTMENT_OPTIONS,
  SENDER_DEPARTMENT_OPTIONS,
  RECEIVER_DEPARTMENT_OPTIONS,
} from '@/constants/departments'
import * as XLSX from 'xlsx'

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
        senderDepartment: 'All Sender Departments',
        receiverDepartment: 'All Receiver Departments',
        search: '',
        dateFrom: null as Date | null,
        dateTo: null as Date | null,
      },
      showAdvancedFilters: false,
      commentIdToDelete: null as string | null,
      showProfileModal: false,
      showUserManagementModal: false,
      // Export modal state
      showExportModal: false,
      exportLoading: false,
      includeComments: false,
      applyCurrentFilters: true,
      exportFields: [
        { key: 'id', label: 'ID', selected: true },
        { key: 'title', label: 'Title', selected: true },
        { key: 'details', label: 'Details', selected: true },
        { key: 'status', label: 'Status', selected: true },
        { key: 'senderName', label: 'Sender Name', selected: true },
        { key: 'senderDepartment', label: 'Sender Department', selected: true },
        {
          key: 'receiverDepartment',
          label: 'Receiver Department',
          selected: true,
        },
        { key: 'createdAt', label: 'Created Date', selected: true },
        { key: 'updatedAt', label: 'Updated Date', selected: false },
      ],

      isSubmittingComment: false,
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

    // Export computed properties
    hasSelectedFields(): boolean {
      return this.exportFields.some((field) => field.selected)
    },

    requestsToExport(): ActionRequest[] {
      return this.applyCurrentFilters ? this.filteredRequests : this.requests
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
      this.isSubmittingComment = true

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
      } finally {
        this.isSubmittingComment = false
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

        // Reload requests to get fresh data
        await this.reloadRequests()

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

    // Export methods
    openExportModal() {
      this.showExportModal = true
    },

    async exportToExcel() {
      if (!this.hasSelectedFields) {
        return
      }

      this.exportLoading = true

      try {
        // Get the requests to export
        const requestsData = this.requestsToExport

        if (requestsData.length === 0) {
          this.$vaToast.init({
            message: 'No data to export',
            color: 'warning',
          })
          return
        }

        // Get selected field keys
        const selectedFields = this.exportFields.filter(
          (field) => field.selected,
        )

        // Create Excel data
        const excelData = []

        // Add headers
        const headers = selectedFields.map((field) => field.label)
        if (this.includeComments) {
          headers.push('Comments')
        }
        excelData.push(headers)

        // Add data rows
        for (const request of requestsData) {
          const row = selectedFields.map((field) => {
            let value = request[field.key as keyof ActionRequest]

            // Format specific fields
            if (field.key === 'createdAt' || field.key === 'updatedAt') {
              if (value && typeof value === 'number') {
                value = new Date(value).toLocaleString()
              }
            }

            return value || ''
          })

          // Add comments if requested
          if (this.includeComments) {
            const comments = request.comments || []
            const commentsText = comments
              .map(
                (comment) =>
                  `${comment.authorName} (${new Date(
                    comment.createdAt,
                  ).toLocaleString()}): ${comment.text}`,
              )
              .join('; ')
            row.push(commentsText)
          }

          excelData.push(row)
        }

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet(excelData)

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Action Requests')

        // Generate Excel file and download
        const fileName = `action-requests-${
          new Date().toISOString().split('T')[0]
        }.xlsx`
        XLSX.writeFile(wb, fileName)

        this.$vaToast.init({
          message: 'Excel file exported successfully',
          color: 'success',
        })

        this.showExportModal = false
      } catch (error) {
        console.error('Error exporting Excel:', error)
        this.$vaToast.init({
          message: 'Error exporting Excel file',
          color: 'danger',
        })
      } finally {
        this.exportLoading = false
      }
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
