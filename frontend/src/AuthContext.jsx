import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken, setToken, removeToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, verify existing token by fetching profile
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.profile()
      .then((data) => setUser(data))
      .catch(() => removeToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api.login(email, password)
    if (!data?.token) throw new Error('Login failed: no token received')
    setToken(data.token)
    const profile = await api.profile()
    setUser(profile)
  }

  async function loginWithToken(token) {
    setToken(token)
    const profile = await api.profile()
    setUser(profile)
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
