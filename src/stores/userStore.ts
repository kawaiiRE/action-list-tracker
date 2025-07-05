import { reactive, computed } from 'vue'
import {
  onAuthStateChanged,
  signOut,
  getUserProfile,
  updateUserProfile,
  createUserProfile,
  getCurrentUser,
  hasPermission,
  canViewOnly,
  canManageUsers,
  isSuperAdmin,
  type UserProfile,
  type UserRole,
} from '@/services/firebase'

// Types for localStorage data (only non-sensitive info)
interface StoredUserSession {
  uid: string
  email: string
  lastLoginTime: number
  rememberMe: boolean
}

interface UserState {
  isAuthenticated: boolean
  user: UserProfile | null
  loading: boolean
  error: string | null
  sessionExpired: boolean
}

// Create reactive state
const state = reactive<UserState>({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  sessionExpired: false,
})

// Constants
const STORAGE_KEY = 'action_tracker_user_session'
const SESSION_DURATION =
  parseInt(process.env.VUE_APP_SESSION_DURATION_DAYS || '7', 10) *
  24 *
  60 *
  60 *
  1000 // Configurable session duration

class UserStore {
  // Computed properties for permissions
  get canCreateRequests(): boolean {
    return state.user
      ? hasPermission(state.user.role, 'create', state.user.email)
      : false
  }

  get canComment(): boolean {
    return state.user
      ? hasPermission(state.user.role, 'comment', state.user.email)
      : false
  }

  get canDelete(): boolean {
    return state.user
      ? hasPermission(state.user.role, 'delete_own', state.user.email)
      : false
  }

  get canDeleteAll(): boolean {
    return state.user
      ? hasPermission(state.user.role, 'delete_all', state.user.email)
      : false
  }

  get canManageUsers(): boolean {
    return state.user
      ? canManageUsers(state.user.role, state.user.email)
      : false
  }

  get isViewOnly(): boolean {
    return state.user ? canViewOnly(state.user.role, state.user.email) : false
  }

  get isSuperAdmin(): boolean {
    return state.user ? isSuperAdmin(state.user.email) : false
  }

  get isAuthenticated(): boolean {
    return state.isAuthenticated
  }

  get user(): UserProfile | null {
    return state.user
  }

  get loading(): boolean {
    return state.loading
  }

  get error(): string | null {
    return state.error
  }

  get sessionExpired(): boolean {
    return state.sessionExpired
  }

  // Initialize store and set up auth listener
  async initialize(): Promise<void> {
    state.loading = true
    state.error = null

    try {
      // Check for existing session in localStorage
      const storedSession = this.getStoredSession()

      if (storedSession && this.isSessionValid(storedSession)) {
        // Session exists and is valid, wait for Firebase auth to restore
        state.loading = true
      } else {
        // Clear invalid session
        this.clearStoredSession()
      }

      // Set up Firebase auth state listener
      onAuthStateChanged(async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // User is authenticated
            await this.handleAuthenticatedUser(
              firebaseUser.uid,
              firebaseUser.email || '',
            )
          } else {
            // User is not authenticated
            await this.handleUnauthenticatedUser()
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          state.error = 'Authentication error occurred'
        } finally {
          state.loading = false
        }
      })
    } catch (error) {
      console.error('Error initializing user store:', error)
      state.error = 'Failed to initialize authentication'
      state.loading = false
    }
  }

  // Handle authenticated user
  private async handleAuthenticatedUser(
    uid: string,
    email: string,
  ): Promise<void> {
    try {
      // Load user profile from Firebase
      const userProfile = await getUserProfile(uid)

      if (userProfile) {
        state.user = userProfile
        state.isAuthenticated = true
        state.sessionExpired = false

        // Store session info in localStorage (non-sensitive data only)
        this.storeUserSession({
          uid,
          email,
          lastLoginTime: Date.now(),
          rememberMe: true,
        })
      } else {
        // User profile doesn't exist, needs to be created
        state.user = null
        state.isAuthenticated = true // Still authenticated but profile incomplete
        state.sessionExpired = false
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      state.error = 'Failed to load user profile'
      await this.logout()
    }
  }

  // Handle unauthenticated user
  private async handleUnauthenticatedUser(): Promise<void> {
    const storedSession = this.getStoredSession()

    if (storedSession && this.isSessionValid(storedSession)) {
      // Session was valid but Firebase auth expired
      state.sessionExpired = true
      state.error = 'Your session has expired. Please log in again.'
    }

    // Clear user state
    state.user = null
    state.isAuthenticated = false
    this.clearStoredSession()
  }

  // Create or update user profile
  async saveUserProfile(profileData: Partial<UserProfile>): Promise<void> {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User must be authenticated to save profile')
    }

    state.loading = true
    state.error = null

    try {
      if (!state.user) {
        // Create new profile
        const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          department: profileData.department || '',
          title: profileData.title || '',
          role: profileData.role || 'user',
        }

        await createUserProfile(newProfile)
      } else {
        // Update existing profile
        await updateUserProfile(currentUser.uid, profileData)
      }

      // Reload user profile
      const updatedProfile = await getUserProfile(currentUser.uid)
      if (updatedProfile) {
        state.user = updatedProfile
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
      state.error = 'Failed to save user profile'
      throw error
    } finally {
      state.loading = false
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      // Clear state regardless of Firebase signOut success
      state.user = null
      state.isAuthenticated = false
      state.sessionExpired = false
      state.error = null
      this.clearStoredSession()
    }
  }

  // Clear error state
  clearError(): void {
    state.error = null
    state.sessionExpired = false
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    return state.user
      ? hasPermission(state.user.role, permission, state.user.email)
      : false
  }

  // Check if user has specific role
  hasRole(role: UserRole): boolean {
    return state.user ? state.user.role === role : false
  }

  // Private methods for localStorage management
  private storeUserSession(session: StoredUserSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
      console.warn('Failed to store user session:', error)
    }
  }

  private getStoredSession(): StoredUserSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to get stored session:', error)
      return null
    }
  }

  private clearStoredSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear stored session:', error)
    }
  }

  private isSessionValid(session: StoredUserSession): boolean {
    const now = Date.now()
    const sessionAge = now - session.lastLoginTime
    return sessionAge < SESSION_DURATION
  }
}

// Export singleton instance
export const userStore = new UserStore()

// Export reactive state for direct access in components
export const userState = state
