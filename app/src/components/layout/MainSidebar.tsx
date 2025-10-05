import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/chatbot',
    label: 'Chatbot',
    icon: MessageSquare,
  },
]

export function MainSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-900 text-white">
      {/* Logo/Brand */}
      <div className="border-b border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-white">Saitex</h1>
        <p className="mt-1 text-sm text-gray-400">AI Assistant</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 rounded-lg bg-gray-800 p-3">
          <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
          <p className="text-xs text-gray-400">{user?.email || 'user@saitex.com'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <LogOut size={20} className="text-gray-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
