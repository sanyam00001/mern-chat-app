import { Route, Routes } from 'react-router-dom'
import GuestRoute from '../components/GuestRoute'
import ProtectedRoute from '../components/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import HomePage from '../pages/HomePage'
import ChatPage from '../pages/ChatPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
