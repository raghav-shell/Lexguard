import pdfplumber
import io
import zipfile
import xml.etree.ElementTree as ET

async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF file robustly, preserving paragraph boundaries where possible.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"PDF extraction error: {e}")
        # In a real scenario we might throw a specific exception.
        # For the hackathon MVP, returning whatever we got or empty string.
    return text.strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extracts text from a DOCX file without external dependencies by parsing word/document.xml.
    """
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            doc_xml = z.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            # Find all paragraph elements (w:p) inside the document XML
            paragraphs = []
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            for p in root.findall('.//w:p', ns):
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n\n".join(paragraphs)
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""
