import { initializeApp }            from 'firebase/app'
import {
  getFirestore, collection, getDocs, addDoc,
  doc, query, orderBy
}                                     from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAraOkRAPZ6RZTgeaX3QcMFRNe9qM2FsEQ",
  authDomain: "aazad-properties.firebaseapp.com",
  projectId: "aazad-properties",
  storageBucket: "aazad-properties.appspot.com",
  messagingSenderId: "275411023313",
  appId: "1:275411023313:web:9cfaaa62b577fc1ccfdcf0",
  measurementId: "G-Y1G9PLEG3N"
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

export interface Request {
  id?        : string
  creator    : string
  title      : string
  details    : string
  status     : string
  department : string
  createdAt  : number
}

export interface Comment {
  id?       : string
  text      : string
  createdAt : number
}

const requestsCol = collection(db, 'requests')

export async function fetchRequests(
  filters?: { status?: string; department?: string; search?: string }
): Promise<Request[]> {
  let q = query(requestsCol, orderBy('createdAt', 'desc') as any)
  // Note: Firestore can only filter on one field with inequality.
  // For demonstration we'll fetch all and filter in-memory.
  const snap = await getDocs(q)
  let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Request))
  if (filters) {
    if (filters.status)    items = items.filter(r => r.status === filters.status)
    if (filters.department) items = items.filter(r => r.department === filters.department)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      items = items.filter(r =>
        r.title.toLowerCase().includes(s) ||
        r.details.toLowerCase().includes(s)
      )
    }
  }
  return items
}

export async function addRequest(req: Request): Promise<string> {
  const docRef = await addDoc(requestsCol, req)
  return docRef.id
}

export async function fetchComments(requestId: string): Promise<Comment[]> {
  const cmCol = collection(doc(db, 'requests', requestId), 'comments')
  const snap  = await getDocs(cmCol)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Comment))
}

export async function addComment(
  requestId: string, text: string
): Promise<string> {
  const cmCol = collection(doc(db, 'requests', requestId), 'comments')
  const docRef = await addDoc(cmCol, {
    text, createdAt: Date.now()
  })
  return docRef.id
}
