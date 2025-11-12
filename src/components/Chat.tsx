"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Send, Copy, Download, Loader2, AlertCircle, CheckCheck, Bot, UserIcon } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import Image from "next/image"
import { Message } from "@/lib/types"

interface ChatProps {
  initialQuery?: string
}

interface MessageWithStatus extends Message {
  status?: "sending" | "sent" | "error"
}

/** Normaliza la respuesta del backend a objetos + conserva columns/rows para debug */
function normalizeResult(result: any): {
  sql?: string
  message?: string
  error?: string
  objects: Record<string, any>[]
  columns: string[]
  rows: any[][]
} {
  const out = {
    sql: result?.sql,
    message: result?.message,
    error: result?.error,
    objects: [] as Record<string, any>[],
    columns: [] as string[],
    rows: [] as any[][]
  }

  // 1) { columns, rows } en la raíz
  if (Array.isArray(result?.columns) && Array.isArray(result?.rows)) {
    out.columns = result.columns
    out.rows = result.rows
    out.objects = result.rows.map((r: any[]) =>
      Object.fromEntries(out.columns.map((c: string, i: number) => [c, r[i]]))
    )
    return out
  }

  // 2) data: array<object>
  if (Array.isArray(result?.data) && result.data.length > 0 && typeof result.data[0] === "object") {
    out.objects = result.data
    out.columns = Object.keys(result.data[0] || {})
    out.rows = result.data.map((obj: any) => out.columns.map((c) => obj?.[c]))
    return out
  }

  // 3) data: { columns, rows }
  if (result?.data && Array.isArray(result.data.columns) && Array.isArray(result.data.rows)) {
    out.columns = result.data.columns
    out.rows = result.data.rows
    out.objects = result.data.rows.map((r: any[]) =>
      Object.fromEntries(out.columns.map((c: string, i: number) => [c, r[i]]))
    )
    return out
  }

  return out
}
/** Exportar a Excel (array de objetos) */
function exportExcel(objects: Record<string, any>[], nombreDocumento = "resultados") {
  if (!Array.isArray(objects) || objects.length === 0) return
  const worksheet = XLSX.utils.json_to_sheet(objects)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
  saveAs(blob, `${nombreDocumento}.xlsx`)
}

export default function Chat({ initialQuery }: ChatProps) {
  const [messages, setMessages] = useState<MessageWithStatus[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages])

  // Cargar consulta inicial desde el sidebar
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }, [initialQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // 1) mensaje del usuario (se queda en el log)
    const userMessage: MessageWithStatus = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestampISO: new Date().toISOString(),
      status: "sent",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // 2) placeholder de la respuesta (que luego reemplazamos por la real, pero NO borramos otras respuestas previas)
    const loadingId = (Date.now() + 1).toString()
    const loadingMsg: MessageWithStatus = {
      id: loadingId,
      type: "assistant",
      content: "Procesando tu consulta...",
      timestampISO: new Date().toISOString(),
      status: "sending",
      loading: true,
    }
    setMessages((prev) => [...prev, loadingMsg])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL_MCP || "http://localhost:3000/api"
      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      })
      const result = await response.json()
      const norm = normalizeResult(result)

      // 3) reemplazamos SOLO el placeholder por el resultado final de ESTA consulta
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: norm.message || result.message || "Consulta ejecutada.",
              sql: norm.sql,
              data: norm.objects, // <- array de objetos para tablas/Excel
              _meta: { columns: norm.columns, rows: norm.rows },
              error: norm.error || result.error,
              status: "sent",
              loading: false,
            }
            : m
        )
      )
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: "Error al conectar con el servidor",
              error: error instanceof Error ? error.message : "Error desconocido",
              status: "error",
              loading: false,
            }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "—"
    const k = key.toLowerCase()
    if (k.includes("fecha") || k.startsWith("fec_")) {
      const d = new Date(value)
      return isNaN(d.valueOf()) ? String(value) : d.toLocaleDateString("es-PE")
    }
    if (k === "estado") return value === "1" || value === 1 ? "Activo" : "Inactivo"
    if (k === "minutos_permiso") return `${value} min`
    return String(value)
  }

  const TypingIndicator = () => (
    <div className="flex items-center gap-2">
      <Bot className={`h-4 w-4 animate-pulse`} />
      <div className="typing-indicator">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  )

  const StatusIcon = ({ status }: { status?: string }) => {
    if (status === "sending") return <Loader2 className="w-4 h-4 animate-spin-smooth text-blue-500" />
    if (status === "sent") return <CheckCheck className="w-4 h-4 text-green-500" />
    if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />
    return null
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Asistente SQL · Justificaciones</h2>
      </div>

      {/* Chat Log */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
              <Image
                src="/baymax2.png"
                alt="Baymax"
                width={70}
                height={70}
                className="rounded-full"
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">¡Hola! Soy Expertito</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tu asistente de consultas SQL personal. ¿En qué puedo ayudarte hoy?
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.type === "user"
          const hasSQL = Boolean((msg as any).sql)
          const dataArr = Array.isArray((msg as any).data) ? ((msg as any).data as Record<string, any>[]) : []
          const headers = dataArr.length > 0 ? Object.keys(dataArr[0] || {}) : []

          return (
            <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-in-up`}>
              <div
                className={`max-w-5/6 ${isUser
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                  : "bg-slate-100 text-slate-900 rounded-2xl rounded-tl-none"
                  } px-4 py-3 ${msg.status === "error" ? "animate-shake" : ""}`}
              >
                {/* Burbuja de mensaje */}
                {msg.loading ? (
                  <TypingIndicator />
                ) : (
                  <>
                    <p className="flex gap-2 items-center text-sm">{isUser ? <UserIcon className="h-4 w-4" /> : <Bot className={`h-4 w-4`} />}  {msg.content}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className="text-xs opacity-70">
                        {new Date(msg.timestampISO).toLocaleTimeString("es-PE")}
                      </p>
                      {isUser && <StatusIcon status={msg.status} />}
                    </div>
                  </>
                )}

                {/* Bloque SQL (propio de este mensaje) */}
                {!msg.loading && hasSQL && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-300">Consulta SQL ejecutada</p>
                      <button
                        onClick={() => copyToClipboard((msg as any).sql!)}
                        className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </button>
                    </div>
                    <pre className="text-xs text-slate-300 overflow-x-auto">
                      <code>{(msg as any).sql}</code>
                    </pre>
                  </div>
                )}

                {/* Tabla de resultados (propia de este mensaje) */}
                {!msg.loading && dataArr.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Resultados ({dataArr.length})</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportExcel(dataArr, `resultados_${msg.id}`)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-200 hover:bg-green-300 text-slate-900 rounded transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Excel
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                          <tr>
                            {headers.map((key) => (
                              <th key={key} className="px-4 py-2 text-left font-semibold text-slate-900">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataArr.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              {headers.map((key) => (
                                <td key={key} className="px-2 py-2 text-slate-700 text-xs">
                                  {formatValue(key, row[key])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {dataArr.length > 10 && (
                        <div className="bg-slate-100 px-3 py-2 text-star text-xs text-slate-500">
                          Este resultado tiene {dataArr.length} registros
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error del mensaje */}
                {!msg.loading && msg.error && !dataArr.length && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <span className="text-sm font-medium">Error en la consulta</span>
                        <p className="text-xs mt-1">{msg.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-white">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para salto de línea)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin-smooth" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  )
}
