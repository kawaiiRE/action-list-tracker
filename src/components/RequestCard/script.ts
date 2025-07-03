import AddComment from '@/components/AddComment/index.vue'
import { defineComponent, type PropType } from 'vue'
import {
  getRequestComments,
  type ActionRequest,
  type RequestComment,
} from '@/services/firebase'

export default defineComponent({
  name: 'RequestCard',
  components: { AddComment },
  props: {
    request: {
      type: Object as PropType<ActionRequest>,
      required: true,
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
      switch (this.request.status) {
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
    formattedDate() {
      return new Date(this.request.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
  methods: {
    handleCardClick() {
      this.viewDetails()
    },
    viewDetails() {
      this.$router.push(`/requests/${this.request.id}`)
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
