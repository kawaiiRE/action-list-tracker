import { defineComponent } from 'vue'
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser as deleteUserFromFirebase,
  getCurrentUser,
  type UserProfile,
  type UserRole,
} from '@/services/firebase'
import { DEPARTMENTS } from '@/constants/departments'

export default defineComponent({
  name: 'UserManagementModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      users: [] as UserProfile[],
      loading: false,
      showAddUserForm: false,
      addingUser: false,
      showDeleteDialog: false,
      deletingUser: false,
      userToDelete: null as string | null,
      newUser: {
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        title: '',
        role: 'user' as UserRole,
      },
      roleOptions: [
        { value: 'viewer', text: 'Viewer' },
        { value: 'user', text: 'User' },
        { value: 'admin', text: 'Admin' },
      ],
      departments: DEPARTMENTS,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'title', label: 'Job Title' },
        { key: 'role', label: 'Role' },
        { key: 'actions', label: 'Actions' },
      ],
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      },
    },
    currentUserId() {
      return getCurrentUser()?.uid
    },
    isNewUserFormValid() {
      return (
        this.newUser.email &&
        this.newUser.firstName &&
        this.newUser.lastName &&
        this.newUser.department &&
        this.newUser.title &&
        this.newUser.role
      )
    },
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        this.loadUsers()
      }
    },
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        this.users = await getAllUsers()
      } catch (error) {
        console.error('Error loading users:', error)
        this.$vaToast.init({
          message: 'Error loading users',
          color: 'danger',
        })
      } finally {
        this.loading = false
      }
    },
    async handleAddUser() {
      if (!this.isNewUserFormValid) return

      this.addingUser = true
      try {
        await createUser(this.newUser.email, '123456', {
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          department: this.newUser.department,
          title: this.newUser.title,
          role: this.newUser.role,
        })

        this.$vaToast.init({
          message: `User created successfully`,
          color: 'success',
        })

        this.resetNewUserForm()
        this.showAddUserForm = false

        await this.loadUsers()
      } catch (error) {
        console.error('Error creating user:', error)
        this.$vaToast.init({
          message:
            'Error creating user: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
          color: 'danger',
        })
      } finally {
        this.addingUser = false
      }
    },
    async updateUserRole(uid: string, newRole: UserRole) {
      try {
        await updateUserRole(uid, newRole)
        this.$vaToast.init({
          message: 'User role updated successfully',
          color: 'success',
        })
      } catch (error) {
        console.error('Error updating user role:', error)
        this.$vaToast.init({
          message: 'Error updating user role',
          color: 'danger',
        })
        // Reload users to revert the change
        await this.loadUsers()
      }
    },
    confirmDeleteUser(uid: string) {
      this.userToDelete = uid
      this.showDeleteDialog = true
    },
    async deleteUser() {
      if (!this.userToDelete) return

      this.deletingUser = true
      try {
        await deleteUserFromFirebase(this.userToDelete)
        this.$vaToast.init({
          message: 'User deleted successfully',
          color: 'success',
        })
        await this.loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        this.$vaToast.init({
          message: 'Error deleting user',
          color: 'danger',
        })
      } finally {
        this.deletingUser = false
        this.showDeleteDialog = false
        this.userToDelete = null
      }
    },
    resetNewUserForm() {
      this.newUser = {
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        title: '',
        role: 'user',
      }
    },
    getRoleColor(role: UserRole) {
      switch (role) {
        case 'admin':
          return 'danger'
        case 'user':
          return 'primary'
        case 'viewer':
          return 'secondary'
        default:
          return 'secondary'
      }
    },
    getRoleLabel(role: UserRole) {
      switch (role) {
        case 'admin':
          return 'Admin'
        case 'user':
          return 'User'
        case 'viewer':
          return 'Viewer'
        default:
          return 'Unknown'
      }
    },
    close() {
      this.isVisible = false
    },
    required(value: string) {
      return !!value || 'This field is required'
    },
    requiredSelect(value: any) {
      return !!value || 'This field is required'
    },
    email(value: string) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || 'Please enter a valid email address'
    },
  },
})
