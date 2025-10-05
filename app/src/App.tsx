import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { AppRouter } from '@/routes'
import { useAuthStore } from '@/store/auth.store'

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)

  // Check authentication on app startup
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App
