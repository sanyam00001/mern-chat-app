import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} from './constants'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6
export const MIN_NAME_LENGTH = 2

export const validateRegisterForm = ({
  name,
  email,
  password,
  confirmPassword,
}) => {
  const errors = {}

  if (!name?.trim()) {
    errors.name = 'Name is required'
  } else if (name.trim().length < MIN_NAME_LENGTH) {
    errors.name = `Name must be at least ${MIN_NAME_LENGTH} characters`
  }

  if (!email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please provide a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export const validateLoginForm = ({ email, password }) => {
  const errors = {}

  if (!email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please provide a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  }

  return errors
}

const getFileExtension = (filename) => {
  const name = filename || ''
  const index = name.lastIndexOf('.')

  if (index < 0) {
    return ''
  }

  return name.slice(index).toLowerCase()
}

export const validateUploadFile = (file) => {
  if (!file) {
    return 'Please select a file'
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return 'Uploaded file is empty'
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File is too large. Maximum size is 10MB'
  }

  const extension = getFileExtension(file.name)

  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
    return 'This file type is not allowed'
  }

  return ''
}
