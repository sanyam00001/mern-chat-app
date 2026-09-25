import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { ROUTES } from '../utils/constants'

function MainLayout() {
  const location = useLocation()
  const isChatPage = location.pathname === ROUTES.CHAT

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
    </div>
  )
}

export default MainLayout