import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  methods: {
    enter() {
      this.$router.push('/home')
    }
  }
})