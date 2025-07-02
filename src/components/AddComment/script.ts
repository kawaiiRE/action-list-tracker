import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AddComment',
  data() {
    return {
      text: '',
      isSubmitting: false
    }
  },
  computed: {
    isValid() {
      return this.text.trim().length > 0
    }
  },
  methods: {
    async submit() {
      if (!this.isValid || this.isSubmitting) return
      
      this.isSubmitting = true
      try {
        this.$emit('submit', this.text.trim())
        this.text = ''
      } finally {
        this.isSubmitting = false
      }
    },
    handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        this.submit()
      }
    }
  }
})