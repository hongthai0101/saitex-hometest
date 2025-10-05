import type { LoginCredentials, AuthResponse, User } from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Uncomment this when auth API is ready
      // const response = await apiService.postRaw<AuthResponse>('/auth/login', credentials)

      // Demo login - replace with actual API call
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const mockResponse: AuthResponse = {
          user: {
            id: 'a81bc81b-dead-4e5d-abff-90865d1e13b1',
            username: credentials.username,
            email: 'admin@saitex.com',
            firstName: 'Admin',
            lastName: 'User',
          },
          token: 'demo-jwt-token-' + Date.now(),
        }

        localStorage.setItem('token', mockResponse.token)
        localStorage.setItem('user', JSON.stringify(mockResponse.user))

        return mockResponse
      }

      throw new Error('Invalid credentials')
    } catch (error) {
      throw error
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
