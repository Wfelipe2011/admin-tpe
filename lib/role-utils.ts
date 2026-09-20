import { ParticipantProfile } from "@/types/auth"

// Define route access by profile
export const routeAccess: Record<string, ParticipantProfile[]> = {
  "/dashboard": [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
  "/dashboard/lista-atencao": [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
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
  "/lista-espera": [ParticipantProfile.COORDINATOR],
  "/coordenacao": [ParticipantProfile.COORDINATOR],
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

  // Menu configurado pelo coordenador (Coordenação > Menu por perfil): manda nas telas que têm item de menu
  const custom = customMenu?.[userProfile]
  if (custom) {
    const menuPath = menuPathFor(path)
    if (menuPath) return custom.includes(menuPath)
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

// Menu por perfil configurado pelo coordenador; null = vale o padrão de defaultMenuItems().
// Carregado por lib/menu-permissions.ts
let customMenu: Record<string, string[]> | null = null
export function setCustomMenuPermissions(permissions: Record<string, string[]> | null) {
  customMenu = permissions
}

// item de menu que "cobre" a rota, o mais específico primeiro (/dashboard/lista-atencao antes de /dashboard)
function menuPathFor(path: string): string | undefined {
  return defaultMenuItems()
    .map((item) => item.path)
    .sort((a, b) => b.length - a.length)
    .find((p) => path === p || path.startsWith(p + "/"))
}

// Itens do menu e quem vê cada um por padrão
function defaultMenuItems() {
  return [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "LayoutDashboard",
      allowedProfiles: [ParticipantProfile.COORDINATOR, ParticipantProfile.CAPTAIN, ParticipantProfile.ASSISTANT_CAPTAIN, ParticipantProfile.ADMIN_ANALYST],
    },
    {
      name: "Lista de Atenção",
      path: "/dashboard/lista-atencao",
      icon: "AlertCircle",
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
    {
      name: "Lista de Espera",
      path: "/lista-espera",
      icon: "UserCheck",
      allowedProfiles: [ParticipantProfile.COORDINATOR],
    },
    {
      name: "Coordenação",
      path: "/coordenacao",
      icon: "ShieldCheck",
      allowedProfiles: [ParticipantProfile.COORDINATOR],
    },
  ]
}

// Get menu items based on user profile
export function getAuthorizedMenuItems(userProfile: ParticipantProfile) {
  const allMenuItems = defaultMenuItems()

  // o coordenador vê tudo; os demais seguem a matriz configurada (ou o padrão, se nunca foi mexida)
  if (userProfile === ParticipantProfile.COORDINATOR) return allMenuItems
  const custom = customMenu?.[userProfile]
  if (custom) return allMenuItems.filter((item) => custom.includes(item.path))

  return allMenuItems.filter((item) => item.allowedProfiles.includes(userProfile))
}
