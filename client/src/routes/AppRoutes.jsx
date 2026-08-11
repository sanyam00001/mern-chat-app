import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import PlaceholderPage from '../pages/PlaceholderPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <PlaceholderPage
              title="Login"
              description="Authentication UI will be implemented in a future step."
            />
          }
        />
        <Route
          path="register"
          element={
            <PlaceholderPage
              title="Register"
              description="Registration UI will be implemented in a future step."
            />
          }
        />
        <Route
          path="chat"
          element={
            <PlaceholderPage
              title="Chat"
              description="The chat interface will be implemented in a future step."
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
