import { NextRequest } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 210

function failure(status: number, code: string, message: string) {
  return Response.json({ error: { code, message, request_id: crypto.randomUUID() } }, { status, headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      const supplied = new URL(origin)
      const expectedHost = request.headers.get("host") || request.nextUrl.host
      if (!["http:", "https:"].includes(supplied.protocol) || supplied.origin !== origin || supplied.host.toLowerCase() !== expectedHost.toLowerCase()) {
        return failure(403, "origin_rejected", "Submit documents from this application.")
      }
    } catch {
      return failure(403, "origin_rejected", "Submit documents from this application.")
    }
  }
  const type = request.headers.get("content-type") || ""
  if (!type.startsWith("multipart/form-data;")) return failure(415, "invalid_content_type", "Upload a PDF or DOCX using the upload form.")
  const maximum = 4 * 1024 * 1024 + 128 * 1024
  const length = Number(request.headers.get("content-length") || 0)
  if (!Number.isSafeInteger(length) || length < 0 || length > maximum) return failure(413, "file_too_large", "Upload a file of 4 MiB or less.")
  const backend = process.env.BACKEND_API_URL || "http://127.0.0.1:8000"
  const key = process.env.ANALYSIS_API_KEY || ""
  if (process.env.NODE_ENV === "production" && key.length < 32) {
    return failure(503, "proxy_not_configured", "The analysis service is not configured. You can still explore the sample report.")
  }
  const controller = new AbortController()
  const abort = () => controller.abort()
  request.signal.addEventListener("abort", abort, { once: true })
  const timer = setTimeout(abort, 205000)
  try {
    // Bound the public proxy before forwarding any upload to the backend.
    const reader = request.body?.getReader()
    if (!reader) return failure(400, "empty_upload", "Choose a document first.")
    const stopReading = () => { void reader.cancel() }
    controller.signal.addEventListener("abort", stopReading, { once: true })
    const chunks: Uint8Array[] = []
    let received = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        received += value.byteLength
        if (received > maximum) {
          await reader.cancel()
          return failure(413, "file_too_large", "Upload a file of 4 MiB or less.")
        }
        chunks.push(value)
      }
    } finally {
      controller.signal.removeEventListener("abort", stopReading)
      reader.releaseLock()
    }
    const body = new Uint8Array(received)
    let position = 0
    for (const chunk of chunks) { body.set(chunk, position); position += chunk.byteLength }
    const headers: Record<string, string> = { "Content-Type": type }
    if (key) headers["X-Analysis-Key"] = key
    // Vercel sets the forwarding header. Self-hosters must configure a trusted proxy.
    if (process.env.VERCEL) headers["X-Client-IP"] = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ""
    const response = await fetch(new URL("/analyze-contract", backend), {
      method: "POST", headers, body, signal: controller.signal, cache: "no-store",
    })
    const responseHeaders = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" })
    for (const name of ["X-Request-ID", "Retry-After"]) {
      const value = response.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    return new Response(await response.arrayBuffer(), { status: response.status, headers: responseHeaders })
  } catch {
    console.error("analysis_proxy_failed", { aborted: controller.signal.aborted })
    return failure(controller.signal.aborted ? 504 : 503, "service_unavailable", "The analysis service is unavailable or took too long. Please retry later.")
  } finally {
    clearTimeout(timer)
    request.signal.removeEventListener("abort", abort)
  }
}
