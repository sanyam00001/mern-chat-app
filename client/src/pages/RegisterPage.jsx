import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthCard, { AuthFooterLink } from '../components/AuthCard'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../utils/constants'
import { validateRegisterForm } from '../utils/validation'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    const errors = validateRegisterForm(formData)

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setApiError('')
    setIsSubmitting(true)

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      navigate(ROUTES.CHAT, { replace: true })
    } catch (error) {
      setApiError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join MERN Chat and start connecting with others."
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
          label="Name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          disabled={isSubmitting}
        />

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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <FormField
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <AuthFooterLink
        prompt="Already have an account?"
        linkText="Sign in"
        to={ROUTES.LOGIN}
      />
    </AuthCard>
  )
}

export default RegisterPage
