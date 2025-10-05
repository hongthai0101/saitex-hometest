import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

// Loading component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/chatbot" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'chatbot',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatbotPage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
