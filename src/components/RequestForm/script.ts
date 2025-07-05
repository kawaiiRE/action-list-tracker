import { defineComponent } from 'vue'
import { DEPARTMENTS } from '@/constants/departments'

export default defineComponent({
  name: 'RequestForm',
  data() {
    return {
      form: {
        title: '',
        details: '',
        status: 'Open', // Default to Open
        department: ''
      },
      statuses: ['Open', 'In-Progress', 'Closed'],
      departments: DEPARTMENTS,
      isSubmitting: false
    }
  },
  computed: {
    isValid() {
      return this.form.title.trim() && 
             this.form.status && 
             this.form.department
    }
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
        department: ''
      }
    }
  }
})