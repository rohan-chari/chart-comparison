import auth from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()

const register = async (email, displayName, password) => {
  try {
    const canRegister = await checkUserExists(email, displayName)
    const message = canRegister.message
    if (canRegister.canRegister) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      userStore.setUser(userCredential.user)
      await registerUserOnBackend(userCredential.user, displayName)
      return { registered: true, message: message }
    } else {
      return { registered: false, message: message }
    }
  } catch (error) {
    console.error('Registration error:', error.message)
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    userStore.setUser(userCredential.user)
    return { success: true, message: 'Logged in Successfully!' }
  } catch (error) {
    console.error('Login error:', error.message)
    return { success: false, message: 'Invalid Credentials. Please try again' }
  }
}

const logout = async () => {
  await signOut(auth)
  userStore.setUser(null)
}

const registerUserOnBackend = async (firebaseUser, displayName) => {
  const token = await firebaseUser.getIdToken()

  await fetch(`${process.env.REQUEST_IP}/auth/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: {
        displayName: displayName,
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

const checkUserExists = async (email, displayName) => {
  const response = await fetch(`${process.env.REQUEST_IP}/auth/existing-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      displayName: displayName,
    }),
  })
  const message = await response.json()

  if (!response.ok) {
    return { canRegister: false, message: message.message }
  }
  return { canRegister: true, message: message.message }
}

onAuthStateChanged(auth, (firebaseUser) => {
  userStore.setUser(firebaseUser)
})

export { register, login, logout }
