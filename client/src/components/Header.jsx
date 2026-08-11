import { Link, NavLink } from 'react-router-dom'
import { APP_NAME, ROUTES } from '../utils/constants'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-500/15 text-primary-300'
      : 'text-slate-300 hover:bg-white/5 hover:text-white',
  ].join(' ')

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-950/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
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
          <NavLink to={ROUTES.LOGIN} className={navLinkClass}>
            Login
          </NavLink>
          <NavLink to={ROUTES.REGISTER} className={navLinkClass}>
            Register
          </NavLink>
          <NavLink to={ROUTES.CHAT} className={navLinkClass}>
            Chat
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
