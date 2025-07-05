import { defineComponent } from 'vue'
import {
  getRequestById,
  addCommentToRequest,
  deleteRequest as deleteRequestById,
  type ActionRequest,
} from '@/services/firebase'

export default defineComponent({
  name: 'RequestDetailView',
  emits: ['request-deleted', 'edit-request', 'go-back'],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      request: null as ActionRequest | null,
      isLoading: true,
      newComment: '',
    }
  },
  async mounted() {
    await this.loadRequest()
  },
  watch: {
    id: {
      handler: 'loadRequest',
      immediate: false,
    },
  },
  methods: {
    async loadRequest() {
      this.isLoading = true
      try {
        this.request = await getRequestById(this.id)
      } catch (error) {
        console.error('Error loading request:', error)
        this.$vaToast.init({
          message: 'Error loading request details',
          color: 'danger',
        })
      } finally {
        this.isLoading = false
      }
    },
    async addComment() {
      if (!this.newComment.trim() || !this.request?.id) return

      try {
        await addCommentToRequest(
          this.request.id,
          this.newComment.trim(),
          'Current User',
        )
        this.newComment = ''
        this.$vaToast.init({
          message: 'Comment added successfully',
          color: 'success',
        })
        // Reload request to show new comment
        await this.loadRequest()
      } catch (error) {
        console.error('Error adding comment:', error)
        this.$vaToast.init({
          message: 'Error adding comment',
          color: 'danger',
        })
      }
    },
    async deleteRequest() {
      if (!this.request) return

      const confirmed = confirm(
        'Are you sure you want to delete this request? This action cannot be undone.',
      )

      if (confirmed) {
        try {
          await deleteRequestById(this.request.id!)
          this.$vaToast.init({
            message: 'Request deleted successfully',
            color: 'success',
          })
          this.$emit('request-deleted')
        } catch (error) {
          console.error('Error deleting request:', error)
          this.$vaToast.init({
            message: 'Error deleting request',
            color: 'danger',
          })
        }
      }
    },
    editRequest() {
      if (this.request) {
        this.$emit('edit-request', this.request)
      }
    },
    goBack() {
      this.$emit('go-back')
    },
    getStatusColor(status: string) {
      switch (status) {
        case 'Open':
          return 'primary'
        case 'In-Progress':
          return 'warning'
        case 'Closed':
          return 'success'
        default:
          return 'secondary'
      }
    },
    formatDate(date: any) {
      if (!date) return ''
      const d = date.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
    },
  },
})
