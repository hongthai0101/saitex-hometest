import { Outlet } from 'react-router-dom'
import { MainSidebar } from './MainSidebar'

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <MainSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
