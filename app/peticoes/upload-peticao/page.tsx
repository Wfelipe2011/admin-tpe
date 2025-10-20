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
      }
    }
  }

  const handleUpload = async (bypassValidation = false) => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo selecionado",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Definir URL baseado no modo
      let url = isUpdateMode
        ? `/petitions/upload/${petitionId}`
        : "/petitions/upload"

      // Adicionar parâmetro bypass se necessário
      if (bypassValidation) {
        url += "?bypass=1"
      }

      // Usar o método upload do apiClient
      const data: UploadResponse = await apiClient.upload(url, formData, {
        method: isUpdateMode ? "PUT" : "POST",
        endpoint: "new"
      })

      setUploadStatus("success")
      setShowBypassOption(false) // Reset bypass option on success
      toast({
        title: "Sucesso",
        description: isUpdateMode ? "Arquivo atualizado com sucesso" : "Arquivo enviado com sucesso",
      })

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setFileName(null)

      // Navigate baseado no modo
      if (isUpdateMode) {
        // Volta para a tela de edição
        router.push(`/peticoes/completar/${petitionId}`)
      } else {
        // Navigate to the visualization page
        router.push(`/peticoes/visualizar/${data.id}`)
      }
    } catch (error: any) {
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
    } finally {
      setIsUploading(false)
    }
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
            className={`h-64 flex flex-col items-center justify-center border-2 rounded-lg border-dashed p-6 transition-all duration-200 ${isDragging
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

            <div className="flex gap-3">
              <Button
                onClick={handleFileSelect}
                variant="outline"
                disabled={isUploading}
                className="border-[#929BD2] text-[#374192] hover:bg-[#374192]/10"
              >
                Selecionar Arquivo
              </Button>
              {fileName && (
                <>
                  <Button
                    onClick={() => handleUpload()}
                    disabled={isUploading}
                    className="bg-[#374192] hover:bg-[#46607F] text-white"
                  >
                    {isUploading ? "Enviando..." : isUpdateMode ? "Atualizar Arquivo" : "Enviar"}
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
