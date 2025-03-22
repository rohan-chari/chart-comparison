import auth from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { useUserStore } from 'src/stores/user-store'
import { usePortfolioStore } from 'src/stores/portfolio-store'
import { useChartStore } from 'src/stores/chart-store'

const userStore = useUserStore()
const portfolioStore = usePortfolioStore()
const chartStore = useChartStore()

const register = async (email, displayName, password) => {
  try {
    const canRegister = await checkUserExists(email, displayName)
    const message = canRegister.message

    if (canRegister.canRegister) {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update Firebase profile with display name
      await updateProfile(firebaseUser, { displayName })

      // Store user in backend
      await registerUserOnBackend(firebaseUser, displayName)

      // Store user in Pinia
      userStore.setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
      })

      return { registered: true, message }
    } else {
      return { registered: false, message }
    }
  } catch (error) {
    console.error('Registration error:', error.message)
    return { registered: false, message: 'Failed to register. Try again.' }
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    const token = await firebaseUser.getIdToken()
    userStore.setToken(token)
    // Fetch display name from backend
    const userDisplayName = await getDisplayName(firebaseUser.uid)

    // Set user in store
    userStore.setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: userDisplayName || firebaseUser.displayName || '',
    })

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
    body: JSON.stringify({ email, displayName }),
  })
  const message = await response.json()

  return response.ok
    ? { canRegister: true, message: message.message }
    : { canRegister: false, message: message.message }
}

const getDisplayName = async (userId) => {
  const response = await fetch(`${process.env.REQUEST_IP}/user/get-display-name/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await response.json()
  return data.displayName
}

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const userDisplayName = await getDisplayName(firebaseUser.uid)
    if (!userStore.getToken) {
      userStore.setToken(await firebaseUser.getIdToken())
    }

    const portfolio = await portfolioStore.getPortfolio(firebaseUser.uid, userStore.getToken)
    console.log('PORT', portfolio)
    chartStore.setPortfolio(portfolio)
    portfolioStore.setPortfolio(portfolio)
    if (portfolio.portfolioStocks.length > 0) {
      portfolioStore.setPorfolioStatistics(portfolio.portfolioStocks)
    }

    userStore.setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: userDisplayName || firebaseUser.displayName || '',
    })
  } else {
    userStore.setUser(null)
  }
})

export { register, login, logout }
