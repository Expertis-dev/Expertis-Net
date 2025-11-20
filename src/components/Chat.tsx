"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Send, Copy, Download, Loader2, AlertCircle, CheckCheck, Bot, UserIcon } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

// Si ya tienes Message en "@/lib/types", déjalo.
// Si no, descomenta este tipo local y quita la import.
// import type { Message } from "@/lib/types"
type LocalMessage = {
  id: string
  type: "user" | "assistant"
  content: string
  timestampISO: string
  // Campos opcionales que solemos adjuntar en la respuesta:
  sql?: string
  data?: Record<string, unknown>[]
  _meta?: { columns: string[]; rows: unknown[][] }
  error?: string
  loading?: boolean
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Message as ExternalMessage } from "@/lib/types"
type Message = ExternalMessage | LocalMessage

/** ==== Tipos fuertes para la API y normalización ==== */
type ApiRows = unknown[][]
type ApiColumns = string[]

interface ApiAskResponse {
  sql?: string
  message?: string
  error?: string
  // tres formas posibles:
  columns?: ApiColumns
  rows?: ApiRows
  data?: unknown[] | { columns?: ApiColumns; rows?: ApiRows }
}

type NormalizedResult = {
  sql?: string
  message?: string
  error?: string
  objects: Record<string, unknown>[]
  columns: string[]
  rows: unknown[][]
}

interface ChatProps {
  initialQuery?: string
}

type MessageStatus = "sending" | "sent" | "error" | undefined
type MessageWithStatus = Message & {
  status?: MessageStatus
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ")

/** ==== Normaliza la respuesta del backend a un formato consistente ==== */
function normalizeResult(result: ApiAskResponse): NormalizedResult {
  const out: NormalizedResult = {
    sql: result?.sql,
    message: result?.message,
    error: result?.error,
    objects: [],
    columns: [],
    rows: [],
  }

  // Caso 1: { columns, rows } en la raíz
  if (Array.isArray(result?.columns) && Array.isArray(result?.rows)) {
    out.columns = result.columns as string[]
    out.rows = result.rows as unknown[][]
    out.objects = out.rows.map((r) => Object.fromEntries(out.columns.map((c, i) => [c, r[i]])))
    return out
  }

  // Caso 2: data: array<object>
  if (Array.isArray(result?.data) && result.data.length > 0 && typeof result.data[0] === "object") {
    const objs = result.data as Record<string, unknown>[]
    out.objects = objs
    out.columns = Object.keys(objs[0] ?? {})
    out.rows = objs.map((obj) => out.columns.map((c) => obj?.[c]))
    return out
  }

  // Caso 3: data: { columns, rows }
  if (result?.data && typeof result.data === "object" && !Array.isArray(result.data)) {
    const d = result.data as { columns?: ApiColumns; rows?: ApiRows }
    if (Array.isArray(d.columns) && Array.isArray(d.rows)) {
      out.columns = d.columns
      out.rows = d.rows
      out.objects = d.rows.map((r) => Object.fromEntries(out.columns.map((c, i) => [c, r[i]])))
      return out
    }
  }

  return out
}

/** ==== Exportar a Excel (array de objetos) ==== */
function exportExcel(objects: Record<string, unknown>[], nombreDocumento = "resultados") {
  if (!Array.isArray(objects) || objects.length === 0) return
  const worksheet = XLSX.utils.json_to_sheet(objects)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
  saveAs(blob, `${nombreDocumento}.xlsx`)
}

/** ==== Componentes auxiliares UI ==== */
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-2">
    <Bot className="h-4 w-4 animate-pulse" />
    <div className="flex items-center gap-1">
      <span className="size-1.5 rounded-full bg-current/70 animate-bounce [animation-delay:-0.2s]" />
      <span className="size-1.5 rounded-full bg-current/70 animate-bounce [animation-delay:-0.1s]" />
      <span className="size-1.5 rounded-full bg-current/70 animate-bounce" />
    </div>
  </div>
)

const StatusIcon: React.FC<{ status?: MessageStatus }> = ({ status }) => {
  if (status === "sending") return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
  if (status === "sent") return <CheckCheck className="w-4 h-4 text-green-500" />
  if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />
  return null
}

/** ==== Formateo de celdas ==== */
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—"
  const k = key.toLowerCase()
  if (k.includes("fecha") || k.startsWith("fec_")) {
    const d = new Date(value as string)
    return Number.isNaN(d.valueOf()) ? String(value) : d.toLocaleDateString("es-PE")
  }
  if (k === "estado") return (value === "1" || value === 1) ? "Activo" : "Inactivo"
  if (k === "minutos_permiso") return `${value as number} min`
  return String(value)
}

export default function Chat({ initialQuery }: ChatProps) {
  const [messages, setMessages] = useState<MessageWithStatus[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const logRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll al fondo cuando cambian los mensajes
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages])

  // Carga de consulta inicial
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery)
      setTimeout(() => textareaRef.current?.focus(), 0)
    }
  }, [initialQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // 1) mensaje del usuario
    const userMessage: MessageWithStatus = {
      id: crypto.randomUUID(),
      type: "user",
      content: input,
      timestampISO: new Date().toISOString(),
      status: "sent",
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // 2) placeholder de respuesta
    const loadingId = crypto.randomUUID()
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

      const result = (await response.json()) as ApiAskResponse
      const norm = normalizeResult(result)

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: norm.message || result.message || "Consulta ejecutada.",
              sql: norm.sql,
              data: norm.objects,
              _meta: { columns: norm.columns, rows: norm.rows },
              error: norm.error || result.error,
              status: norm.error ? "error" : "sent",
              loading: false,
            }
            : m
        )
      )
    } catch (error) {
      const human = error instanceof Error ? error.message : "Error desconocido"
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
              ...m,
              content: "Error al conectar con el servidor",
              error: human,
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
      void handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  /** Derivados para UI */
  const hasMessages = messages.length > 0

  return (
    <div className={cn(
      "flex-1 flex min-h-0 w-full max-w-7xl mx-auto flex-col",
      "bg-gradient-to-b from-slate-50 to-white",
      "dark:from-black/30 dark:to-slate-950"
    )}>
      <div className="w-full  flex flex-col min-h-0 border-x border-slate-200 dark:border-neutral-800">
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-10",
          "backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white",
          "dark:supports-[backdrop-filter]:bg-black dark:bg-black/90",
          "px-6 py-4 border-b border-slate-200 dark:border-neutral-800"
        )}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Asistente SQL · Justificaciones</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Conecta preguntas en lenguaje natural con SQL.</p>
        </header>

        {/* Chat Log */}
        <main
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4"
        >
          {!hasMessages && (
            <div className="text-center py-16">
              <div className="mx-auto mb-6 size-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 p-0.5">
                <div className="size-full rounded-full bg-white dark:bg-slate-950 grid place-items-center">
                  <Image
                    src="/baymax2.png"
                    alt="Baymax"
                    width={72}
                    height={72}
                    className="rounded-full"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">¡Hola! Soy Expertito</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Pregúntame en español y te doy el SQL y los resultados 🙌
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.type === "user"
            const sql = (msg as MessageWithStatus).sql
            const rows = Array.isArray((msg as MessageWithStatus).data)
              ? ((msg as MessageWithStatus).data as Record<string, unknown>[])
              : []
            const headers = rows.length > 0 ? Object.keys(rows[0] ?? {}) : []

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    "border",
                    isUser
                      ? "dark:bg-slate-950 bg-slate-700 text-white border-blue-700 rounded-tr-none"
                      : "bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-tl-none",
                    msg.status === "error" && "ring-1 ring-red-400/60"
                  )}
                >
                  {/* Burbuja de mensaje */}
                  {msg.loading ? (
                    <TypingIndicator />
                  ) : (
                    <>
                      <p className="flex gap-2 items-start text-sm leading-relaxed">
                        {isUser ? <UserIcon className="h-4 w-4 mt-0.5" /> : <Bot className="h-4 w-4 mt-0.5" />}
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      </p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <p className={cn(
                          "text-[11px]",
                          isUser ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {new Date(msg.timestampISO).toLocaleTimeString("es-PE")}
                        </p>
                        {isUser && <StatusIcon status={msg.status} />}
                      </div>
                    </>
                  )}

                  {/* Bloque SQL */}
                  {!msg.loading && sql && (
                    <div className={cn(
                      "mt-3 p-3 rounded-lg border text-xs",
                      "bg-slate-900 text-slate-200 border-slate-800"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-300">Consulta SQL ejecutada</p>
                        <button
                          onClick={() => copyToClipboard(sql)}
                          className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded transition-colors"
                          type="button"
                          aria-label="Copiar SQL"
                          title="Copiar SQL"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar
                        </button>
                      </div>
                      <pre className="overflow-x-auto">
                        <code>{sql}</code>
                      </pre>
                    </div>
                  )}

                  {/* Tabla de resultados */}
                  {!msg.loading && rows.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          isUser ? "text-white" : "text-slate-700 dark:text-slate-200"
                        )}>
                          Resultados ({rows.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportExcel(rows as Record<string, unknown>[], `resultados_${msg.id}`)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer",
                              "bg-emerald-200 hover:bg-emerald-300 text-emerald-900",
                              "dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-200"
                            )}
                            type="button"
                            aria-label="Exportar a Excel"
                            title="Exportar a Excel"
                          >
                            <Download className="w-3 h-3" />
                            Excel
                          </button>
                        </div>
                      </div>

                      <div className={cn(
                        "overflow-x-auto rounded-lg border",
                        "border-slate-200 dark:border-slate-700"
                      )}>
                        <table className="w-full text-sm">
                          <thead className={cn(
                            "sticky top-0",
                            "bg-slate-100 border-b border-slate-200 text-slate-900",
                            "dark:bg-slate-700/60 dark:text-slate-100 dark:border-slate-700"
                          )}>
                            <tr>
                              {headers.map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-semibold">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.slice(0, 10).map((row, idx) => (
                              <tr
                                key={idx}
                                className={cn(
                                  idx % 2 === 0
                                    ? "bg-white dark:bg-slate-900/40"
                                    : "bg-slate-50 dark:bg-slate-900/20"
                                )}
                              >
                                {headers.map((key) => (
                                  <td key={key} className="px-3 py-2 text-slate-700 dark:text-slate-300 text-xs">
                                    {formatValue(key, (row as Record<string, unknown>)[key])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {rows.length > 10 && (
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                            Mostrando 10 de {rows.length} registros
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {!msg.loading && msg.error && rows.length === 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-900/30">
                      <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-5 h-5 shrink-0" />
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
        </main>

        {/* Input */}
        <footer
          className={cn(
            "sticky bottom-0 z-10",
            "backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white",
            "dark:supports-[backdrop-filter]:bg-black/40 dark:bg-black/40",
            "border-y border-slate-200 dark:border-neutral-800 p-3 md:p-4"
          )}
        >
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta... (Enter para enviar, Shift+Enter para salto de línea)"
              className={cn(
                "flex-1 px-4 py-2 rounded-lg resize-none",
                "border focus:outline-none focus:ring-1",
                "border-slate-300 focus:ring-blue-500 dark:focus:ring-neutral-500",
                "dark:border-neutral-800 dark:bg-black/10 dark:text-slate-100"
              )}
              rows={2}
              disabled={loading}
              aria-label="Entrada de consulta"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={cn(
                "px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2",
                "bg-slate-700 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-600 cursor-pointer",
                "text-white transition-colors"
              )}
              aria-label="Enviar"
              title="Enviar"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
