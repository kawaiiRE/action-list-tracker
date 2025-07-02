import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RequestForm',
  data() {
    return {
      form: {
        creator: '',
        title: '',
        details: '',
        status: 'Open', // Default to Open
        department: ''
      },
      statuses: ['Open', 'In-Progress', 'Closed'],
      departments: ['Sales', 'Legal', 'Finance', 'Other'],
      isSubmitting: false
    }
  },
  computed: {
    isValid() {
      return this.form.creator.trim() && 
             this.form.title.trim() && 
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
        creator: '',
        title: '',
        details: '',
        status: 'Open',
        department: ''
      }
    }
  }
})