/**
 * Admin User Initialization Script
 * Run this script to create the initial admin user
 */

// Load environment variables
require('dotenv').config()

const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, setDoc } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    const adminEmail = process.env.VUE_APP_DEFAULT_ADMIN_EMAIL
    const adminPassword = process.env.VUE_APP_DEFAULT_ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      throw new Error('Admin email and password must be set in .env file')
    }

    // Create admin user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword,
    )

    const user = userCredential.user
    console.log('Admin user created with UID:', user.uid)

    // Create admin user profile in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      department: 'IT',
      title: 'System Administrator',
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists!')
    } else {
      console.error('Error creating admin user:', error)
    }
  }
}

// Run the script
createAdminUser()
