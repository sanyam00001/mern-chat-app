import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'

function NotFoundPage() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-bold text-primary-500">404</p>
      <h1 className="mt-4 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-4 max-w-md text-slate-400">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 inline-flex rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFoundPage
