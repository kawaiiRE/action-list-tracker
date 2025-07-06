import { defineComponent, type PropType } from 'vue'
import type { ActionRequest, RequestComment } from '@/services/firebase'
import {
  updateRequest,
  deleteRequest as deleteRequestFromFirebase,
  deleteComment as deleteCommentFromFirebase,
  addCommentToRequest,
  addSystemCommentToRequest,
  updateComment,
} from '@/services/firebase'
import AddComment from '@/components/AddComment/index.vue'
import { getStatusColor } from '@/utils/statusColors'

export default defineComponent({
  name: 'RequestDetailsModal',
  components: {
    AddComment,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    request: {
      type: Object as PropType<ActionRequest | null>,
      default: null,
    },
    comments: {
      type: Array as PropType<RequestComment[]>,
      default: () => [],
    },
    isViewOnly: {
      type: Boolean,
      default: false,
    },
    canComment: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    canDeleteAll: {
      type: Boolean,
      default: false,
    },
    currentUserId: {
      type: String,
      default: '',
    },
  },
  emits: [
    'update:modelValue',
    'comment-added',
    'comment-deleted',
    'request-updated',
    'request-deleted',
    'edit-request',
    'reload-data',
  ],
  data() {
    return {
      isSubmittingComment: false,
      showDeleteDialog: false,
      showDeleteCommentDialog: false,
      deletingRequest: false,
      deletingComment: false,
      commentToDelete: null as string | null,
      editableStatus: '',
      statusOptions: ['Open', 'In-Progress', 'Closed'],
      isLoadingComments: false,
      editingCommentId: null as string | null,
      editCommentText: '',
      savingComment: false,
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  watch: {
    request: {
      handler(newRequest) {
        if (newRequest) {
          this.editableStatus = newRequest.status
        }
      },
      immediate: true,
    },
  },
  methods: {
    closeModal() {
      this.isVisible = false
    },
    enableEdit() {
      this.$emit('edit-request', this.request)
    },
    async updateStatus(newStatus: string) {
      if (!this.request || newStatus === this.request.status) return

      const oldStatus = this.request.status
      this.isLoadingComments = true
      try {
        await updateRequest(this.request.id!, { status: newStatus })

        // Add a system comment to log the status change
        await addSystemCommentToRequest(
          this.request.id!,
          `Status changed from "${oldStatus}" to "${newStatus}"`,
        )

        this.$vaToast.init({
          message: 'Status updated successfully',
          color: 'success',
        })
        this.$emit('request-updated')
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error updating status:', error)
        this.$vaToast.init({
          message: 'Error updating status',
          color: 'danger',
        })
        // Revert the status
        this.editableStatus = this.request.status
      } finally {
        this.isLoadingComments = false
      }
    },
    confirmDelete() {
      this.showDeleteDialog = true
    },
    async deleteRequest() {
      if (!this.request) return

      this.deletingRequest = true
      try {
        await deleteRequestFromFirebase(this.request.id!)
        this.$vaToast.init({
          message: 'Request deleted successfully',
          color: 'success',
        })
        this.showDeleteDialog = false
        this.closeModal()
        this.$emit('request-deleted')
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error deleting request:', error)
        this.$vaToast.init({
          message: 'Error deleting request',
          color: 'danger',
        })
      } finally {
        this.deletingRequest = false
      }
    },
    async handleComment(commentText: string) {
      if (!this.request) return

      this.isSubmittingComment = true
      try {
        this.$emit('comment-added', this.request.id, commentText)
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error adding comment:', error)
        this.$vaToast.init({
          message: 'Error adding comment',
          color: 'danger',
        })
      } finally {
        this.isSubmittingComment = false
      }
    },
    confirmDeleteComment(commentId: string) {
      this.commentToDelete = commentId
      this.showDeleteCommentDialog = true
    },
    async deleteComment() {
      if (!this.request || !this.commentToDelete) return

      this.deletingComment = true
      try {
        await deleteCommentFromFirebase(this.request.id!, this.commentToDelete)
        this.$vaToast.init({
          message: 'Comment deleted successfully',
          color: 'success',
        })
        this.showDeleteCommentDialog = false
        this.commentToDelete = null
        this.$emit('comment-deleted')
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error deleting comment:', error)
        this.$vaToast.init({
          message: 'Error deleting comment',
          color: 'danger',
        })
      } finally {
        this.deletingComment = false
      }
    },
    startEditComment(comment: RequestComment) {
      this.editingCommentId = comment.id!
      this.editCommentText = comment.text
    },
    cancelEditComment() {
      this.editingCommentId = null
      this.editCommentText = ''
    },
    async saveEditComment() {
      if (
        !this.request ||
        !this.editingCommentId ||
        !this.editCommentText?.trim()
      )
        return

      this.savingComment = true
      try {
        await updateComment(
          this.request.id!,
          this.editingCommentId,
          this.editCommentText?.trim(),
        )
        this.$vaToast.init({
          message: 'Comment updated successfully',
          color: 'success',
        })
        this.cancelEditComment()
        this.$emit('reload-data')
      } catch (error) {
        console.error('Error updating comment:', error)
        this.$vaToast.init({
          message: 'Error updating comment',
          color: 'danger',
        })
      } finally {
        this.savingComment = false
      }
    },
    formatDate(timestamp: number) {
      return new Date(timestamp).toLocaleString()
    },
    getStatusColor(status: string) {
      return getStatusColor(status)
    },
  },
})
