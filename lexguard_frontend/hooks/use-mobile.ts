"use client"
import { useSyncExternalStore } from "react"

const query = "(max-width: 767px), (pointer: coarse)"
function subscribe(listener: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}
function snapshot() { return window.matchMedia(query).matches }
export function useIsMobile() {
  return useSyncExternalStore(subscribe, snapshot, () => true)
}
