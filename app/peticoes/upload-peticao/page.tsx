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

      // Usar o método correto do apiClient
      const data: UploadResponse = isUpdateMode
        ? await apiClient.put(url, formData, { endpoint: "new" })
        : await apiClient.post(url, formData, { endpoint: "new" })

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
      <Card>
        <CardHeader>
          <CardTitle>{isUpdateMode ? "Atualizar Arquivo da Petição" : "Upload de Nova Petição"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            {isUpdateMode
              ? "Faça o upload de um novo arquivo PDF para substituir o arquivo atual da petição."
              : "Faça o upload de uma nova petição em formato PDF. Após o envio, você será redirecionado para visualizar as versões pública e privada do documento."
            }
          </p>

          <div
            className={`h-64 flex flex-col items-center justify-center border-2 rounded-md border-dashed p-6 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
              }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Arraste e solte um arquivo PDF aqui ou clique para selecionar
            </p>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />

            {fileName && (
              <div className="mb-4 text-sm">
                <span className="font-medium">Arquivo selecionado:</span> {fileName}
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="mb-4 text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-2" />
                <span>Upload realizado com sucesso!</span>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mb-4 text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>{errorMessage}</span>
              </div>
            )}

            {showBypassOption && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Validação de conteúdo falhou</p>
                    <p className="text-amber-700 mt-1">
                      O PDF não passou na validação automática. Você pode forçar o upload se tem certeza de que o arquivo está correto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleFileSelect} variant="outline" disabled={isUploading}>
                Selecionar Arquivo
              </Button>
              {fileName && (
                <>
                  <Button onClick={() => handleUpload()} disabled={isUploading}>
                    {isUploading ? "Enviando..." : isUpdateMode ? "Atualizar Arquivo" : "Enviar"}
                  </Button>
                  {showBypassOption && (
                    <Button
                      onClick={handleBypassUpload}
                      disabled={isUploading}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                    >
                      {isUploading ? "Enviando..." : "Força Upload"}
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
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </ProtectedLayout>
    }>
      <UploadPeticaoContent />
    </Suspense>
  )
}
