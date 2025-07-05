import { defineComponent, type PropType } from 'vue'
import { type UserProfile } from '@/services/firebase'
import { DEPARTMENTS } from '@/constants/departments'

export default defineComponent({
  name: 'UserProfileModal',
  emits: ['close', 'saved'],
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    userProfile: {
      type: Object as PropType<UserProfile | null>,
      default: null,
    },
  },
  data() {
    return {
      isSaving: false,
      departments: DEPARTMENTS,
      form: {
        firstName: '',
        lastName: '',
        department: '',
        title: '',
        email: '',
      },
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.firstName.trim() &&
        this.form.lastName.trim() &&
        this.form.department &&
        this.form.title.trim()
      )
    },
  },
  watch: {
    userProfile: {
      handler(newProfile) {
        if (newProfile) {
          this.form = {
            firstName: newProfile.firstName || '',
            lastName: newProfile.lastName || '',
            department: newProfile.department || '',
            title: newProfile.title || '',
            email: newProfile.email || '',
          }
        } else {
          // Reset form for new profile
          this.form = {
            firstName: '',
            lastName: '',
            department: '',
            title: '',
            email: '',
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    required(value: string) {
      return value?.trim() ? true : 'This field is required'
    },
    async handleSubmit() {
      if (!this.isFormValid) return

      this.isSaving = true
      try {
        this.$emit('saved', {
          firstName: this.form.firstName.trim(),
          lastName: this.form.lastName.trim(),
          department: this.form.department,
          title: this.form.title.trim(),
        })
      } catch (error) {
        console.error('Error in form submission:', error)
      } finally {
        this.isSaving = false
      }
    },
  },
})
