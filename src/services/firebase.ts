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
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAraOkRAPZ6RZTgeaX3QcMFRNe9qM2FsEQ',
  authDomain: 'aazad-properties.firebaseapp.com',
  projectId: 'aazad-properties',
  storageBucket: 'aazad-properties.appspot.com',
  messagingSenderId: '275411023313',
  appId: '1:275411023313:web:9cfaaa62b577fc1ccfdcf0',
  measurementId: 'G-Y1G9PLEG3N',
}

const firebaseApp = initializeApp(firebaseConfig)
const firestore = getFirestore(firebaseApp)

export interface ActionRequest {
  id?: string
  creator: string
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
  author: string
  createdAt: number
}

const requestsCollection = collection(firestore, 'requests')

export async function getAllRequests(filters?: {
  status?: string
  department?: string
  search?: string
}): Promise<ActionRequest[]> {
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
  requestData: ActionRequest,
): Promise<string> {
  const documentReference = await addDoc(requestsCollection, requestData)
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
  author: string = 'Anonymous',
): Promise<string> {
  const commentsCollection = collection(
    doc(firestore, 'requests', requestId),
    'comments',
  )
  const documentReference = await addDoc(commentsCollection, {
    text: commentText,
    author: author,
    createdAt: Date.now(),
  })
  return documentReference.id
}

export async function deleteComment(
  requestId: string,
  commentId: string,
): Promise<void> {
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
