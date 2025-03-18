import auth from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { ref, onMounted } from 'vue'

const user = ref(null)

const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    user.value = userCredential.user
    await registerUserOnBackend(userCredential.user)
  } catch (error) {
    console.error('Registration error:', error.message)
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    user.value = userCredential.user
  } catch (error) {
    console.error('Login error:', error.message)
  }
}

const logout = async () => {
  await signOut(auth)
  user.value = null
}

const registerUserOnBackend = async (firebaseUser) => {
  const token = await firebaseUser.getIdToken()

  await fetch(`${process.env.REQUEST_IP}/auth/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        providerData: firebaseUser.providerData,
        createdAt: firebaseUser.metadata.creationTime,
        lastLoginAt: firebaseUser.metadata.lastSignInTime,
      },
    }),
  })
}

onMounted(() => {
  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })
})

export { user, register, login, logout }
