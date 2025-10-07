import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import type { ApiResponse } from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: env.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // Raw methods for custom responses (no ApiResponse wrapper)
  async getRaw<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async postRaw<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async patchRaw<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  async deleteRaw(url: string, config = {}): Promise<void> {
    await this.api.delete(url, config)
  }

  // Get axios instance for custom requests (like streaming)
  getInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()
