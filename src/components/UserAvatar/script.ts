import { defineComponent, type PropType } from 'vue'
import { type UserProfile } from '@/services/firebase'

export default defineComponent({
  name: 'UserAvatar',
  emits: ['edit-profile', 'logout'],
  props: {
    userProfile: {
      type: Object as PropType<UserProfile | null>,
      required: true,
    },
  },
  data() {
    return {
      showDropdown: false,
    }
  },
  computed: {
    fullName() {
      if (!this.userProfile) return 'User'
      return (
        `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim() ||
        'User'
      )
    },
    initials() {
      if (
        !this.userProfile ||
        !this.userProfile.firstName ||
        !this.userProfile.lastName
      ) {
        return 'U'
      }
      return `${this.userProfile.firstName[0]}${this.userProfile.lastName[0]}`.toUpperCase()
    },
    avatarColor() {
      // Generate a consistent color based on the user's name
      if (!this.userProfile) return 'primary'

      const name = this.fullName
      const colors = [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'danger',
      ]
      const hash = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return colors[hash % colors.length]
    },
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    editProfile() {
      this.showDropdown = false
      this.$emit('edit-profile')
    },
    logout() {
      this.showDropdown = false
      this.$emit('logout')
    },
  },
})
