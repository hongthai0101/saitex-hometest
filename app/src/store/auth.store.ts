import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import type { User, LoginCredentials } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  checkAuth: () => {
    const user = authService.getCurrentUser()
    const token = authService.getToken()
    set({
      user,
      token,
      isAuthenticated: !!token,
    })
  },
}))
