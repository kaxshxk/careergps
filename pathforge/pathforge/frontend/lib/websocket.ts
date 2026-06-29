export type AnalysisPhaseName =
  | 'PROCESSING'
  | 'JOB_INSIGHT'
  | 'SKILL_TREE'
  | 'GAP_MAP'
  | 'RESOURCES'
  | 'ROADMAP'
  | 'COMPLETE'
  | 'ERROR'

export interface AnalysisPhaseMessage {
  phase: AnalysisPhaseName
  message?: string
  data?: unknown
  session_id?: string
}

export function connectAnalysisWebSocket(
  sessionId: string,
  onPhase: (phase: AnalysisPhaseMessage) => void,
  onError?: (error: Error) => void
) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
  const wsUrl = `${backendUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/analyze/${sessionId}`
  let socket: WebSocket | null = null
  let reconnectAttempts = 0
  let closedManually = false

  const connect = () => {
    socket = new WebSocket(wsUrl)

    socket.onmessage = event => {
      const payload = JSON.parse(event.data) as AnalysisPhaseMessage
      onPhase(payload)
      if (payload.phase === 'COMPLETE') {
        closedManually = true
        socket?.close()
      }
    }

    socket.onerror = () => {
      onError?.(new Error('The analysis stream disconnected.'))
    }

    socket.onclose = () => {
      if (closedManually || reconnectAttempts >= 3) return
      reconnectAttempts += 1
      window.setTimeout(connect, reconnectAttempts * 1000)
    }
  }

  connect()

  return {
    close() {
      closedManually = true
      socket?.close()
    },
  }
}
