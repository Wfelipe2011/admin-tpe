"use client"

import { jwtDecode } from "jwt-decode"
import { setCookie, parseCookies, destroyCookie } from "nookies"
import type { IToken } from "@/types/auth"
import { apiClient } from "@/lib/api-client"

// Set authentication token using multiple storage mechanisms for redundancy
export function setAuthToken(token: string): void {
  if (!token) {
    console.error("[auth-utils] Attempted to set empty token")
    return
  }

  try {
    // 1. Set using nookies (which uses js-cookie internally)
    setCookie(null, "auth_token", token, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // 2. Set directly using document.cookie as backup
    if (typeof document !== "undefined") {
      document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    }

    // 3. Also store in localStorage as another fallback
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("auth_token", token)
        localStorage.setItem("auth_token_ts", Date.now().toString())
      } catch (e) {
        console.error("[auth-utils] Failed to set token in localStorage:", e)
      }
    }

    console.log("[auth-utils] Token stored successfully at", new Date().toLocaleString())
    console.log("[auth-utils] Token preview:", token.substring(0, 15) + "...")
  } catch (error) {
    console.error("[auth-utils] Error setting token:", error)
  }
}

// Get authentication token from any available storage
export function getAuthToken(): string | null {
  let token = null

  // Try multiple sources to get the token
  try {
    // 1. Try nookies first
    const cookies = parseCookies()
    token = cookies.auth_token

    if (token) {
      console.log("[auth-utils] Token found in nookies:", token.substring(0, 15) + "...")
      return token
    }

    // 2. Try document.cookie directly
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/auth_token=([^;]+)/)
      if (match && match[1]) {
        token = match[1]
        console.log("[auth-utils] Token found in document.cookie:", token.substring(0, 15) + "...")
        return token
      }
    }

    // 3. Try localStorage as last resort
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth_token")
      if (token) {
        console.log("[auth-utils] Token found in localStorage:", token.substring(0, 15) + "...")

        // Sync back to cookie for consistency
        setAuthToken(token)

        return token
      }
    }

    console.log("[auth-utils] No token found in any storage")
    return null
  } catch (error) {
    console.error("[auth-utils] Error retrieving token:", error)
    return null
  }
}

// Remove authentication token from all storage mechanisms
export function removeAuthToken(): void {
  try {
    // 1. Remove from nookies
    destroyCookie(null, "auth_token", { path: "/" })

    // 2. Remove from document.cookie directly
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    }

    // 3. Remove from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_token_ts")
    }

    console.log("[auth-utils] Token removed from all storage")
  } catch (error) {
    console.error("[auth-utils] Error removing token:", error)
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAuthToken()
  if (!token) {
    console.log("[auth-utils] No token found")
    return false
  }

  try {
    const decoded = jwtDecode<IToken>(token)
    const currentTime = Math.floor(Date.now() / 1000)

    // Add some buffer time (5 seconds) to account for slight time differences
    const isValid = decoded.exp > currentTime - 5

    // Add logging to help debug
    console.log("[auth-utils] Token expiration:", new Date(decoded.exp * 1000).toLocaleString())
    console.log("[auth-utils] Current time:", new Date(currentTime * 1000).toLocaleString())
    console.log("[auth-utils] Is token valid:", isValid)

    return isValid
  } catch (error) {
    console.error("[auth-utils] Error decoding token:", error)
    return false
  }
}

// Get user information from token
export function getUserFromToken(): IToken | null {
  const token = getAuthToken()
  if (!token) return null

  try {
    return jwtDecode<IToken>(token)
  } catch (error) {
    console.error("[auth-utils] Error decoding token:", error)
    return null
  }
}

// Logout user
export function logout(): void {
  removeAuthToken()
  window.location.href = "/login"
}

export class AuthService {
  static async login(credentials: { phone: string; password: string }): Promise<any> {
    try {
      // Use the apiClient directly
      const response = await apiClient.post("/auth/login", credentials)

      if (response.token) {
        // Store the token using our utility function
        setAuthToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  static isAuthenticated(): boolean {
    return isAuthenticated()
  }

  static logout(): void {
    logout()
  }
}
