/** Same-origin proxy keeps the backend service key on the server. */
export const API_BASE_URL = "/api"
export const MAX_FILE_BYTES = 4 * 1024 * 1024

export function uploadError(file: Pick<File, "name" | "size">): string | null {
  if (!/\.(pdf|docx)$/i.test(file.name)) return "Choose a PDF or DOCX. Convert older .doc files first."
  if (file.size === 0) return "This file is empty."
  if (file.size > MAX_FILE_BYTES) return "Choose a file of 4 MiB or less."
  return null
}
