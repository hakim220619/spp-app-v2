// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie' // Import js-cookie

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'
import axiosConfig from 'src/configs/axiosConfig'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (router.pathname == '/ppdb') {
      router.push('/ppdb')
      setLoading(false)
    } else if (router.pathname == '/ppdb/login') {
      router.push('/ppdb/login')
      setLoading(false)
    } else if (router.pathname.startsWith('/ppdb/dahsboard') && id) {
      router.push(`/ppdb/dahsboard/${id}`)
      setLoading(false)
    } else if (router.pathname.startsWith('/resetPassword') && id) {
      // Jika path adalah '/resetPassword/[id]' dan terdapat id
      router.push(`/resetPassword/${id}`)
      setLoading(false)

      return
    } else {
      const initAuth = async (): Promise<void> => {
        const storedToken = window.localStorage.getItem('token')
        const userData = window.localStorage.getItem('userData')
        const refreshToken = window.localStorage.getItem('refreshToken')

        if (storedToken && userData && refreshToken) {
          setLoading(true)
          await checkLogin(storedToken)
        } else {
          setLoading(false)
          router.replace('/login')
        }
      }

      const checkLogin = async (token: string): Promise<void> => {
        setLoading(true)
        try {
          const response = await axiosConfig.get('/checklogin', {
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + token
            }
          })
          setLoading(false)
          setUser({ ...response.data.userData })
        } catch (error) {
          handleAuthError(error)
        } finally {
          setLoading(false)
        }
      }

      const handleAuthError = async (error: any) => {
        localStorage.removeItem('userData')
        setUser(null)

        if (error.response) {
          const errorMessage = error.response.data.message

          if (errorMessage === 'Invalid token') {
            // Attempt to refresh token if "Invalid token"
            await refreshAccessToken()
          } else {
            // Handle other errors
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
          }
        } else {
          console.error('Authentication error:', error) // Log unknown errors
          router.replace('/login') // Redirect to login for other errors
        }
      }

      const refreshAccessToken = async (): Promise<void> => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          await axiosConfig.post(
            '/logout',
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            }
          )
          router.replace('/login')

          return
        }

        try {
          const storedToken = localStorage.getItem('token')
          const response = await axiosConfig.get('/refresh-token', {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${storedToken}`
            }
          })

          const newAccessToken = response.data.accessToken
          const userData = response.data.userData

          // Update local storage
          window.localStorage.setItem('token', newAccessToken)
          window.localStorage.setItem('userData', JSON.stringify(userData))

          // Set cookies for token and userData
          Cookies.set('token', newAccessToken, { expires: 7 }) // Set cookie for 7 days
          Cookies.set('userData', JSON.stringify(userData), { expires: 7 }) // Set cookie for 7 days

          setUser({ ...userData })
        } catch (error) {
          console.error('Failed to refresh token:', error) // Log refresh token errors
          handleLogout()
        }
      }

      initAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axiosConfig
      .post('/login', params)
      .then(async response => {
        console.log(response)

        if (params.rememberMe) {
          window.localStorage.setItem('token', response.data.accessToken)
          window.localStorage.setItem('refreshToken', response.data.refreshToken) // Ensure to store refresh token
          window.localStorage.setItem('userData', JSON.stringify(response.data.userData))

          // Set cookies for token and userData
          Cookies.set('token', response.data.accessToken, { expires: 7 }) // Set cookie for 7 days
          Cookies.set('userData', JSON.stringify(response.data.userData), { expires: 7 }) // Set cookie for 7 days
        }

        const returnUrl = router.query.returnUrl
        setUser({ ...response.data.userData })

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = async () => {
    // Get token from localStorage
    let token = window.localStorage.getItem('token')

    // Check if token is null; if so, use refreshToken
    if (!token) {
      token = window.localStorage.getItem('refreshToken')
    }

    try {
      // Send logout request to the API with token or refreshToken in headers
      await axiosConfig.post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Clear user data
      setUser(null)
      window.localStorage.removeItem('userData')
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('refreshToken')

      // Remove cookies
      Cookies.remove('token')
      Cookies.remove('userData')

      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
