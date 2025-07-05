import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  emits: [
    'navigate-to-requests',
    'navigate-to-add-request',
    'navigate-to-open-requests',
    'navigate-to-in-progress-requests',
    'navigate-to-sales-requests',
    'logout',
  ],
  methods: {
    navigateToRequests() {
      this.$emit('navigate-to-requests')
    },
    navigateToAddRequest() {
      this.$emit('navigate-to-add-request')
    },
    navigateToOpenRequests() {
      this.$emit('navigate-to-open-requests')
    },
    navigateToInProgressRequests() {
      this.$emit('navigate-to-in-progress-requests')
    },
    navigateToSalesRequests() {
      this.$emit('navigate-to-sales-requests')
    },
    logout() {
      this.$emit('logout')
    },
  },
})
