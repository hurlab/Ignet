import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Login() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '', username: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // If already logged in, show profile info + logout button
  if (auth?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-navy">Your Profile</h2>
          {auth.user.username && (
            <div>
              <span className="text-xs font-medium text-gray-500">Username</span>
              <p className="text-sm text-gray-800">{auth.user.username}</p>
            </div>
          )}
          {auth.user.email && (
            <div>
              <span className="text-xs font-medium text-gray-500">Email</span>
              <p className="text-sm text-gray-800">{auth.user.email}</p>
            </div>
          )}
          <button
            onClick={() => { auth.logout(); navigate('/') }}
            className="w-full bg-navy hover:bg-navy-dark text-white font-semibold py-2 rounded text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await auth.login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const response = await api.register(form.username, form.email, form.password)
      if (response?.token) {
        await auth.loginWithToken(response.token)
        navigate('/')
      } else {
        setTab('signin')
        setError(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Tabs */}
        <div role="tablist" aria-label="Authentication options" className="flex border-b border-gray-200">
          {[
            { key: 'signin', label: 'Sign In', panelId: 'panel-signin' },
            { key: 'register', label: 'Register', panelId: 'panel-register' },
          ].map(({ key, label, panelId }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              aria-controls={panelId}
              id={`tab-${key}`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => { setTab(key); setError(null) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') { setTab('register'); setError(null) }
                if (e.key === 'ArrowLeft') { setTab('signin'); setError(null) }
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-b-2 border-navy text-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <ErrorMessage message={error} />

          <div
            id="panel-signin"
            role="tabpanel"
            aria-labelledby="tab-signin"
            hidden={tab !== 'signin'}
          >
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4 mt-3" aria-describedby={error ? 'login-error' : undefined} noValidate>
                <div>
                  <label htmlFor="signin-email" className={labelClass}>Email</label>
                  <input
                    id="signin-email"
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    required
                    aria-required="true"
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className={labelClass}>Password</label>
                  <input
                    id="signin-password"
                    type="password"
                    value={form.password}
                    onChange={updateField('password')}
                    required
                    aria-required="true"
                    className={inputClass}
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold py-2 rounded text-sm transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          <div
            id="panel-register"
            role="tabpanel"
            aria-labelledby="tab-register"
            hidden={tab !== 'register'}
          >
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 mt-3" aria-describedby={error ? 'login-error' : undefined} noValidate>
                <div>
                  <label htmlFor="reg-username" className={labelClass}>Username</label>
                  <input
                    id="reg-username"
                    type="text"
                    value={form.username}
                    onChange={updateField('username')}
                    required
                    aria-required="true"
                    className={inputClass}
                    placeholder="username"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className={labelClass}>Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    required
                    aria-required="true"
                    className={inputClass}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="reg-password" className={labelClass}>Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    value={form.password}
                    onChange={updateField('password')}
                    required
                    aria-required="true"
                    className={inputClass}
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="reg-confirm" className={labelClass}>Confirm Password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={form.confirm}
                    onChange={updateField('confirm')}
                    required
                    aria-required="true"
                    aria-describedby={form.confirm && form.password !== form.confirm ? 'confirm-error' : undefined}
                    className={inputClass}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                  {form.confirm && form.password !== form.confirm && (
                    <p id="confirm-error" className="text-xs text-red-600 mt-1" role="alert">
                      Passwords do not match
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy hover:bg-navy-dark disabled:opacity-50 text-white font-semibold py-2 rounded text-sm transition-colors"
                >
                  {loading ? 'Registering...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
