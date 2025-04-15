"use client"

import type React from "react"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { FormSectionWrapper } from "../ui/form-section-wrapper"

interface ProfilePhotoSectionProps {
  profilePhoto: string | null
  isPhotoUploading: boolean
  participantId: string | null
  onFileUpload: (file: File) => Promise<void>
}

export function ProfilePhotoSection({
  profilePhoto,
  isPhotoUploading,
  participantId,
  onFileUpload,
}: ProfilePhotoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !participantId) return

    await onFileUpload(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <FormSectionWrapper id="item-0" title="Foto do Perfil">
      <div className="flex flex-col items-center space-y-4 pt-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
          {profilePhoto ? (
            <Image
              src={profilePhoto || "/placeholder.svg"}
              alt="Foto de perfil"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src="/images/imagem-placeholder.png"
              alt="Foto de perfil padrão"
              width={128}
              height={128}
              className="object-cover w-full h-full bg-gray-100"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            disabled={isPhotoUploading || !participantId}
            className="flex items-center gap-2"
          >
            {isPhotoUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>Alterar Foto</span>
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Clique no botão acima para enviar ou alterar a foto de perfil
        </p>
      </div>
    </FormSectionWrapper>
  )
}
