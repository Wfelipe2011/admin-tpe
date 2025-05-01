import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getUserFromToken } from "@/lib/auth-utils"

interface GroupState {
  selectedGroupId: string
  setSelectedGroupId: (groupId: string) => void
}

// Initialize with user's group if they are a CAPTAIN
const initializeGroupId = () => {
  const user = getUserFromToken()

  // If user is CAPTAIN, force select their group
  if (user?.profile === "CAPTAIN" && user?.groupId) {
    return user.groupId
  }

  return "todos"
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      selectedGroupId: initializeGroupId(),
      setSelectedGroupId: (groupId) => set({ selectedGroupId: groupId }),
    }),
    {
      name: "group-storage",
    },
  ),
)
