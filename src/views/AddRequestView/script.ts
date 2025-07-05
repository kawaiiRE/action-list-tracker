import { defineComponent } from 'vue'
import { createNewRequest, type ActionRequest } from '@/services/firebase'
import RequestForm from '@/components/RequestForm/index.vue'

export default defineComponent({
  name: 'AddRequestView',
  components: { RequestForm },
  emits: ['go-back'],
  methods: {
    async onSubmit(payload: Omit<ActionRequest, 'createdAt' | 'id'>) {
      try {
        const requestId = await createNewRequest({
          ...payload,
          createdAt: Date.now(),
        })

        this.$vaToast.init({
          message: 'Request created successfully!',
          color: 'success',
        })

        // Request created successfully - no routing needed in SPA
      } catch (error) {
        console.error('Error creating request:', error)
        this.$vaToast.init({
          message: 'Error creating request. Please try again.',
          color: 'danger',
        })
      }
    },
    goBack() {
      // In SPA, this would emit an event to parent component
      this.$emit('go-back')
    },
  },
})
