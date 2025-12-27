import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/verify-otp'
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {!isAuthPage && <Header />}
      <main className={`flex-grow max-w-4xl mx-auto w-full px-4 py-6 ${!isAuthPage ? 'pb-24' : 'pb-6'} animate-fade-in`}>
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  )
}

export default Layout
