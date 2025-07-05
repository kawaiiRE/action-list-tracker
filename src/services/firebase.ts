import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  query,
  orderBy,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  createUserWithEmailAndPassword,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VUE_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID || '',
}

// Validate that all required environment variables are present
const requiredEnvVars = [
  'VUE_APP_FIREBASE_API_KEY',
  'VUE_APP_FIREBASE_AUTH_DOMAIN',
  'VUE_APP_FIREBASE_PROJECT_ID',
  'VUE_APP_FIREBASE_STORAGE_BUCKET',
  'VUE_APP_FIREBASE_MESSAGING_SENDER_ID',
  'VUE_APP_FIREBASE_APP_ID',
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file and ensure all Firebase configuration variables are set.',
  )
}

const firebaseApp = initializeApp(firebaseConfig)
const firestore = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

export type UserRole = 'viewer' | 'user' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  department: string
  title: string
  role: UserRole
  createdAt: number
  updatedAt?: number
}

export interface ActionRequest {
  id?: string
  creatorId: string
  creatorName: string
  title: string
  details: string
  status: string
  department: string
  createdAt: number
  updatedAt?: number
  comments?: RequestComment[]
}

export interface RequestComment {
  id?: string
  text: string
  authorId: string
  authorName: string
  createdAt: number
}

// Auth functions
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    )
    return userCredential.user
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback)
}

export function getCurrentUser() {
  return auth.currentUser
}

// Permission functions
const SUPERADMIN_EMAIL = process.env.VUE_APP_SUPERADMIN_EMAIL

export function isSuperAdmin(email?: string | null): boolean {
  if (!SUPERADMIN_EMAIL) {
    console.warn('VUE_APP_SUPERADMIN_EMAIL environment variable is not set')
    return false
  }
  return email === SUPERADMIN_EMAIL
}

export function hasPermission(
  userRole: UserRole,
  permission: string,
  userEmail?: string | null,
): boolean {
  // Superadmin has all permissions
  if (isSuperAdmin(userEmail)) {
    return true
  }

  const permissions = {
    viewer: ['view'],
    user: ['view', 'create', 'comment', 'edit_own', 'delete_own'],
    admin: [
      'view',
      'create',
      'comment',
      'edit_own',
      'delete_own',
      'edit_all',
      'delete_all',
      'manage_users',
    ],
  }

  return permissions[userRole]?.includes(permission) || false
}

export function canViewOnly(
  userRole: UserRole,
  userEmail?: string | null,
): boolean {
  // Superadmin is never view-only
  if (isSuperAdmin(userEmail)) {
    return false
  }
  return userRole === 'viewer'
}

export function canManageUsers(
  userRole: UserRole,
  userEmail?: string | null,
): boolean {
  // Superadmin can always manage users
  if (isSuperAdmin(userEmail)) {
    return true
  }
  return userRole === 'admin'
}

// Admin user management functions
export async function getAllUsers(): Promise<UserProfile[]> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to access users')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile || !canManageUsers(userProfile.role, userProfile.email)) {
    throw new Error('Insufficient permissions to access users')
  }

  try {
    const usersCollection = collection(firestore, 'users')
    const querySnapshot = await getDocs(usersCollection)

    return querySnapshot.docs.map(
      (doc) =>
        ({
          uid: doc.id,
          ...doc.data(),
        } as UserProfile),
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function createUser(
  email: string,
  password: string,
  profile: Omit<UserProfile, 'uid' | 'email' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to create users')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile || !canManageUsers(userProfile.role, userProfile.email)) {
    throw new Error('Insufficient permissions to create users')
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )
    const newUser = userCredential.user

    await createUserProfile({
      uid: newUser.uid,
      email: newUser.email || email,
      ...profile,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUserRole(
  uid: string,
  role: UserRole,
): Promise<void> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to update user roles')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile || !canManageUsers(userProfile.role, userProfile.email)) {
    throw new Error('Insufficient permissions to update user roles')
  }

  try {
    await updateUserProfile(uid, { role })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

export async function deleteUser(uid: string): Promise<void> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to delete users')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile || !canManageUsers(userProfile.role, userProfile.email)) {
    throw new Error('Insufficient permissions to delete users')
  }

  try {
    const userDoc = doc(firestore, 'users', uid)
    await deleteDoc(userDoc)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function initializeAdminUser(): Promise<void> {
  try {
    // Check if admin user already exists
    const adminUser = await getUserProfile('admin-user-id')
    if (adminUser) {
      return // Admin user already exists
    }

    // Create admin user
    await createUserWithEmailAndPassword(
      auth,
      process.env.VUE_APP_DEFAULT_ADMIN_EMAIL || '',
      process.env.VUE_APP_DEFAULT_ADMIN_PASSWORD || '',
    )

    // Note: In a real application, you would want to handle this differently
    // as we can't easily get the UID of the created user in this context
    // For now, we'll create a script to initialize the admin user
  } catch (error) {
    console.error('Error initializing admin user:', error)
  }
}

// User Profile functions
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = doc(firestore, 'users', uid)
    const docSnapshot = await getDoc(userDoc)

    if (!docSnapshot.exists()) {
      return null
    }

    return { uid, ...docSnapshot.data() } as UserProfile
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

export async function createUserProfile(
  profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>,
): Promise<void> {
  try {
    const userDoc = doc(firestore, 'users', profile.uid)
    await setDoc(userDoc, {
      ...profile,
      role: profile.role || 'user', // Default role is 'user'
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>,
): Promise<void> {
  try {
    const userDoc = doc(firestore, 'users', uid)
    await updateDoc(userDoc, {
      ...updates,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

const requestsCollection = collection(firestore, 'requests')

export async function getAllRequests(filters?: {
  status?: string
  department?: string
  search?: string
}): Promise<ActionRequest[]> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to access requests')
  }

  try {
    let requestQuery = query(
      requestsCollection,
      orderBy('createdAt', 'desc') as any,
    )

    // Note: Firestore can only filter on one field with inequality.
    // For demonstration we'll fetch all and filter in-memory.
    const querySnapshot = await getDocs(requestQuery)

    let requestList = querySnapshot.docs.map(
      (document) =>
        ({ id: document.id, ...(document.data() as any) } as ActionRequest),
    )

    if (filters) {
      if (filters.status)
        requestList = requestList.filter(
          (request) => request.status === filters.status,
        )
      if (filters.department)
        requestList = requestList.filter(
          (request) => request.department === filters.department,
        )
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        requestList = requestList.filter(
          (request) =>
            request.title.toLowerCase().includes(searchTerm) ||
            request.details.toLowerCase().includes(searchTerm),
        )
      }
    }

    return requestList
  } catch (error) {
    console.error('Error fetching requests:', error)
    throw error
  }
}

export async function createNewRequest(
  requestData: Omit<
    ActionRequest,
    'id' | 'createdAt' | 'creatorId' | 'creatorName'
  >,
): Promise<string> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to create requests')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile) {
    throw new Error('User profile not found')
  }

  if (!hasPermission(userProfile.role, 'create', userProfile.email)) {
    throw new Error('Insufficient permissions to create requests')
  }

  const fullRequestData = {
    ...requestData,
    creatorId: currentUser.uid,
    creatorName: `${userProfile.firstName} ${userProfile.lastName}`,
    createdAt: Date.now(),
  }

  const documentReference = await addDoc(requestsCollection, fullRequestData)
  return documentReference.id
}

export async function getRequestComments(
  requestId: string,
): Promise<RequestComment[]> {
  const commentsCollection = collection(
    doc(firestore, 'requests', requestId),
    'comments',
  )
  const querySnapshot = await getDocs(commentsCollection)
  return querySnapshot.docs.map(
    (document) =>
      ({ id: document.id, ...(document.data() as any) } as RequestComment),
  )
}

export async function getRequestById(
  requestId: string,
): Promise<ActionRequest | null> {
  try {
    const requestDoc = doc(firestore, 'requests', requestId)
    const docSnapshot = await getDoc(requestDoc)

    if (!docSnapshot.exists()) {
      return null
    }

    const requestData = {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as ActionRequest

    // Also fetch comments for this request
    const comments = await getRequestComments(requestId)
    requestData.comments = comments

    return requestData
  } catch (error) {
    console.error('Error fetching request by ID:', error)
    throw error
  }
}

export async function deleteRequest(requestId: string): Promise<void> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to delete requests')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check if user can delete all requests or only their own
  if (!hasPermission(userProfile.role, 'delete_all', userProfile.email)) {
    // Check if user owns this request
    const request = await getRequestById(requestId)
    if (!request || request.creatorId !== currentUser.uid) {
      throw new Error('Insufficient permissions to delete this request')
    }

    if (!hasPermission(userProfile.role, 'delete_own', userProfile.email)) {
      throw new Error('Insufficient permissions to delete requests')
    }
  }

  try {
    const requestDoc = doc(firestore, 'requests', requestId)
    await deleteDoc(requestDoc)
  } catch (error) {
    console.error('Error deleting request:', error)
    throw error
  }
}

export async function updateRequest(
  requestId: string,
  updates: Partial<ActionRequest>,
): Promise<void> {
  try {
    const requestDoc = doc(firestore, 'requests', requestId)
    await updateDoc(requestDoc, {
      ...updates,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error('Error updating request:', error)
    throw error
  }
}

export async function addCommentToRequest(
  requestId: string,
  commentText: string,
): Promise<string> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to add comments')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile) {
    throw new Error('User profile not found')
  }

  if (!hasPermission(userProfile.role, 'comment', userProfile.email)) {
    throw new Error('Insufficient permissions to add comments')
  }

  const commentsCollection = collection(
    doc(firestore, 'requests', requestId),
    'comments',
  )
  const documentReference = await addDoc(commentsCollection, {
    text: commentText,
    authorId: currentUser.uid,
    authorName: `${userProfile.firstName} ${userProfile.lastName}`,
    createdAt: Date.now(),
  })
  return documentReference.id
}

export async function deleteComment(
  requestId: string,
  commentId: string,
): Promise<void> {
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('User must be authenticated to delete comments')
  }

  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check if user can delete all comments or only their own
  if (!hasPermission(userProfile.role, 'delete_all', userProfile.email)) {
    // Get comment to check ownership
    const commentDoc = doc(
      firestore,
      'requests',
      requestId,
      'comments',
      commentId,
    )
    const commentSnapshot = await getDoc(commentDoc)

    if (!commentSnapshot.exists()) {
      throw new Error('Comment not found')
    }

    const comment = commentSnapshot.data()
    if (comment.authorId !== currentUser.uid) {
      throw new Error('Insufficient permissions to delete this comment')
    }

    if (!hasPermission(userProfile.role, 'delete_own', userProfile.email)) {
      throw new Error('Insufficient permissions to delete comments')
    }
  }

  try {
    const commentDoc = doc(
      firestore,
      'requests',
      requestId,
      'comments',
      commentId,
    )
    await deleteDoc(commentDoc)
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
