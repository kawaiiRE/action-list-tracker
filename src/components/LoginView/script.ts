import { defineComponent } from 'vue'
import { signIn } from '@/services/firebase'

export default defineComponent({
  name: 'LoginView',
  emits: ['login-success'],
  data() {
    return {
      isLoggingIn: false,
      loginError: '',
      form: {
        email: '',
        password: '',
      },
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.email.trim() &&
        this.form.password.trim() &&
        this.isValidEmail(this.form.email)
      )
    },
  },
  methods: {
    required(value: string) {
      return value?.trim() ? true : 'This field is required'
    },
    email(value: string) {
      return this.isValidEmail(value)
        ? true
        : 'Please enter a valid email address'
    },
    isValidEmail(email: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    async handleLogin() {
      if (!this.isFormValid) return

      this.isLoggingIn = true
      this.loginError = ''

      try {
        await signIn(this.form.email.trim(), this.form.password)
        this.$emit('login-success')
      } catch (error: any) {
        console.error('Login failed:', error)

        // Handle different Firebase auth errors
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password'
        ) {
          this.loginError = 'Invalid email or password'
        } else if (error.code === 'auth/invalid-email') {
          this.loginError = 'Invalid email address'
        } else if (error.code === 'auth/too-many-requests') {
          this.loginError = 'Too many failed attempts. Please try again later'
        } else {
          this.loginError = 'Login failed. Please try again'
        }
      } finally {
        this.isLoggingIn = false
      }
    },
  },
})
