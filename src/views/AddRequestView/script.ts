import { defineComponent } from 'vue'
import { createNewRequest, type ActionRequest } from '@/services/firebase'
import RequestForm from '@/components/RequestForm/index.vue'

export default defineComponent({
  name: 'AddRequestView',
  components: { RequestForm },
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

        this.$router.push('/requests')
      } catch (error) {
        console.error('Error creating request:', error)
        this.$vaToast.init({
          message: 'Error creating request. Please try again.',
          color: 'danger',
        })
      }
    },
    goBack() {
      this.$router.push('/requests')
    },
  },
})
