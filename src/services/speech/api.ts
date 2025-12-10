"use client"

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import axios from "axios"

const baseUrl = process.env.NEXT_PUBLIC_SPEECH_API_URL ?? process.env.NEXT_PUBLIC_API_URL
const analyticsBaseUrl =
  process.env.NEXT_PUBLIC_SPEECH_ANALYTICS_API_URL ??
  (baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/speechanalytics` : undefined)

const defaultHeaders = {
  "Content-Type": "application/json",
}

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage.getItem("token")
}

const authInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

const errorInterceptor = (error: AxiosError) => {
  if (error.response?.status === 401 && typeof window !== "undefined") {
    window.localStorage.removeItem("token")
    window.localStorage.removeItem("user")
    window.localStorage.removeItem("permisos")
    window.location.href = "/"
  }
  return Promise.reject(error)
}

const attachInterceptors = <T extends typeof axios>(instance: T) => {
  instance.interceptors.request.use(authInterceptor)
  instance.interceptors.response.use((response: AxiosResponse) => response, errorInterceptor)
  return instance
}

export const speechApi = attachInterceptors(
  axios.create({
    baseURL: baseUrl,
    withCredentials: true,
    headers: defaultHeaders,
  }),
)

export const speechAnalyticsApi = attachInterceptors(
  axios.create({
    baseURL: analyticsBaseUrl ?? baseUrl,
    withCredentials: true,
    headers: defaultHeaders,
  }),
)

if (process.env.NODE_ENV !== "production") {
  console.info("[Speech API] Base URL:", baseUrl)
  console.info("[Speech API] Analytics URL:", analyticsBaseUrl)
}

export default speechApi
