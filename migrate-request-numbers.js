const { initializeApp } = require('firebase/app')
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  query,
  orderBy,
} = require('firebase/firestore')

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDjy_L6HYpRVdMjKZNjU8qL-sNfAeSz5yY',
  authDomain: 'vue-project-8b47e.firebaseapp.com',
  projectId: 'vue-project-8b47e',
  storageBucket: 'vue-project-8b47e.appspot.com',
  messagingSenderId: '994036245616',
  appId: '1:994036245616:web:8b8e41e14dd6f24a2b88f5',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)

async function migrateRequestNumbers() {
  try {
    console.log('🚀 Starting request number migration...')

    // Get all requests ordered by creation date
    const requestsCollection = collection(firestore, 'requests')
    const requestQuery = query(requestsCollection, orderBy('createdAt', 'asc'))
    const querySnapshot = await getDocs(requestQuery)

    console.log(`📊 Found ${querySnapshot.docs.length} requests to migrate`)

    let requestNumber = 1

    for (const docSnapshot of querySnapshot.docs) {
      const requestData = docSnapshot.data()

      // Only update if requestNumber doesn't exist
      if (!requestData.requestNumber) {
        console.log(
          `🔄 Updating request ${docSnapshot.id} with number ${requestNumber}`,
        )

        await updateDoc(doc(firestore, 'requests', docSnapshot.id), {
          requestNumber: requestNumber,
        })

        requestNumber++
      } else {
        console.log(
          `✅ Request ${docSnapshot.id} already has number ${requestData.requestNumber}`,
        )
        requestNumber = Math.max(requestNumber, requestData.requestNumber + 1)
      }
    }

    // Set the counter for future requests
    const counterDocRef = doc(firestore, 'metadata', 'requestCounter')
    await setDoc(counterDocRef, { nextNumber: requestNumber })

    console.log(
      `✅ Migration completed! Next request number will be: ${requestNumber}`,
    )
    console.log('🎉 All requests now have sequential numbers!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

migrateRequestNumbers()
  .then(() => {
    console.log('🏁 Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error)
    process.exit(1)
  })
