import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { getAuthToken } from "@/lib/auth-utils"

type ApiEndpoint = "legacy" | "new"

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: any
  headers?: Record<string, string>
  endpoint?: ApiEndpoint
}

export class ApiClient {
  private legacyBaseUrl = "https://api.tpedigital.com.br/dev"
  private newBaseUrl = "https://server.tpedigital.com.br"
  private legacyAxios: AxiosInstance
  private newAxios: AxiosInstance

  constructor() {
    this.legacyAxios = axios.create({
      baseURL: this.legacyBaseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    this.newAxios = axios.create({
      baseURL: this.newBaseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.legacyAxios.interceptors.request.use(
      (config) => {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    this.newAxios.interceptors.request.use(
      (config) => {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    const responseInterceptor = (response: AxiosResponse) => response
    const errorInterceptor = (error: any) => {
      if (error.response && error.response.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login?error=expired"
        }
      }
      return Promise.reject(error)
    }

    this.legacyAxios.interceptors.response.use(responseInterceptor, errorInterceptor)
    this.newAxios.interceptors.response.use(responseInterceptor, errorInterceptor)
  }

  private getAxiosInstance(endpoint: ApiEndpoint = "legacy"): AxiosInstance {
    return endpoint === "legacy" ? this.legacyAxios : this.newAxios
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, endpoint = "legacy" } = options
    const axiosInstance = this.getAxiosInstance(endpoint)
    const config: AxiosRequestConfig = { method, url, headers }
    if (body) {
      config.data = body
    }
    try {
      const response = await axiosInstance(config)
      return response.data
    } catch (error) {
      console.error("API request error:", error)
      throw error
    }
  }

  async get<T>(url: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" })
  }

  async post<T>(url: string, data: any, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "POST", body: data })
  }

  async put<T>(url: string, data: any, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "PUT", body: data })
  }

  async patch<T>(url: string, data: any, options: Omit<RequestOptions, "method"> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "PATCH", body: data })
  }

  async delete<T>(url: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" })
  }

  async upload<T>(url: string, formData: FormData, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<T> {
    const { endpoint = "new", headers = {} } = options
    const axiosInstance = this.getAxiosInstance(endpoint)

    const uploadHeaders = {
      ...headers,
      "Content-Type": "multipart/form-data",
    }

    try {
      const response = await axiosInstance.post(url, formData, { headers: uploadHeaders })
      return response.data
    } catch (error) {
      console.error("API upload error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
