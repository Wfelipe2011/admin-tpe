"use client"

import type React from "react"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProtectedLayout } from "@/app/layout-protected"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"

interface UploadResponse {
  id: string
  name: string
  protocol: string
  status: string
  publicUrl: string
  privateUrl: string
  createdAt: Date
  updatedAt: Date
}

type UploadStatus = "idle" | "success" | "error"

interface MatchInfo {
  id: string
  name: string
  status: string
  level: "exact" | "likely" | "similar"
  participantName: string | null
  congregation: string | null
  groups: string[]
  createdAt?: string
  updatedAt?: string
}

interface AnalyzeResponse {
  action: "new" | "update" | "review" | "duplicate"
  extractedName: string | null
  nameReadable: boolean
  matches: MatchInfo[]
  duplicateOf?: { id: string; name: string; status: string; protocol: string }
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  WAITING: "Em espera",
  WAITING_INFORMATION: "Aguardando informação",
  CREATED: "Nova",
  EXCLUDED: "Excluída",
}

const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-")

function UploadPeticaoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const petitionId = searchParams.get('id') // Detecta se é atualização
  const isUpdateMode = !!petitionId // true = atualizar, false = nova petição

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showBypassOption, setShowBypassOption] = useState(false)
  // Envio de petição nova: antes de gravar, o sistema analisa o PDF e diz se é atualização ou pessoa nova
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null) // id do cadastro, ou "new"
  const [bypassUsed, setBypassUsed] = useState(false)

  const validateFile = (file: File): boolean => {
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Erro",
        description: "Apenas arquivos PDF são permitidos",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (validateFile(file)) {
        setFileName(file.name)
        setUploadStatus("idle")
        setErrorMessage(null)
        setAnalysis(null)
        setSelectedTarget(null)
        setShowBypassOption(false)
      } else {
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        // Update the file input
        if (fileInputRef.current) {
          // Create a DataTransfer object to set the files
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInputRef.current.files = dataTransfer.files
        }

        setFileName(file.name)
        setUploadStatus("idle")
        setErrorMessage(null)
        setAnalysis(null)
        setSelectedTarget(null)
        setShowBypassOption(false)
      }
    }
  }

  const getFile = (): File | null => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo selecionado",
        variant: "destructive",
      })
      return null
    }
    return file
  }

  const handleError = (error: any, bypassValidation: boolean) => {
    setUploadStatus("error")

    // Se falhou na primeira tentativa (sem bypass), mostrar opção de bypass
    if (!bypassValidation && error.response?.status === 400) {
      setShowBypassOption(true)
    }

    const message = error?.response?.data?.message || error.message || "Erro ao fazer upload do arquivo"
    setErrorMessage(message)
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    })
  }

  // Grava o arquivo: atualiza uma petição existente (PUT) ou cria uma nova (POST)
  const sendFile = async (targetId: string | null, bypassValidation: boolean) => {
    const file = getFile()
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      let url = targetId ? `/petitions/upload/${targetId}` : "/petitions/upload"
      if (bypassValidation) {
        url += "?bypass=1"
      }

      const data: UploadResponse = await apiClient.upload(url, formData, {
        method: targetId ? "PUT" : "POST",
      })

      setUploadStatus("success")
      setShowBypassOption(false)
      toast({
        title: "Sucesso",
        description: targetId ? "Arquivo atualizado com sucesso" : "Arquivo enviado com sucesso",
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setFileName(null)
      setAnalysis(null)
      setSelectedTarget(null)

      if (targetId) {
        // Atualização: volta para a tela de edição daquela petição
        router.push(`/peticoes/completar/${targetId}`)
      } else {
        router.push(`/peticoes/visualizar/${data.id}`)
      }
    } catch (error: any) {
      handleError(error, bypassValidation)
    } finally {
      setIsUploading(false)
    }
  }

  // Petição nova: analisa antes de gravar (não grava nada) e mostra o que vai acontecer
  const analyzeFile = async (bypassValidation: boolean) => {
    const file = getFile()
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const url = `/petitions/upload/analyze${bypassValidation ? "?bypass=1" : ""}`
      const data: AnalyzeResponse = await apiClient.upload(url, formData, {
        method: "POST",
      })

      setBypassUsed(bypassValidation)
      setShowBypassOption(false)
      setAnalysis(data)
      if (data.action === "update") setSelectedTarget(data.matches[0].id)
      else if (data.action === "new") setSelectedTarget("new")
      else setSelectedTarget(null)
    } catch (error: any) {
      handleError(error, bypassValidation)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpload = async (bypassValidation = false) => {
    if (isUpdateMode) {
      await sendFile(petitionId, bypassValidation)
    } else {
      await analyzeFile(bypassValidation)
    }
  }

  const handleConfirmAnalysis = async () => {
    if (!selectedTarget) return
    await sendFile(selectedTarget === "new" ? null : selectedTarget, bypassUsed)
  }

  const handleBypassUpload = () => {
    handleUpload(true)
  }

  return (
    <ProtectedLayout
      title={isUpdateMode ? "Atualizar Petição" : "Upload de Petição"}
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Petições", href: "/peticoes" },
        { label: isUpdateMode ? "Atualizar Petição" : "Upload de Petição" },
      ]}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#181C43] to-[#374192] rounded-lg p-8 text-white mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              {isUpdateMode ? "Atualizar Arquivo da Petição" : "Upload de Nova Petição"}
            </h1>
            <p className="text-blue-100 text-sm">
              {isUpdateMode
                ? "Substitua o arquivo atual por uma nova versão"
                : "Envie uma nova petição em formato PDF para análise"
              }
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-[#333333] flex items-center gap-2">
            <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
            {isUpdateMode ? "Atualizar Arquivo da Petição" : "Upload de Nova Petição"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-[#666666] mb-6 leading-relaxed">
            {isUpdateMode
              ? "Faça o upload de um novo arquivo PDF para substituir o arquivo atual da petição. O sistema irá processar automaticamente as informações."
              : "Faça o upload de uma nova petição em formato PDF. Após o envio, você será redirecionado para visualizar as versões pública e privada do documento."
            }
          </p>

          <div
            className={`min-h-64 flex flex-col items-center justify-center border-2 rounded-lg border-dashed p-6 transition-all duration-200 ${isDragging
              ? "border-[#374192] bg-[#374192]/5 shadow-sm"
              : "border-gray-300 bg-gray-50/50 hover:border-[#929BD2] hover:bg-gray-50"
              }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`p-4 rounded-full mb-4 ${isDragging ? "bg-[#374192]/10" : "bg-[#929BD2]/10"}`}>
              <Upload className={`h-8 w-8 ${isDragging ? "text-[#374192]" : "text-[#929BD2]"}`} />
            </div>

            <p className="text-[#333333] font-medium text-center mb-2">
              Arraste e solte um arquivo PDF aqui
            </p>
            <p className="text-[#666666] text-sm text-center mb-4">
              ou clique no botão abaixo para selecionar
            </p>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />

            {fileName && (
              <div className="mb-4 p-3 bg-[#374192]/5 border border-[#374192]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#374192] rounded-full"></div>
                  <span className="font-medium text-[#333333]">Arquivo selecionado:</span>
                  <span className="text-[#666666]">{fileName}</span>
                </div>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="mb-4 p-3 bg-[#2ECC71]/5 border border-[#2ECC71]/20 rounded-lg">
                <div className="flex items-center gap-2 text-[#2ECC71]">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Upload realizado com sucesso!</span>
                </div>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mb-4 p-3 bg-[#E74C3C]/5 border border-[#E74C3C]/20 rounded-lg">
                <div className="flex items-center gap-2 text-[#E74C3C]">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            )}

            {showBypassOption && (
              <div className="mb-4 p-4 bg-[#F1C40F]/5 border border-[#F1C40F]/20 rounded-lg max-w-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#F1C40F] mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-[#333333]">Validação de conteúdo falhou</p>
                    <p className="text-[#666666] mt-1">
                      O PDF não passou na validação automática. Você pode forçar o upload se tem certeza de que o arquivo está correto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysis && !isUpdateMode && (
              <div className="mb-4 w-full max-w-xl text-left" data-testid="analysis-panel">
                {analysis.action === "duplicate" && analysis.duplicateOf && (
                  <div className="p-4 bg-[#E74C3C]/5 border border-[#E74C3C]/20 rounded-lg">
                    <p className="font-semibold text-[#333333]">Este PDF já está cadastrado</p>
                    <p className="text-sm text-[#666666] mt-1">
                      O arquivo é idêntico ao da petição de <strong>{analysis.duplicateOf.name}</strong> (
                      {STATUS_LABEL[analysis.duplicateOf.status] ?? analysis.duplicateOf.status}). Nada será enviado.
                      Se for uma versão atualizada, ela precisa ter conteúdo diferente (por exemplo, nova data de assinatura).
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/peticoes/visualizar/${analysis.duplicateOf!.id}`)}
                      >
                        Ver essa petição
                      </Button>
                    </div>
                  </div>
                )}

                {analysis.action !== "duplicate" && (
                  <div className="p-4 bg-[#374192]/5 border border-[#374192]/20 rounded-lg">
                    {!analysis.nameReadable ? (
                      <p className="text-sm text-[#666666]">
                        <strong className="text-[#333333]">Não consegui ler o nome no PDF</strong>, então não dá para comparar com os
                        cadastros. Se você sabe que é de alguém que já existe, cancele e use Editar → Atualizar Arquivo da Petição
                        nessa pessoa. Se é uma pessoa nova, pode enviar.
                      </p>
                    ) : analysis.matches.length === 0 ? (
                      <p className="text-sm text-[#666666]">
                        <strong className="text-[#333333]">Pessoa nova:</strong> não encontrei ninguém parecido com{" "}
                        <strong>{analysis.extractedName}</strong>. Será adicionada uma nova petição.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-[#666666] mb-3">
                          {analysis.action === "update" ? (
                            <>
                              <strong className="text-[#333333]">Atualização:</strong> o PDF é de <strong>{analysis.extractedName}</strong>, que
                              já está cadastrado. Confirme para <strong>substituir o arquivo</strong> do cadastro (os dados e o grupo
                              continuam).
                            </>
                          ) : (
                            <>
                              <strong className="text-[#333333]">Escolha o que fazer:</strong> o PDF é de{" "}
                              <strong>{analysis.extractedName}</strong> e encontrei cadastros parecidos.
                            </>
                          )}
                        </p>
                        <div className="space-y-2">
                          {analysis.matches.map((m) => (
                            <label
                              key={m.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedTarget === m.id ? "border-[#374192] bg-white" : "border-gray-200 bg-white/60"
                                }`}
                            >
                              <input
                                type="radio"
                                name="target"
                                className="mt-1"
                                checked={selectedTarget === m.id}
                                onChange={() => setSelectedTarget(m.id)}
                              />
                              <span className="text-sm">
                                <span className="font-medium text-[#333333]">Atualizar o cadastro de {m.participantName ?? m.name}</span>
                                <span className="block text-[#666666]">
                                  {STATUS_LABEL[m.status] ?? m.status}
                                  {m.congregation ? ` · ${m.congregation}` : ""}
                                  {m.groups.length > 0 ? ` · ${m.groups.join(", ")}` : ""}
                                  {` · petição de ${formatDate(m.createdAt)}`}
                                </span>
                                {m.status === "EXCLUDED" && (
                                  <span className="block text-[#E67E22]">
                                    Cadastro excluído: o arquivo será trocado, mas ele continua excluído (use &quot;Ativar&quot; na lista para reativar).
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}

                    <label
                      className={`mt-2 flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${selectedTarget === "new" ? "border-[#374192] bg-white" : "border-gray-200 bg-white/60"
                        }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        className="mt-1"
                        checked={selectedTarget === "new"}
                        onChange={() => setSelectedTarget("new")}
                      />
                      <span className="text-sm">
                        <span className="font-medium text-[#333333]">Não é a mesma pessoa: adicionar como nova petição</span>
                        <span className="block text-[#666666]">Cria um novo cadastro com este PDF.</span>
                      </span>
                    </label>

                    <div className="mt-4 flex gap-2">
                      <Button
                        onClick={handleConfirmAnalysis}
                        disabled={isUploading || !selectedTarget}
                        className="bg-[#374192] hover:bg-[#46607F] text-white"
                      >
                        {isUploading
                          ? "Enviando..."
                          : selectedTarget === "new"
                            ? "Adicionar nova petição"
                            : "Atualizar cadastro"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      setAnalysis(null)
                      setSelectedTarget(null)
                    }}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleFileSelect}
                variant="outline"
                disabled={isUploading}
                className="border-[#929BD2] text-[#374192] hover:bg-[#374192]/10"
              >
                Selecionar Arquivo
              </Button>
              {fileName && !analysis && (
                <>
                  <Button
                    onClick={() => handleUpload()}
                    disabled={isUploading}
                    className="bg-[#374192] hover:bg-[#46607F] text-white"
                  >
                    {isUploading
                      ? isUpdateMode ? "Enviando..." : "Analisando..."
                      : isUpdateMode ? "Atualizar Arquivo" : "Enviar"}
                  </Button>
                  {showBypassOption && (
                    <Button
                      onClick={handleBypassUpload}
                      disabled={isUploading}
                      className="bg-[#F1C40F] hover:bg-[#F1C40F]/80 text-[#333333] font-semibold"
                    >
                      {isUploading ? "Enviando..." : "Forçar Upload"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ProtectedLayout>
  )
}

export default function UploadPeticaoPage() {
  return (
    <Suspense fallback={
      <ProtectedLayout
        title="Upload de Petição"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Petições", href: "/peticoes" },
          { label: "Upload de Petição" },
        ]}
      >
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#374192] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#666666] font-medium">Carregando página...</p>
          </div>
        </div>
      </ProtectedLayout>
    }>
      <UploadPeticaoContent />
    </Suspense>
  )
}
