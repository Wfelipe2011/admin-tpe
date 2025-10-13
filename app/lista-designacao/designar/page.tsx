"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParticipantsTab } from "@/components/designation/participants-tab"
import { ProtectedLayout } from "@/app/layout-protected"
import { useDesignation } from "@/hooks/use-designation"
import { CancellationModal } from "@/components/designation/cancellation-modal"
import { ConfirmationModal } from "@/components/designation/confirmation-modal"
import { SearchBar } from "@/components/designation/search-bar"
import { ActionButtons } from "@/components/designation/action-buttons"
import { AssignmentCard } from "@/components/designation/assignment-card"

export default function DesignarPage() {
  const {
    loading,
    searchTerm,
    isOptional,
    isSticky,
    copyStatus,
    designationData,
    assignments,
    participants,
    filteredParticipants,
    filteredAssignments,
    showConfirmModal,
    showCancelModal,
    setShowConfirmModal,
    setShowCancelModal,
    handleSearch,
    handleAutoAssignClick,
    handleCancelClick,
    copyToClipboard,
    autoAssign,
    sendDesignation,
    cancelDesignation,
    handleUpdatePoint,
    moveParticipant,
    isAbsent,
    setIsOptional,
    registerAbsence,
  } = useDesignation()

  const [groupIdFromCookie, setGroupIdFromCookie] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Helper to get cookie by name
    const getCookie = (name: string): string | undefined => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
      return undefined
    }

    const gdId = getCookie("groupId") // Assuming the cookie is named 'groupId'
    setGroupIdFromCookie(gdId)
  }, [])

  return (
    <ProtectedLayout
      title="Designar Participantes"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Designar" }]}
    >
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6 w-full max-w-full mx-auto">
          <div className="space-y-3 sm:space-y-4 md:space-y-6 relative">
            {/* Main content */}
            <Tabs defaultValue="assignments" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 text-xs sm:text-sm">
                <TabsTrigger value="assignments">Designação</TabsTrigger>
                <TabsTrigger value="participants">Chamada</TabsTrigger>
              </TabsList>

              <TabsContent value="assignments" className="space-y-2 sm:space-y-4 pt-2 sm:pt-4">
                {/* Search, auto-assign and participant overview */}
                <SearchBar
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                  onAutoAssign={handleAutoAssignClick}
                  presentParticipants={participants.filter((p) => !isAbsent(p))}
                  absentParticipants={participants.filter(isAbsent)}
                  incidents={designationData?.incidents || []}
                  isDisabled={designationData?.status !== "OPEN"}
                />
                {/* Filtered results */}
                {searchTerm && filteredAssignments.length > 0 && (
                  <div className="space-y-2 sm:space-y-4">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold">Resultados Filtrados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 auto-rows-fr">
                      {filteredAssignments.map((assignment) => (
                        <AssignmentCard
                          key={`filtered-${assignment.point.id}`}
                          assignment={assignment}
                          availableParticipants={participants}
                          onUpdatePoint={handleUpdatePoint}
                          onMoveParticipant={moveParticipant}
                          isOpen={designationData?.status === "OPEN" || designationData?.status === "IN_PROGRESS"}
                          isAbsent={isAbsent}
                          assignments={assignments}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 auto-rows-fr"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
                >
                  {assignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.point.id}
                      assignment={assignment}
                      availableParticipants={participants}
                      onUpdatePoint={handleUpdatePoint}
                      onMoveParticipant={moveParticipant}
                      isOpen={designationData?.status === "OPEN" || designationData?.status === "IN_PROGRESS"}
                      isAbsent={isAbsent}
                      assignments={assignments}
                    />
                  ))}
                </div>

                {assignments.length === 0 && (
                  <div className="text-center py-4 sm:py-8 text-muted-foreground text-xs sm:text-sm">
                    Não há pontos de designação disponíveis.
                  </div>
                )}
                {/* Action buttons */}
                <ActionButtons
                  status={designationData?.status || ""}
                  onCancel={handleCancelClick}
                  onCopyLink={copyToClipboard}
                  onSend={sendDesignation}
                  copyStatus={copyStatus}
                  isOptional={isOptional}
                  setIsOptional={setIsOptional}
                  assignments={assignments}
                />
              </TabsContent>

              <TabsContent value="participants" className="pt-2 sm:pt-4">
                <ParticipantsTab
                  participants={searchTerm ? filteredParticipants : participants}
                  isAbsent={isAbsent}
                  onRegisterAbsence={registerAbsence}
                  loading={loading}
                  groupId={groupIdFromCookie} // Pass the groupId from cookie
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal open={showConfirmModal} onOpenChange={setShowConfirmModal} onConfirm={autoAssign} />

      <CancellationModal open={showCancelModal} onOpenChange={setShowCancelModal} onConfirm={cancelDesignation} />
    </ProtectedLayout>
  )
}
