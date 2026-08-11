import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

function PlaceholderPage({ title, description }) {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary-400">
        Coming soon
      </p>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-md text-slate-400">{description}</p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 inline-flex rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default PlaceholderPage
