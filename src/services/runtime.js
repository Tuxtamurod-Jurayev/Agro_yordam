import { Capacitor } from '@capacitor/core'

const mobileApiBaseUrl =
  import.meta.env.VITE_MOBILE_API_BASE_URL || 'https://agro-yordam.vercel.app'

function normalizeBaseUrl(value) {
  if (!value) {
    return ''
  }

  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const isNativeApp = Capacitor.isNativePlatform()

export function getApiBaseUrl() {
  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  if (isNativeApp) {
    return normalizeBaseUrl(mobileApiBaseUrl)
  }

  return ''
}

export function toApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseUrl = getApiBaseUrl()
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}
