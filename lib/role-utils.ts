import { ParticipantProfile } from "@/types/auth"

// Define route access by profile
export const routeAccess: Record<string, ParticipantProfile[]> = {
  "/dashboard": [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
  "/consultar/historico": [
    ParticipantProfile.COORDINATOR,
    ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN,
    ParticipantProfile.ADMIN_ANALYST,
  ],
  "/lista-designacao": [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN],
  "/lista-designacao/designar": [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN],
  "/peticoes": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/peticoes/upload-peticao": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/peticoes/visualizar": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/peticoes/completar": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/grupos": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/grupos/novo": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/grupos/editar": [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
  "/pontos": [ParticipantProfile.COORDINATOR],
}

// Check if a user has access to a specific route
export function hasRouteAccess(userProfile: ParticipantProfile, path: string): boolean {
  // COORDINATOR has access to everything
  if (userProfile === ParticipantProfile.COORDINATOR) {
    return true
  }

  // PARTICIPANT has no access to protected routes
  if (userProfile === ParticipantProfile.PARTICIPANT) {
    return false
  }

  // For other paths, check the routeAccess map
  // First, try to match the exact path
  if (routeAccess[path] && routeAccess[path].includes(userProfile)) {
    return true
  }

  // If not found, try to match the base path (for dynamic routes)
  const basePath = Object.keys(routeAccess).find((route) => path.startsWith(route) && route !== "/")

  if (basePath && routeAccess[basePath].includes(userProfile)) {
    return true
  }

  return false
}

// Get menu items based on user profile
export function getAuthorizedMenuItems(userProfile: ParticipantProfile) {
  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
    },
    {
      name: "Consultar",
      path: "/consultar/historico",
      icon: "Search",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
    },
    {
      name: "Lista para Designação",
      path: "/lista-designacao",
      icon: "List",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN],
    },
    {
      name: "Petições",
      path: "/peticoes",
      icon: "FileText",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
    },
    {
      name: "Grupos",
      path: "/grupos",
      icon: "Users",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.ADMIN_ANALYST],
    },
    {
      name: "Pontos",
      path: "/pontos",
      icon: "MapPinned",
      allowedProfiles: [ParticipantProfile.COORDINATOR],
    },
  ]

  return allMenuItems.filter((item) => item.allowedProfiles.includes(userProfile))
}
