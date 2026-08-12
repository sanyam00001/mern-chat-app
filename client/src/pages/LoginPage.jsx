import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthCard, { AuthFooterLink } from '../components/AuthCard'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../utils/constants'
import { validateLoginForm } from '../utils/validation'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectPath = location.state?.from?.pathname || ROUTES.CHAT

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({ ...previous, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({ ...previous, [name]: undefined }))
    }

    if (apiError) {
      setApiError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = validateLoginForm(formData)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setApiError('')
    setIsSubmitting(true)

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      })
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue chatting."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {apiError && (
          <div
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <FormField
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <FormField
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <AuthFooterLink
        prompt="Don't have an account?"
        linkText="Create one"
        to={ROUTES.REGISTER}
      />
    </AuthCard>
  )
}

export default LoginPage
