import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ prompt, linkText, to }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-400">
      {prompt}{' '}
      <Link
        to={to}
        className="font-medium text-primary-300 transition hover:text-primary-200"
      >
        {linkText}
      </Link>
    </p>
  )
}

export default AuthCard
