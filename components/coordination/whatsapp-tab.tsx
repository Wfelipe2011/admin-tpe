"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { AlertTriangle, CheckCircle2, MessageCircle, QrCode, RefreshCw, Smartphone, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import type { WhatsappQr, WhatsappStatus } from "@/types/coordination"

/**
 * Diagnóstico da instância do WhatsApp (Z-API) e reconexão.
 *
 * O QR Code expira em ~20s e o Z-API recomenda polling a cada 10-20s, no máximo
 * 3 chamadas antes de oferecer "Gerar novo QR Code". A tela segue exatamente
 * isso para não queimar requisições à toa.
 */
const QR_POLL_MS = 15_000
const MAX_QR_CALLS = 3
const STATUS_POLL_MS = 30_000

type Pill = { label: string; className: string; icon: React.ReactNode }

function statusPill(status: WhatsappStatus | null, loading: boolean): Pill {
  if (loading && !status) return { label: "Consultando…", className: "bg-gray-100 text-[#666666]", icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" /> }
  if (!status) return { label: "Sem resposta", className: "bg-gray-100 text-[#666666]", icon: <AlertTriangle className="h-3.5 w-3.5" /> }
  if (!status.reachable)
    return { label: "Z-API indisponível", className: "bg-[#FEF2F2] text-[#B42318]", icon: <XCircle className="h-3.5 w-3.5" /> }
  if (status.connected) return { label: "Conectado", className: "bg-[#ECFDF3] text-[#027A48]", icon: <CheckCircle2 className="h-3.5 w-3.5" /> }
  return { label: "Desconectado", className: "bg-[#FFFAEB] text-[#B54708]", icon: <AlertTriangle className="h-3.5 w-3.5" /> }
}

export function WhatsappTab() {
  const [status, setStatus] = useState<WhatsappStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [qr, setQr] = useState<WhatsappQr | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // contador de chamadas do ciclo atual de QR, para respeitar o limite do Z-API
  const [qrCalls, setQrCalls] = useState(0)
  const qrTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadStatus = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const res = await apiClient.get<WhatsappStatus>("/coordination/whatsapp-status")
      setStatus(res)
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Não foi possível consultar o Z-API"
      setStatus({ reachable: false, connected: false, smartphoneConnected: null, detail: null, message: msg })
      if (!quiet) toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
    const timer = setInterval(() => loadStatus(true), STATUS_POLL_MS)
    return () => clearInterval(timer)
  }, [loadStatus])

  //Qr some sozinho quando a instância volta a ficar conectada.
  useEffect(() => {
    if (status?.connected) {
      setQrCalls(0)
      setQr(null)
    }
  }, [status?.connected])

  useEffect(() => {
    return () => {
      if (qrTimer.current) clearTimeout(qrTimer.current)
    }
  }, [])

  /** devolve false quando o limite de chamadas já foi atingido */
  const loadQr = useCallback(
    async (quiet = false) => {
      if (qrCalls >= MAX_QR_CALLS) return false
      setQrCalls((n) => n + 1)
      if (!quiet) setQrLoading(true)
      try {
        const res = await apiClient.get<WhatsappQr>("/coordination/whatsapp-qrcode")
        setQr(res)
      } catch (e: any) {
        const msg = e?.response?.data?.message || "Não foi possível obter o QR Code"
        setQr({ state: "unavailable", message: msg })
        if (!quiet) toast.error(msg)
      } finally {
        setQrLoading(false)
      }
      return true
    },
    [qrCalls],
  )

  const startQr = useCallback(async () => {
    if (qrTimer.current) clearTimeout(qrTimer.current)
    setQrCalls(0)
    await loadQr()
  }, [loadQr])

  const pollQr = useCallback(async () => {
    if (qrTimer.current) clearTimeout(qrTimer.current)
    const called = await loadQr(true)
    // limite do Z-API: para de pedir e deixa "Gerar novo QR Code" disponível
    if (!called || qrCalls + 1 >= MAX_QR_CALLS) return
    qrTimer.current = setTimeout(() => void pollQr(), QR_POLL_MS)
  }, [loadQr, qrCalls])

  const exhausted = qrCalls >= MAX_QR_CALLS

  const pill = statusPill(status, loading)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#333333]">Instância do WhatsApp</h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Estado real da instância, consultado direto no Z-API. Não é o status interno de circuit breaker.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadStatus()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${pill.className}`}>
            {pill.icon}
            {pill.label}
          </span>

          {status?.reachable && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[#666666]">
              <Smartphone className="h-3.5 w-3.5" />
              {status.smartphoneConnected === null ? "Celular: não informado" : status.smartphoneConnected ? "Celular conectado" : "Celular sem internet"}
            </span>
          )}
        </div>

        {status && !status.reachable && status.message && (
          <div className="flex items-start gap-2 rounded-lg bg-[#FEF2F2] p-3 text-xs text-[#B42318]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{status.message}</span>
          </div>
        )}

        {status?.reachable && !status.connected && status.detail && (
          <div className="flex items-start gap-2 rounded-lg bg-[#FFFAEB] p-3 text-xs text-[#B54708]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{status.detail}</span>
          </div>
        )}
      </div>

      {status?.reachable && !status.connected && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#374192]/10 text-[#374192]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#333333]">Reconectar</h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Leia o QR Code com o WhatsApp do mesmo número. Ele expira em ~20s e é atualizado automaticamente.
              </p>
            </div>
          </div>

          {!qr && (
            <Button size="sm" onClick={() => void startQr()} disabled={qrLoading}>
              <QrCode className="h-3.5 w-3.5 mr-1.5" />
              {qrLoading ? "Gerando…" : "Gerar QR Code"}
            </Button>
          )}

          {qr?.state === "qrcode" && (
            <div className="space-y-3">
              <div className="inline-block rounded-lg border border-gray-200 bg-white p-3">
                {/* base64 puro do Z-API; sem prefixo data: */}
                <img src={`data:image/png;base64,${qr.qrcode}`} alt="QR Code de reconexão do WhatsApp" className="h-56 w-56" />
              </div>
              <p className="text-xs text-[#666666]">
                Tentativa {qrCalls} de {MAX_QR_CALLS}. Ao conectar, o aviso some sozinho.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void pollQr()} disabled={qrLoading}>
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${qrLoading ? "animate-spin" : ""}`} />
                  Atualizar agora
                </Button>
                <Button variant="outline" size="sm" onClick={() => void startQr()}>
                  Gerar novo QR Code
                </Button>
              </div>
            </div>
          )}

          {qr?.state === "challenge" && (
            <div className="flex items-start gap-2 rounded-lg bg-[#FFFAEB] p-3 text-xs text-[#B54708]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{qr.message}</span>
            </div>
          )}

          {qr?.state === "unavailable" && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-100 p-3 text-xs text-[#666666]">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{qr.message}</span>
            </div>
          )}

          {qr?.state !== "qrcode" && exhausted && (
            <p className="text-xs text-[#666666]">Limite de {MAX_QR_CALLS} chamadas atingido. Gere um novo QR Code para continuar.</p>
          )}
        </div>
      )}
    </div>
  )
}