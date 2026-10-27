"""Bounded extraction in a disposable process with a hard deadline."""
import asyncio
import io
import multiprocessing
import sys
import time
import zipfile
from defusedxml import ElementTree as ET
import pdfplumber
from config import Settings
from errors import AppError


def extract_document(data: bytes, extension: str, settings: Settings) -> dict:
    parts, pages, warnings = [], [], []
    position = 0

    def append(text: str, number: int | None):
        nonlocal position
        if position + len(text) + 2 > settings.max_text_chars:
            raise AppError(413, "document_too_long", "This document exceeds 80,000 extracted characters. Split it into smaller documents.")
        start = position
        parts.append(text + "\n\n")
        position += len(text) + 2
        if number is not None:
            pages.append({"number": number, "start": start, "end": position})

    if extension == ".pdf":
        if not data.startswith(b"%PDF-"):
            raise AppError(422, "invalid_pdf", "This file is not a valid PDF. Export the original document as PDF and try again.")
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            if len(pdf.pages) > settings.max_pages:
                raise AppError(413, "too_many_pages", "The maximum is 80 PDF pages. Split this document before uploading.")
            blank = []
            for number, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                if not text.strip():
                    blank.append(number)
                append(text, number)
            if blank:
                warnings.append("No extractable text on PDF page(s): " + ", ".join(map(str, blank)) + ". These may be blank or scanned; text on scanned pages has not been reviewed. Use an OCR-processed copy for complete review.")
    else:
        if not zipfile.is_zipfile(io.BytesIO(data)):
            raise AppError(422, "invalid_docx", "This file is not a valid DOCX. Save it as a modern Word document and try again.")
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            entries = archive.infolist()
            if len(entries) > 2000 or sum(i.file_size for i in entries) > 30 * 1024 * 1024:
                raise AppError(413, "expanded_document_too_large", "The expanded Word document is too large. Export it as a text PDF instead.")
            names = [i.filename for i in entries]
            if len(names) != len(set(names)) or "word/document.xml" not in names:
                raise AppError(422, "invalid_docx", "The Word document structure is invalid.")
            info = archive.getinfo("word/document.xml")
            if info.file_size > 2 * 1024 * 1024 or info.flag_bits & 1:
                raise AppError(413, "invalid_docx_size", "The Word document is encrypted or its text is too large.")
            root = ET.fromstring(archive.read(info))
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            if root.find(".//w:del", ns) is not None or root.find(".//w:ins", ns) is not None:
                raise AppError(422, "tracked_changes", "Accept or reject tracked changes in Word before uploading, so the reviewed contract version is unambiguous.")
            for paragraph in root.findall(".//w:p", ns):
                content = []
                for node in paragraph.iter():
                    tag = node.tag.rsplit("}", 1)[-1]
                    if tag == "t" and node.text:
                        content.append(node.text)
                    elif tag in ("br", "cr", "tab"):
                        content.append("\n" if tag != "tab" else "\t")
                if content:
                    append("".join(content), None)
            warnings.append("Word review covers extracted body and table text. Headers, footers, comments, text in images, and embedded files are outside this extraction scope. Export a PDF if those contain contract terms.")
    text = "".join(parts).rstrip()
    if not text.strip():
        raise AppError(422, "no_readable_text", "No readable text was found. For scans, run OCR first and upload the searchable PDF.")
    return {"text": text, "pages": pages, "warnings": warnings}


def _worker(connection, data, extension, settings):
    try:
        if sys.platform == "linux":
            import resource
            resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024,) * 2)
        connection.send((True, extract_document(data, extension, settings)))
    except AppError as error:
        connection.send((False, (error.status, error.code, error.message)))
    except Exception:
        connection.send((False, (422, "unreadable_document", "The document is damaged, encrypted, or could not be read. Export a fresh PDF or DOCX and try again.")))
    finally:
        connection.close()


async def parse_document(data: bytes, extension: str, settings: Settings) -> dict:
    context = multiprocessing.get_context("spawn")
    reader, writer = context.Pipe(duplex=False)
    process = context.Process(target=_worker, args=(writer, data, extension, settings), daemon=True)
    process.start()
    writer.close()
    deadline = time.monotonic() + settings.parser_seconds
    try:
        while not reader.poll():
            if not process.is_alive():
                raise AppError(422, "parser_failed", "The document could not be processed. Export a simpler PDF or DOCX and try again.")
            if time.monotonic() >= deadline:
                raise AppError(422, "parser_timeout", "Reading this document took too long. Try a smaller or newly exported document.")
            await asyncio.sleep(0.02)
        try:
            ok, value = reader.recv()
        except EOFError:
            raise AppError(422, "parser_failed", "The document parser could not read this file.") from None
        if not ok:
            raise AppError(*value)
        return value
    finally:
        if process.is_alive():
            process.terminate()
        await asyncio.to_thread(process.join, 1)
        if process.is_alive():
            process.kill()
            await asyncio.to_thread(process.join, 1)
        reader.close()
