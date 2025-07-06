import { defineComponent } from 'vue'
import { DEPARTMENTS } from '@/constants/departments'
import { userStore } from '@/stores/userStore'
import type { UserProfile } from '@/services/firebase'

export default defineComponent({
  name: 'RequestForm',
  data() {
    return {
      form: {
        title: '',
        details: '',
        status: 'Open', // Default to Open
        receiverDepartment: '',
      },
      statuses: ['Open', 'In-Progress', 'Closed'],
      departments: DEPARTMENTS,
      isSubmitting: false,
    }
  },
  computed: {
    currentUserProfile(): UserProfile | null {
      return userStore.user
    },
    isValid() {
      return (
        this.form.title?.trim() &&
        this.form.status &&
        this.form.receiverDepartment
      )
    },
  },
  methods: {
    async onSubmit() {
      if (!this.isValid || this.isSubmitting) return

      this.isSubmitting = true
      try {
        this.$emit('submit', { ...this.form })
      } finally {
        this.isSubmitting = false
      }
    },
    resetForm() {
      this.form = {
        title: '',
        details: '',
        status: 'Open',
        receiverDepartment: '',
      }
    },
  },
})
