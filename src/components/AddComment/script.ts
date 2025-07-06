import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AddComment',
  props: {
    isSubmittingComment: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      text: '',
    }
  },
  computed: {
    isValid() {
      return this.text?.trim().length > 0
    },
  },
  methods: {
    async submit() {
      if (!this.isValid || this.isSubmittingComment) return

      try {
        this.$emit('submit', this.text?.trim())
        this.text = ''
      } catch (error) {
        console.error('Error submitting comment:', error)
      }
    },
    handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        this.submit()
      }
    },
  },
})
