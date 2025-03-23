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
import { ref } from 'vue'

const userStore = useUserStore()
const portfolioStore = usePortfolioStore()
const chartStore = useChartStore()

const isRegistering = ref(false)
const alreadyLoadedUser = ref(false)

const register = async (email, displayName, password) => {
  try {
    const canRegister = await checkUserExists(email, displayName)
    const message = canRegister.message

    if (canRegister.canRegister) {
      isRegistering.value = true

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      const token = await firebaseUser.getIdToken()
      userStore.setToken(token)

      await updateProfile(firebaseUser, { displayName })
      await registerUserOnBackend(firebaseUser, displayName)

      userStore.setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
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
    isRegistering.value = false
    alreadyLoadedUser.value = false
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    const token = await firebaseUser.getIdToken()
    userStore.setToken(token)

    const userDisplayName = await getDisplayName(firebaseUser.uid)

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
  userStore.handleLogout()
  portfolioStore.handleLogout()
  chartStore.handleLogout()
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
        displayName,
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
  if (isRegistering.value) return

  if (firebaseUser && alreadyLoadedUser.value == false) {
    const userDisplayName = await getDisplayName(firebaseUser.uid)
    if (!userStore.getToken) {
      userStore.setToken(await firebaseUser.getIdToken())
    }

    const portfolio = await portfolioStore.getPortfolio(firebaseUser.uid, userStore.getToken)

    chartStore.setPortfolio(portfolio)
    chartStore.setComparisonStocks(portfolio.comparisonStocks)
    chartStore.applyChartFilters()
    portfolioStore.setPortfolio(portfolio)

    const portfolioStatistics = await portfolioStore.performPortfolioCalculations(
      ref({
        from: portfolio.startDate,
        to: portfolio.endDate,
      }),
    )
    portfolioStore.setPorfolioStatistics(portfolioStatistics)

    userStore.setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: userDisplayName || firebaseUser.displayName || '',
    })
    alreadyLoadedUser.value = true
  } else {
    userStore.setUser(null)
  }
})

export { register, login, logout }
