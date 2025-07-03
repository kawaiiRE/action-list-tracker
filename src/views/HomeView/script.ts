import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  methods: {
    navigateToRequests() {
      this.$router.push('/requests')
    },
    navigateToAddRequest() {
      this.$router.push('/requests/add')
    },
    navigateToOpenRequests() {
      this.$router.push('/requests?status=Open')
    },
    navigateToInProgressRequests() {
      this.$router.push('/requests?status=In-Progress')
    },
    navigateToSalesRequests() {
      this.$router.push('/requests?category=Sales')
    },
    logout() {
      this.$router.push('/')
    },
  },
})
