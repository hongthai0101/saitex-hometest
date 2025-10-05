export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Saitex',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
