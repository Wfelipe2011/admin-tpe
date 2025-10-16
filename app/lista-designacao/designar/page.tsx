"use client"
import { ProtectedLayout } from "@/app/layout-protected"
import { useDesignation } from "@/hooks/use-designation"
import { CancellationModal } from "@/components/designation/cancellation-modal"
import { ConfirmationModal } from "@/components/designation/confirmation-modal"
import { SearchBar } from "@/components/designation/search-bar"
import { ActionButtons } from "@/components/designation/action-buttons"
import { AssignmentCard } from "@/components/designation/assignment-card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Link from "next/link"

export default function DesignarPage() {
  const {
    loading,
    searchTerm,
    isOptional,
    copyStatus,
    designationData,
    assignments,
    participants,
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
  } = useDesignation()

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
            {/* Header com link para chamada */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">Pontos de Designação</h2>
              <Link href="/lista-designacao/chamada">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Ir para Chamada</span>
                  <span className="sm:hidden">Chamada</span>
                </Button>
              </Link>
            </div>

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
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">Resultados Filtrados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4">
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

            {/* Main assignments grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-4">
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
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmationModal open={showConfirmModal} onOpenChange={setShowConfirmModal} onConfirm={autoAssign} />
      <CancellationModal open={showCancelModal} onOpenChange={setShowCancelModal} onConfirm={cancelDesignation} />
    </ProtectedLayout>
  )
}
