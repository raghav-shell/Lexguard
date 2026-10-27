// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "@/app/api/analyze-contract/route"

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
function request(body: BodyInit, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/analyze-contract", { method: "POST", body, headers })
}
describe("analysis proxy", () => {
  it("rejects foreign origins and wrong formats before contacting the backend", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher)
    expect((await POST(request("x", { origin: "https://other.example" }))).status).toBe(403)
    expect((await POST(request("x"))).status).toBe(415)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it("uses the public Host when Next normalizes its internal URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: true })))
    const response = await POST(request("--boundary--", { "content-type": "multipart/form-data; boundary=boundary", host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" }))
    expect(response.status).toBe(200)
  })
  it("bounds actual body length even if Content-Length is omitted", async () => {
    expect((await POST(request(new Uint8Array(11 * 1024 * 1024), { "content-type": "multipart/form-data; boundary=x" }))).status).toBe(413)
  })
  it("forwards the server-only key and preserves backend errors", async () => {
    vi.stubEnv("ANALYSIS_API_KEY", "a".repeat(40))
    const fetcher = vi.fn().mockResolvedValue(Response.json({ error: { code: "unreadable", message: "Unreadable file", request_id: "test" } }, { status: 422, headers: { "X-Request-ID": "test" } }))
    vi.stubGlobal("fetch", fetcher)
    const response = await POST(request("--boundary--", { "content-type": "multipart/form-data; boundary=boundary" }))
    expect(response.status).toBe(422)
    expect(response.headers.get("x-request-id")).toBe("test")
    expect(fetcher.mock.calls[0][1].headers["X-Analysis-Key"]).toBe("a".repeat(40))
    expect(await response.text()).not.toContain("a".repeat(40))
  })
})
