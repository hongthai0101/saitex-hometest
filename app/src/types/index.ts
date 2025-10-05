export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export type Status = 'idle' | 'loading' | 'success' | 'error'
