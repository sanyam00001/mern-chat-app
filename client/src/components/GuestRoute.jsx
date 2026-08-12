import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../utils/constants'
import LoadingSpinner from './LoadingSpinner'

function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner label="Checking authentication..." />
  }

  if (user) {
    return <Navigate to={ROUTES.CHAT} replace />
  }

  return children
}

export default GuestRoute
