/**
 * Admin User Initialization Script
 * Run this script to create the initial admin user
 */

const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, setDoc } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: 'AIzaSyAraOkRAPZ6RZTgeaX3QcMFRNe9qM2FsEQ',
  authDomain: 'aazad-properties.firebaseapp.com',
  projectId: 'aazad-properties',
  storageBucket: 'aazad-properties.appspot.com',
  messagingSenderId: '275411023313',
  appId: '1:275411023313:web:9cfaaa62b577fc1ccfdcf0',
  measurementId: 'G-Y1G9PLEG3N',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    // Create admin user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@admin.com',
      'admin1234',
    )

    const user = userCredential.user
    console.log('Admin user created with UID:', user.uid)

    // Create admin user profile in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      email: 'admin@admin.com',
      firstName: 'Admin',
      lastName: 'User',
      department: 'IT',
      title: 'System Administrator',
      role: 'admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    console.log('Admin user profile created successfully!')
    console.log('Admin login credentials:')
    console.log('Email: admin@admin.com')
    console.log('Password: admin1234')
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists!')
      console.log('Login credentials:')
      console.log('Email: admin@admin.com')
      console.log('Password: admin1234')
    } else {
      console.error('Error creating admin user:', error)
    }
  }
}

// Run the script
createAdminUser()
