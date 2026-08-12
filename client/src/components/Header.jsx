import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME, ROUTES } from '../utils/constants'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-500/15 text-primary-300'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
      navigate(ROUTES.HOME)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-950/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link
          to={ROUTES.HOME}
          className="text-lg font-semibold tracking-tight text-white"
        >
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <NavLink to={ROUTES.HOME} className={navLinkClass} end>
            Home
          </NavLink>

          {!loading && user ? (
            <>
              <NavLink to={ROUTES.CHAT} className={navLinkClass}>
                Chat
              </NavLink>
              <span className="hidden rounded-lg px-3 py-2 text-sm text-slate-400 sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            !loading && (
              <>
                <NavLink to={ROUTES.LOGIN} className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to={ROUTES.REGISTER} className={navLinkClass}>
                  Register
                </NavLink>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
