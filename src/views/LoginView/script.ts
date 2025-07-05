import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  emits: ['login-success'],
  methods: {
    enter() {
      this.$emit('login-success')
    },
  },
})
