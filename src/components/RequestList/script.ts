import RequestCard from '@/components/RequestCard/index.vue'
import { defineComponent, type PropType } from 'vue'

interface Request {
  id: string
  title: string
  description: string
  status: string
  department: string
  priority: string
  creator: string
  createdAt: string
  comments?: any[]
}

export default defineComponent({
  name: 'RequestList',
  components: { RequestCard },
  props: {
    requests: {
      type: Array as PropType<Request[]>,
      required: true,
    },
  },
  emits: ['comment', 'view-request'],
  methods: {
    emitComment(payload: any) {
      this.$emit('comment', payload)
    },
    viewRequest(request: Request) {
      this.$emit('view-request', request)
    },
  },
})
