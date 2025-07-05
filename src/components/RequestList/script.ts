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
