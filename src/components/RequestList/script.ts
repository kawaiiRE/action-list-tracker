import RequestCard from '@/components/RequestCard/index.vue'
import { defineComponent, type PropType } from 'vue'
import { type ActionRequest } from '@/services/firebase'

export default defineComponent({
  name: 'RequestList',
  components: { RequestCard },
  props: {
    requests: {
      type: Array as PropType<ActionRequest[]>,
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
  emits: ['comment', 'view-request', 'delete-request'],
  methods: {
    emitComment(payload: any) {
      this.$emit('comment', payload)
    },
    viewRequest(request: ActionRequest) {
      this.$emit('view-request', request)
    },
    deleteRequest(request: ActionRequest) {
      this.$emit('delete-request', request)
    },
  },
})
