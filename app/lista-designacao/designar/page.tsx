"use client"
import { ProtectedLayout } from "@/app/layout-protected"
import { useDesignation } from "@/hooks/use-designation"
import { CancellationModal } from "@/components/designation/cancellation-modal"
import { ConfirmationModal } from "@/components/designation/confirmation-modal"
import { RecreateModal } from "@/components/designation/recreate-modal"
import { SearchBar } from "@/components/designation/search-bar"
import { ActionButtons } from "@/components/designation/action-buttons"
import { AssignmentCard } from "@/components/designation/assignment-card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck } from "lucide-react"
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
    showRecreateModal,
    setShowConfirmModal,
    setShowCancelModal,
    setShowRecreateModal,
    handleSearch,
    handleAutoAssignClick,
    handleCancelClick,
    handleRecreateClick,
    copyToClipboard,
    autoAssign,
    sendDesignation,
    cancelDesignation,
    recreateDesignation,
    handleUpdatePoint,
    moveParticipant,
    isAbsent,
    setIsOptional,
  } = useDesignation()

  // Functions to handle status display
  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Em aberto"
      case "IN_PROGRESS":
        return "Em progresso"
      case "CLOSED":
        return "Concluído"
      case "ARCHIVED":
        return "Arquivado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-yellow-600 font-semibold"
      case "IN_PROGRESS":
        return "text-purple-600 font-semibold"
      case "CLOSED":
        return "text-green-600 font-semibold"
      case "ARCHIVED":
        return "text-blue-600 font-semibold"
      case "CANCELLED":
        return "text-red-600 font-semibold"
      default:
        return "text-gray-600 font-semibold"
    }
  }

  return (
    <ProtectedLayout
      title="Designar Participantes"
      breadcrumbs={[{ label: "Lista para Designação", href: "/lista-designacao" }, { label: "Designar" }]}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Designar Participantes</h1>
              <p className="text-blue-100 text-sm">
                Atribua pontos de designação aos participantes de forma organizada
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
            <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
              <div className="text-center space-y-4">
                <div
                  className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin mx-auto"
                  aria-hidden="true"
                ></div>
                <p className="text-[#666666] font-medium">Carregando designações...</p>
                <span className="sr-only">Carregando dados das designações</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8">
            <div className="space-y-8">
              {/* Header com link para chamada */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                  <h2 className="text-lg font-semibold text-[#333333]">Pontos de Designação</h2>
                </div>

                {/* Status da Designação */}
                {designationData && (
                  <div className="bg-[#F8F8F8] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                      <span className="text-sm font-medium text-[#666666]">Status da Designação:</span>
                      <span
                        className={
                          designationData?.status
                            ? getStatusColor(designationData.status)
                            : "text-[#666666] font-medium"
                        }
                      >
                        {designationData?.status
                          ? getStatusText(designationData.status)
                          : "Carregando..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Search, auto-assign and participant overview */}
              <SearchBar
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onAutoAssign={handleAutoAssignClick}
                onRecreate={handleRecreateClick}
                presentParticipants={participants.filter((p) => !isAbsent(p))}
                absentParticipants={participants.filter(isAbsent)}
                incidents={designationData?.incidents || []}
                isDisabled={designationData?.status !== "OPEN"}
                designationStatus={designationData?.status}
              />

              {/* Filtered results */}
              {searchTerm && filteredAssignments.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#929BD2] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-[#333333]">Resultados Filtrados</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
              <div className="space-y-6">
                {!searchTerm && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                    <h3 className="text-lg font-semibold text-[#333333]">Todas as Designações</h3>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
              </div>

              {assignments.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F8F8F8]">
                    <UserCheck className="h-8 w-8 text-[#929BD2]" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-[#333333] font-medium">Nenhum ponto de designação disponível</p>
                  <p className="text-sm text-[#666666] mt-1">Aguarde a abertura de novas designações</p>
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
      </div>

      {/* Modals */}
      <ConfirmationModal open={showConfirmModal} onOpenChange={setShowConfirmModal} onConfirm={autoAssign} />
      <CancellationModal open={showCancelModal} onOpenChange={setShowCancelModal} onConfirm={cancelDesignation} />
      <RecreateModal open={showRecreateModal} onOpenChange={setShowRecreateModal} onConfirm={recreateDesignation} />
    </ProtectedLayout>
  )
}
