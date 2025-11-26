export type MessageType = "user" | "assistant"

export interface Message {
  id: string
  type: MessageType
  content: string
  timestampISO: string
  sql?: string
  data?: Record<string, unknown>[]
  error?: string
  loading?: boolean
  status?: "sending" | "sent" | "error"
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
}
