import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'

    const data = error.response?.data

    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        const text = await data.text()
        const parsed = JSON.parse(text)
        message = parsed.message || message
      } catch {
        // Keep the fallback message when the error body is not JSON.
      }
    }

    return Promise.reject(new Error(message))
  },
)

export default api
