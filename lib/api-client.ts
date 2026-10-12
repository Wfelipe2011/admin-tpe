import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { getAuthToken } from "@/lib/auth-utils"
import { newApiBaseUrl } from "@/lib/api-config"

/**
 * Cliente único: todas as rotas HTTP do app estão no api-v2.
 *
 * A legacy mantém seus handlers, crons, consumidores e infraestrutura, mas
 * não é mais um destino de requisições deste frontend.
 */
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: any
  headers?: Record<string, string>
}

export class ApiClient {
  private newBaseUrl = newApiBaseUrl
  private newAxios: AxiosInstance

  constructor() {
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
    this.newAxios.interceptors.request.use(
      (config) => {
        const token = getAuthToken()
        if (token && !config.headers.Authorization) {
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
          setTimeout(() => {
            window.location.href = "/login?error=expired"
          }, 5000)
        }
      }
      return Promise.reject(error)
    }

    this.newAxios.interceptors.response.use(responseInterceptor, errorInterceptor)
  }

  private getAxiosInstance(): AxiosInstance {
    return this.newAxios
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options
    const axiosInstance = this.getAxiosInstance()
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

  async upload<T>(url: string, formData: FormData, options: Omit<RequestOptions, "body"> = {}): Promise<T> {
    const { method = "POST", headers = {} } = options
    const axiosInstance = this.getAxiosInstance()

    const uploadHeaders = {
      ...headers,
      "Content-Type": "multipart/form-data",
    }

    try {
      const response = method === "PUT"
        ? await axiosInstance.put(url, formData, { headers: uploadHeaders })
        : await axiosInstance.post(url, formData, { headers: uploadHeaders })
      return response.data
    } catch (error) {
      console.error("API upload error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()

// Petition specific methods
export const petitionApi = {
  exclude: (id: string) => apiClient.patch(`/petitions/exclude/${id}`, {}),
  activate: (id: string) => apiClient.patch(`/petitions/activate/${id}`, {}),
}
