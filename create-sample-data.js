// Run this script to create sample data in your Firestore database
// Run with: node create-sample-data.js

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc } = require('firebase/firestore')

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
const db = getFirestore(app)

async function createSampleData() {
  try {
    console.log('Creating sample requests...')

    const sampleRequests = [
      {
        creator: 'John Doe',
        title: 'Website Update Request',
        details:
          'Need to update the company homepage with new product information',
        status: 'Open',
        department: 'Sales',
        createdAt: Date.now() - 86400000, // 1 day ago
      },
      {
        creator: 'Jane Smith',
        title: 'Legal Document Review',
        details: 'Contract needs legal review before signing with new vendor',
        status: 'In-Progress',
        department: 'Legal',
        createdAt: Date.now() - 43200000, // 12 hours ago
      },
      {
        creator: 'Bob Johnson',
        title: 'Budget Approval',
        details: 'Marketing campaign budget requires finance approval',
        status: 'Open',
        department: 'Finance',
        createdAt: Date.now() - 7200000, // 2 hours ago
      },
      {
        creator: 'Alice Wilson',
        title: 'Server Maintenance',
        details: 'Schedule maintenance window for server updates',
        status: 'Closed',
        department: 'Other',
        createdAt: Date.now() - 172800000, // 2 days ago
      },
    ]

    const requestsCollection = collection(db, 'requests')

    for (const request of sampleRequests) {
      const docRef = await addDoc(requestsCollection, request)
      console.log(`Created request with ID: ${docRef.id}`)
    }

    console.log('✅ Sample data created successfully!')
    console.log('You can now view your requests in the app.')
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

createSampleData()
