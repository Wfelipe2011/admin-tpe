import type { GroupPoint, CreateGroupPointRequest, UpdateGroupPointRequest } from "@/types/points"
import { apiClient } from "@/lib/api-client"

// API Response interfaces based on the specification
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

// Service layer to abstract API calls
export class PointsService {
  /**
   * Get all points for a specific group
   */
  static async getGroupPoints(groupId: string): Promise<GroupPoint[]> {
    try {
      // Use apiClient with "new" endpoint to connect to the points API
      const response = await apiClient.get<ApiResponse<GroupPoint[]>>(`/groups/${groupId}/points`, {
        endpoint: "new"
      })
      
      // Check if response has the expected API structure
      if (typeof response === 'object' && response !== null && 'success' in response) {
        if (response.success && response.data) {
          return response.data
        } else {
          throw new Error(response.message || "Failed to fetch group points")
        }
      } else {
        // If response is direct data (not wrapped), return it
        return response as GroupPoint[]
      }
    } catch (error: any) {
      console.error("Error fetching group points:", error)
      
      // Handle specific API errors
      if (error.message?.includes("Network error") || error.code === 'ECONNREFUSED') {
        throw new Error("Não foi possível conectar com o servidor da API")
      }
      
      throw new Error(error.message || "Erro ao carregar pontos do grupo")
    }
  }

  /**
   * Create a new point for a group
   */
  static async createGroupPoint(data: CreateGroupPointRequest): Promise<GroupPoint> {
    try {
      // Prepare the payload according to API specification
      const payload = {
        pointName: data.pointName,
        cartName: data.cartName,
        minParticipants: data.minParticipants,
        maxParticipants: data.maxParticipants,
        status: data.status,
      }

      const response = await apiClient.post<ApiResponse<GroupPoint> | GroupPoint>(`/groups/${data.groupId}/points`, payload, {
        endpoint: "new"
      })
      
      // Check if response has the expected API structure
      if (typeof response === 'object' && response !== null && 'success' in response) {
        if (response.success && response.data) {
          return response.data
        } else {
          throw new Error(response.message || "Failed to create point")
        }
      } else {
        // If response is direct data (not wrapped), return it
        return response as GroupPoint
      }
    } catch (error: any) {
      console.error("Error creating point:", error)
      
      // Handle specific API errors
      if (error.message?.includes("Network error") || error.code === 'ECONNREFUSED') {
        throw new Error("Não foi possível conectar com o servidor da API")
      }
      
      throw new Error(error.message || "Erro ao criar ponto")
    }
  }

  /**
   * Update an existing point
   */
  static async updateGroupPoint(pointId: string, data: UpdateGroupPointRequest): Promise<GroupPoint> {
    try {
      // Prepare the payload according to API specification
      const payload = {
        pointName: data.pointName,
        cartName: data.cartName,
        minParticipants: data.minParticipants,
        maxParticipants: data.maxParticipants,
        status: data.status,
      }

      const response = await apiClient.put<ApiResponse<GroupPoint> | GroupPoint>(`/points/${pointId}`, payload, {
        endpoint: "new"
      })
      
      // Check if response has the expected API structure
      if (typeof response === 'object' && response !== null && 'success' in response) {
        if (response.success && response.data) {
          return response.data
        } else {
          throw new Error(response.message || "Failed to update point")
        }
      } else {
        // If response is direct data (not wrapped), return it
        return response as GroupPoint
      }
    } catch (error: any) {
      console.error("Error updating point:", error)
      
      // Handle specific API errors
      if (error.message?.includes("Network error") || error.code === 'ECONNREFUSED') {
        throw new Error("Não foi possível conectar com o servidor da API")
      }
      
      throw new Error(error.message || "Erro ao atualizar ponto")
    }
  }

  /**
   * Delete a point (disabled per requirements, but keeping for future)
   */
  static async deleteGroupPoint(pointId: string): Promise<void> {
    throw new Error("Delete operation is not allowed for points (historical data preservation)")
  }
}

// Default values for new points
export const DEFAULT_NEW_POINT = {
  pointName: "",
  cartName: "",
  minParticipants: 2,
  maxParticipants: 3,
  status: true,
} as const