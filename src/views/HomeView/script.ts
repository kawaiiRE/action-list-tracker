import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  methods: {
    navigateToRequests() {
      this.$router.push('/requests')
    },
    navigateToAddRequest() {
      this.$router.push('/requests/add')
    }
  }
})