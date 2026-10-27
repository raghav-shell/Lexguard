import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
afterEach(cleanup)
if (typeof HTMLElement !== "undefined") Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value() {} })

if (typeof window !== "undefined") {
  window.scrollTo = () => {}
  window.matchMedia = query => ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false } })
}
