import { defineComponent } from 'vue'
import { DEPARTMENTS } from '@/constants/departments'
import { userStore } from '@/stores/userStore'
import type { UserProfile } from '@/services/firebase'

export default defineComponent({
  name: 'RequestForm',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit'],
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
      if (!this.isValid || this.loading) return

      // Emit the submit event with form data
      this.$emit('submit', { ...this.form })
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
