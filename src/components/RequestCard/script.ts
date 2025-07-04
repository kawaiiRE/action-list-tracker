import AddComment from '@/components/AddComment/index.vue'
import { defineComponent, type PropType } from 'vue'
import {
  getRequestComments,
  type ActionRequest,
  type RequestComment,
} from '@/services/firebase'
import { getStatusColor } from '@/utils/statusColors'

export default defineComponent({
  name: 'RequestCard',
  components: { AddComment },
  emits: ['comment', 'view-request', 'delete-request'],
  props: {
    request: {
      type: Object as PropType<ActionRequest>,
      required: true,
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
    isViewOnly: {
      type: Boolean,
      default: false,
    },
    currentUserId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      comments: [] as RequestComment[],
      showComments: false,
      loadingComments: false,
    }
  },
  computed: {
    statusColor() {
      return getStatusColor(this.request.status)
    },
    formattedDate() {
      return new Date(this.request.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    canDeleteThis() {
      return (
        this.canDeleteAll ||
        (this.canDelete && this.request.senderId === this.currentUserId)
      )
    },
    canCommentThis() {
      return this.canComment && !this.isViewOnly
    },
  },
  methods: {
    handleCardClick() {
      this.viewDetails()
    },
    viewDetails() {
      this.$emit('view-request', this.request)
    },
    deleteRequest() {
      this.$emit('delete-request', this.request)
    },
    async onComment(text: string) {
      if (!this.request.id) return
      this.$emit('comment', { id: this.request.id, text })
      // Refresh comments after adding
      if (this.showComments) {
        await this.loadComments()
      }
    },
    async toggleComments() {
      this.showComments = !this.showComments
      if (this.showComments && this.comments.length === 0) {
        await this.loadComments()
      }
    },
    async loadComments() {
      if (!this.request.id) return

      this.loadingComments = true
      try {
        this.comments = await getRequestComments(this.request.id)
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        this.loadingComments = false
      }
    },
  },
})
